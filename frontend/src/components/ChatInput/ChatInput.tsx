'use client'
import { useState } from 'react'

interface ChatInputProps {
  onSubmit: (message: string) => void
  disabled: boolean
}

export default function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value.trim())
      setValue('')
    }
  }

  return (
    <div className="flex gap-2 p-4 border-t border-[#2D5016]/20">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Digite sua mensagem..."
        aria-label="Mensagem para OLLIE"
        className="flex-1 rounded-full border-2 border-[#2D5016] px-4 py-2 text-lg font-[Atkinson_Hyperlegible] focus:outline-none focus:ring-2 focus:ring-[#C8860A] disabled:opacity-50"
      />
    </div>
  )
}
