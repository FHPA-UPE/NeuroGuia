'use client'

import { useEffect, useState } from 'react'

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.+?)\]\(.*?\)/g, '$1')
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/___(.+?)___/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/-{3,}/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

type TTSSignal = {
  cancelled: boolean
  audio?: HTMLAudioElement
  intervalId?: ReturnType<typeof setInterval>
}

async function pipeChunksToSourceBuffer(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  sourceBuffer: SourceBuffer,
  mediaSource: MediaSource,
  signal: TTSSignal
): Promise<void> {
  // Wait for updateend OR reject on sourceBuffer error (prevents deadlock)
  const waitForUpdate = () =>
    new Promise<void>((resolve, reject) => {
      const onEnd = () => { cleanup(); resolve() }
      const onErr = () => { cleanup(); reject(new Error('SourceBuffer error')) }
      function cleanup() {
        sourceBuffer.removeEventListener('updateend', onEnd)
        sourceBuffer.removeEventListener('error', onErr)
      }
      sourceBuffer.addEventListener('updateend', onEnd, { once: true })
      sourceBuffer.addEventListener('error', onErr, { once: true })
    })

  while (true) {
    if (signal.cancelled) break

    const { done, value } = await reader.read()
    if (signal.cancelled || done) break

    if (sourceBuffer.updating) await waitForUpdate()
    if (signal.cancelled) break

    sourceBuffer.appendBuffer(new Uint8Array(value))
    await waitForUpdate()
  }

  try { mediaSource.endOfStream() } catch { /* já encerrado */ }
}

async function playOpenAITTS(
  text: string,
  signal: TTSSignal,
  setBeakOpen: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
  if (signal.cancelled) return

  const response = await fetch('http://localhost:8000/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Backend retornou:', errorText)
    throw new Error(`Erro ${response.status}: ${errorText}`)
  }

  if (signal.cancelled) return

  // Interval stored in signal so cleanup() can always clear it as a safety net
  const mouthInterval = setInterval(() => setBeakOpen(prev => !prev), 180)
  signal.intervalId = mouthInterval

  const canStream =
    typeof MediaSource !== 'undefined' &&
    MediaSource.isTypeSupported('audio/mpeg') &&
    !!response.body

  if (!canStream) {
    const blob = await response.blob()
    if (signal.cancelled) { clearInterval(mouthInterval); return }

    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    signal.audio = audio

    await new Promise<void>((resolve) => {
      const finish = () => {
        clearInterval(mouthInterval)
        setBeakOpen(false)
        URL.revokeObjectURL(url)
        resolve()
      }
      audio.onended = finish
      audio.onerror = finish
      audio.play().catch(finish)
    })
    return
  }

  // Streaming path: plays as chunks arrive via MediaSource
  const mediaSource = new MediaSource()
  const url = URL.createObjectURL(mediaSource)
  const audio = new Audio(url)
  signal.audio = audio
  const reader = response.body!.getReader()

  await new Promise<void>((resolve) => {
    const finish = () => {
      clearInterval(mouthInterval)
      setBeakOpen(false)
      URL.revokeObjectURL(url)
      resolve()
    }

    audio.onended = finish
    audio.onerror = finish
    mediaSource.addEventListener('error', () => finish())

    mediaSource.addEventListener('sourceopen', () => {
      let sourceBuffer: SourceBuffer
      try {
        sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg')
      } catch {
        finish()
        return
      }

      sourceBuffer.addEventListener('error', () => finish())

      audio.play().catch(finish)

      pipeChunksToSourceBuffer(reader, sourceBuffer, mediaSource, signal).catch((err) => {
        console.error('Erro no streaming TTS:', err)
        try { mediaSource.endOfStream('decode') } catch { /* já encerrado */ }
        finish()
      })
    })
  })
}

export function useTTS(
  text: string | null,
  playKey?: unknown
): {
  isSpeaking: boolean
  beakOpen: boolean
} {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [beakOpen, setBeakOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (text === null) return

    const signal: TTSSignal = { cancelled: false }

    const run = async () => {
      try {
        setIsSpeaking(true)
        if (signal.cancelled) return

        const spokenText = stripMarkdown(text)
        await playOpenAITTS(spokenText, signal, setBeakOpen)

        if (!signal.cancelled) {
          setIsSpeaking(false)
        }
      } catch (error) {
        console.error('Erro TTS:', error)
        setBeakOpen(false)
        setIsSpeaking(false)
      }
    }

    run()

    return () => {
      signal.cancelled = true
      // Safety net: always clear interval even if finish() was never called
      if (signal.intervalId) clearInterval(signal.intervalId)
      if (signal.audio) {
        signal.audio.pause()
        signal.audio.currentTime = 0
      }
      setBeakOpen(false)
      setIsSpeaking(false)
    }
  }, [text, playKey])

  return { isSpeaking, beakOpen }
}
