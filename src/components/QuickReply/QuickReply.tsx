interface QuickReplyProps {
  options: string[]
  onSelect: (option: string) => void
}

export default function QuickReply({ options, onSelect }: QuickReplyProps) {
  if (options.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Opções rápidas de resposta">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="rounded-full border border-[#2D5016]/25 text-[#2D5016] bg-white px-4 py-1.5 text-sm shadow-sm hover:bg-[#2D5016] hover:text-white hover:border-[#2D5016] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8860A]"
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
