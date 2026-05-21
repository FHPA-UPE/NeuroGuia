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
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}>
      <article
        aria-label={`Mensagem de ${isAssistant ? 'OWL' : 'você'}`}
        className={`max-w-[80%] rounded-2xl px-5 py-4 text-base leading-relaxed group ${
          isAssistant
            ? 'bg-owl-orange-soft border-l-4 border-owl-orange rounded-tl-sm'
            : 'bg-violet-soft border-r-4 border-violet rounded-tr-sm'
        }`}
      >
        <p className="text-ink">{message.content}</p>

        {hasSources && (
          <div className="mt-2">
            <button
              onClick={() => setSourcesOpen(o => !o)}
              className="text-slate-text text-sm flex items-center gap-1 hover:text-owl-orange transition-colors"
              aria-expanded={sourcesOpen}
            >
              📄 {sourceCount} {sourceCount === 1 ? 'fonte' : 'fontes'} {sourcesOpen ? '▴' : '▾'}
            </button>
            {sourcesOpen && (
              <p className="text-sm text-slate-text mt-1">
                {message.sources!.join(' · ')}
              </p>
            )}
          </div>
        )}

        {isAssistant && (
          <div className="flex gap-2 mt-2">
            <button
              aria-label="Resposta útil"
              onClick={() => onFeedback(message.id, 'up')}
              className="text-lg hover:scale-110 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center opacity-60 hover:opacity-100"
            >
              👍
            </button>
            <button
              aria-label="Resposta não útil"
              onClick={() => onFeedback(message.id, 'down')}
              className="text-lg hover:scale-110 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center opacity-60 hover:opacity-100"
            >
              👎
            </button>
          </div>
        )}
      </article>
    </div>
  )
}
