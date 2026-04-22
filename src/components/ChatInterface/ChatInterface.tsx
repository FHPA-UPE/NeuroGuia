'use client'
import OllieAvatar from '@/components/OllieAvatar/OllieAvatar'
import ChatBubble from '@/components/ChatBubble/ChatBubble'
import QuickReply from '@/components/QuickReply/QuickReply'
import ChatInput from '@/components/ChatInput/ChatInput'
import { useChat } from '@/hooks/useChat'

export default function ChatInterface() {
  const { messages, isLoading, avatarState, movement, sendMessage } = useChat()

  const lastMessage = messages.filter((m) => m.role === 'assistant').at(-1)
  const quickReplies = lastMessage?.quick_replies ?? []

  return (
    <main className="flex flex-col h-screen max-w-lg mx-auto bg-[#F5F0E8]">
      <header className="flex items-center justify-center p-4 bg-[#2D5016]">
        <span className="text-white text-xl font-bold font-[Atkinson_Hyperlegible]">
          NeuroGuia — OLLIE
        </span>
      </header>

      <div className="flex justify-center p-4">
        <OllieAvatar avatarState={avatarState} movement={movement} />
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3"
        aria-live="polite"
        aria-label="Conversa com OLLIE"
      >
        {messages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <div className="text-[#2D5016] text-sm font-[Atkinson_Hyperlegible] self-start px-2">
            OLLIE está pensando...
          </div>
        )}
      </div>

      <div className="px-4 pb-2">
        <QuickReply options={quickReplies} onSelect={sendMessage} />
      </div>

      <ChatInput onSubmit={sendMessage} disabled={isLoading} />
    </main>
  )
}
