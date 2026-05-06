'use client'
import { useState } from 'react'

interface ChatInputProps {
  onSubmit: (message: string) => void
  disabled: boolean
}

export default function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    if (value.trim()) {
      onSubmit(value.trim())
      setValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-[#2D5016]/10">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Digite sua mensagem..."
        aria-label="Mensagem para OLLIE"
        className="flex-1 bg-transparent text-base text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 focus:outline-none disabled:opacity-40"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        aria-label="Enviar mensagem"
        className="flex-shrink-0 w-9 h-9 rounded-full bg-[#2D5016] text-white flex items-center justify-center transition-all disabled:opacity-25 hover:bg-[#3a6420] active:scale-95"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <path d="M7.5 13V2M2.5 7 7.5 2l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
