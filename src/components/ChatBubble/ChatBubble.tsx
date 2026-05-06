interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const isAssistant = role === 'assistant'
  return (
    <div
      role="log"
      aria-live="polite"
      className={`max-w-[82%] rounded-2xl px-4 py-3 text-base leading-relaxed shadow-sm ${
        isAssistant
          ? 'bg-[#2D5016] text-white self-start rounded-tl-sm'
          : 'bg-[#C8860A] text-white self-end rounded-tr-sm'
      }`}
    >
      {content}
    </div>
  )
}
