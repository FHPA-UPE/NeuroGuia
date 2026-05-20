'use client'

interface Props {
  onRate: (emoji: 'happy' | 'neutral' | 'sad') => void
  onDismiss: () => void
}

const OPTIONS: { value: 'happy' | 'neutral' | 'sad'; label: string; emoji: string }[] = [
  { value: 'sad',     label: 'Insatisfeito', emoji: '😞' },
  { value: 'neutral', label: 'Neutro',        emoji: '😐' },
  { value: 'happy',   label: 'Satisfeito',    emoji: '😊' },
]

export function SessionRatingToast({ onRate, onDismiss }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-rating-title"
      className="fixed bottom-4 right-4 bg-pure-white rounded-card border border-mist shadow-lg p-5 z-50 max-w-xs"
    >
      <p id="session-rating-title" className="text-sm font-semibold text-midnight mb-3">
        Como foi sua experiência?
      </p>
      <div className="flex justify-around mb-4">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            aria-label={opt.label}
            onClick={() => onRate(opt.value)}
            className="text-3xl hover:scale-125 transition-transform"
          >
            {opt.emoji}
          </button>
        ))}
      </div>
      <button
        onClick={onDismiss}
        className="text-xs text-silver hover:text-slate-text w-full text-center"
      >
        Pular
      </button>
    </div>
  )
}
