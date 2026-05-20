'use client'
import { useState } from 'react'
import OllieAvatar from '@/components/OllieAvatar/OllieAvatar'
import { ChatBubble } from '@/components/ChatBubble'
import QuickReply from '@/components/QuickReply/QuickReply'
import ChatInput from '@/components/ChatInput/ChatInput'
import EmotionControls from '@/components/EmotionControls/EmotionControls'
import { useChat } from '@/hooks/useChat'

function IconAudioOn() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
      <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 5a10 10 0 0 1 0 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconAudioOff() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
      <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" />
      <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function ChatInterface() {
  const { messages, isLoading, avatarState, movement, sendMessage, setAvatarState, setMovement } = useChat()
  const [audioEnabled, setAudioEnabled] = useState(false)

  const lastMessage = messages.filter((m) => m.role === 'assistant').at(-1)
  const quickReplies = lastMessage?.quick_replies ?? []

  return (
    <main className="flex flex-col h-screen max-w-lg mx-auto bg-[#F5F0E8]">

      {/* Metade superior — avatar + controles centralizados */}
      <div className="h-1/2 flex-shrink-0 flex flex-col items-center justify-center">
        <div className="flex items-center gap-4 mb-4">
          <OllieAvatar avatarState={avatarState} movement={movement} />
          <button
            onClick={() => setAudioEnabled((v) => !v)}
            aria-label={audioEnabled ? 'Desligar áudio' : 'Ligar áudio'}
            aria-pressed={audioEnabled}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              audioEnabled
                ? 'bg-[#2D5016] text-white shadow-md'
                : 'bg-[#2D5016]/10 text-[#2D5016]/40 hover:bg-[#2D5016]/18'
            }`}
          >
            {audioEnabled ? <IconAudioOn /> : <IconAudioOff />}
          </button>
        </div>
        <div className="w-full">
          <EmotionControls
            avatarState={avatarState}
            movement={movement}
            onStateChange={setAvatarState}
            onMovementChange={setMovement}
          />
        </div>
        <div className="w-full px-4 pt-6">
          {quickReplies.length > 0 && (
            <div className="mb-3">
              <QuickReply options={quickReplies} onSelect={sendMessage} />
            </div>
          )}
          <ChatInput onSubmit={sendMessage} disabled={isLoading} />
        </div>
      </div>

      {/* Metade inferior — mensagens */}
      <div className="flex-1 min-h-0 border-t border-[#2D5016]/10">
        <div
          className="h-full overflow-y-auto px-4 py-3 flex flex-col gap-3"
          aria-live="polite"
          aria-label="Conversa com OLLIE"
        >
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} onFeedback={() => {}} />
          ))}
          {isLoading && (
            <div className="self-start flex items-center gap-1 px-3 py-2.5 bg-[#2D5016]/8 rounded-2xl rounded-tl-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D5016]/50 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D5016]/50 animate-bounce" style={{ animationDelay: '160ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D5016]/50 animate-bounce" style={{ animationDelay: '320ms' }} />
            </div>
          )}
        </div>
      </div>

    </main>
  )
}
