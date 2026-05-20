'use client'
import { useState } from 'react'

interface Props {
  onSend: (text: string) => void
  disabled: boolean
  isListening: boolean
  isSpeaking: boolean
  speechSupported: boolean
  onToggleListen: () => void
  onToggleSpeak: () => void
  transcript?: string
}

export function ChatInput({
  onSend,
  disabled,
  isListening,
  isSpeaking,
  speechSupported,
  onToggleListen,
  onToggleSpeak,
  transcript = '',
}: Props) {
  const [text, setText] = useState('')

  const value = transcript || text

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    onSend(value.trim())
    setText('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 bg-pure-white border-t border-mist"
    >
      {speechSupported && (
        <button
          type="button"
          aria-label={isListening ? 'Parar gravação' : 'Iniciar microfone'}
          onClick={onToggleListen}
          className={`w-11 h-11 rounded-btn flex items-center justify-center text-xl transition-colors ${
            isListening
              ? 'bg-crimson text-white animate-pulse'
              : 'bg-frost hover:bg-mist text-midnight'
          }`}
        >
          🎤
        </button>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => setText(e.target.value)}
        placeholder="Digite ou fale sua dúvida…"
        disabled={disabled}
        className="flex-1 rounded-btn border border-mist px-4 py-2.5 text-base bg-ice-white disabled:opacity-60 focus-visible:outline-calm-indigo"
        aria-label="Mensagem para o OWL"
      />
      {speechSupported && (
        <button
          type="button"
          aria-label={isSpeaking ? 'Silenciar OWL' : 'OWL falar em voz alta'}
          onClick={onToggleSpeak}
          className={`w-11 h-11 rounded-btn flex items-center justify-center text-xl transition-colors ${
            isSpeaking
              ? 'bg-calm-indigo text-white'
              : 'bg-frost hover:bg-mist text-midnight'
          }`}
        >
          🔊
        </button>
      )}
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Enviar mensagem"
        className="bg-calm-indigo hover:bg-deep-indigo text-white rounded-btn py-2.5 px-5 font-semibold disabled:opacity-50 transition-colors min-h-[44px]"
      >
        Enviar
      </button>
    </form>
  )
}
