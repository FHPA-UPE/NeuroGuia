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

function playAudio(
  src: string,
  signal: { cancelled: boolean; audio?: HTMLAudioElement }
): Promise<void> {
  return new Promise((resolve) => {
    if (signal.cancelled) {
      resolve()
      return
    }

    const audio = new Audio(src)

    signal.audio = audio

    const done = () => resolve()

    audio.onended = done
    audio.onerror = done

    audio.play().catch(done)
  })
}

async function playOpenAITTS(
  text: string,
  signal: { cancelled: boolean; audio?: HTMLAudioElement }
): Promise<void> {
  if (signal.cancelled) return

  const response = await fetch(
    'http://localhost:8000/tts',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text
      })
    }
  )

  if (!response.ok) {
    const errorText = await response.text()

    console.error('Backend retornou:', errorText)

    throw new Error(
      `Erro ${response.status}: ${errorText}`
    )
  }

  const blob = await response.blob()

  if (signal.cancelled) return

  const url = URL.createObjectURL(blob)

  const audio = new Audio(url)

  signal.audio = audio

  await new Promise<void>((resolve) => {
    audio.onended = () => {
      URL.revokeObjectURL(url)
      resolve()
    }

    audio.onerror = () => {
      URL.revokeObjectURL(url)
      resolve()
    }

    audio.play().catch(resolve)
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

    const signal: {
      cancelled: boolean
      audio?: HTMLAudioElement
    } = {
      cancelled: false
    }

    const run = async () => {
      try {
        setIsSpeaking(true)

        if (signal.cancelled) return

        const spokenText = stripMarkdown(text)

        setBeakOpen(true)

        await playOpenAITTS(
          spokenText,
          signal
        )

        setBeakOpen(false)

        if (signal.cancelled) return

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

      if (signal.audio) {
        signal.audio.pause()
        signal.audio.currentTime = 0
      }

      setBeakOpen(false)
      setIsSpeaking(false)
    }
  }, [text, playKey])

  return {
    isSpeaking,
    beakOpen
  }
}