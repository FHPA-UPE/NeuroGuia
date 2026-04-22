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
      className={`max-w-[80%] rounded-2xl px-4 py-3 text-lg leading-relaxed font-[Atkinson_Hyperlegible] ${
        isAssistant
          ? 'bg-[#2D5016] text-white self-start'
          : 'bg-[#C8860A] text-white self-end'
      }`}
    >
      {content}
    </div>
  )
}
