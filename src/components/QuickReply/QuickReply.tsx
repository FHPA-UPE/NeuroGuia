interface QuickReplyProps {
  options: string[]
  onSelect: (option: string) => void
}

export default function QuickReply({ options, onSelect }: QuickReplyProps) {
  if (options.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2 mt-2" role="group" aria-label="Opções rápidas de resposta">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="rounded-full border-2 border-[#2D5016] text-[#2D5016] px-4 py-2 text-base font-[Atkinson_Hyperlegible] hover:bg-[#2D5016] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8860A]"
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
