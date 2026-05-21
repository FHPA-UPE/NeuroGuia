'use client'
import { useState, useEffect } from 'react'

export function useTTS(text: string | null): { isSpeaking: boolean; beakOpen: boolean } {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [beakOpen,   setBeakOpen]   = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    if (text === null) {
      window.speechSynthesis.cancel()
      return
    }

    window.speechSynthesis.cancel()

    const utterance  = new SpeechSynthesisUtterance(text)
    utterance.lang   = 'pt-BR'
    utterance.rate   = 0.95
    utterance.pitch  = 1.1

    let boundaryFired  = false
    let fallbackId:    ReturnType<typeof setInterval>  | null = null
    let fallbackCheck: ReturnType<typeof setTimeout>   | null = null
    let beakCloseId:   ReturnType<typeof setTimeout>   | null = null
    let fallbackBeak   = false

    const stopAll = () => {
      if (fallbackId)    { clearInterval(fallbackId);   fallbackId    = null }
      if (fallbackCheck) { clearTimeout(fallbackCheck); fallbackCheck = null }
      if (beakCloseId)   { clearTimeout(beakCloseId);   beakCloseId   = null }
    }

    utterance.onstart = () => {
      setIsSpeaking(true)
      fallbackCheck = setTimeout(() => {
        if (!boundaryFired) {
          fallbackId = setInterval(() => {
            fallbackBeak = !fallbackBeak
            setBeakOpen(fallbackBeak)
          }, 350)
        }
      }, 600)
    }

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (event.name !== 'word') return
      boundaryFired = true
      if (fallbackId) { clearInterval(fallbackId); fallbackId = null }
      if (beakCloseId) { clearTimeout(beakCloseId); beakCloseId = null }
      setBeakOpen(true)
      beakCloseId = setTimeout(() => setBeakOpen(false), 180)
    }

    const finish = () => {
      stopAll()
      setIsSpeaking(false)
      setBeakOpen(false)
    }

    utterance.onend   = finish
    utterance.onerror = finish

    window.speechSynthesis.speak(utterance)

    return () => {
      stopAll()
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setBeakOpen(false)
    }
  }, [text])

  return { isSpeaking, beakOpen }
}
