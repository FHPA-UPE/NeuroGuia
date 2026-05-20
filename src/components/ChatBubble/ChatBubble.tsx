'use client'
import { useState } from 'react'
import type { ChatMessage } from '@/types/chat'

interface Props {
  message: ChatMessage
  onFeedback: (messageId: string, rating: 'up' | 'down') => void
}

export function ChatBubble({ message, onFeedback }: Props) {
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const isAssistant = message.role === 'assistant'

  const hasSources = isAssistant && message.sources && message.sources.length > 0
  const sourceCount = message.sources?.length ?? 0

  return (
    <div className={`group flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-base leading-relaxed ${
          isAssistant
            ? 'bg-pure-white border border-mist text-midnight rounded-tl-sm'
            : 'bg-calm-indigo text-white rounded-tr-sm'
        }`}
      >
        <p className="text-base">{message.content}</p>

        {hasSources && (
          <div className="mt-2">
            <button
              onClick={() => setSourcesOpen(o => !o)}
              className="text-slate text-sm flex items-center gap-1 hover:text-calm-indigo transition-colors"
              aria-expanded={sourcesOpen}
            >
              📄 {sourceCount} {sourceCount === 1 ? 'fonte' : 'fontes'} {sourcesOpen ? '▴' : '▾'}
            </button>
            {sourcesOpen && (
              <p className="text-sm text-slate mt-1">
                {message.sources!.join(' · ')}
              </p>
            )}
          </div>
        )}

        {isAssistant && (
          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              aria-label="Resposta útil"
              onClick={() => onFeedback(message.id, 'up')}
              className="text-lg hover:scale-110 transition-transform"
            >
              👍
            </button>
            <button
              aria-label="Resposta não útil"
              onClick={() => onFeedback(message.id, 'down')}
              className="text-lg hover:scale-110 transition-transform"
            >
              👎
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
