import type { AvatarState, Movement } from '@/types/chat'

interface EmotionControlsProps {
  avatarState: AvatarState
  movement: Movement
  onStateChange: (state: AvatarState) => void
  onMovementChange: (movement: Movement) => void
}

const STATES: { value: AvatarState; label: string }[] = [
  { value: 'neutral',     label: 'Neutro' },
  { value: 'happy',       label: 'Feliz' },
  { value: 'encouraging', label: 'Encorajador' },
  { value: 'empathetic',  label: 'Empático' },
  { value: 'thoughtful',  label: 'Pensativo' },
]

const MOVEMENTS: { value: Movement; label: string }[] = [
  { value: 'idle',     label: 'Em repouso' },
  { value: 'talking',  label: 'Falando' },
  { value: 'thinking', label: 'Pensando' },
]

export default function EmotionControls({ avatarState, movement, onStateChange, onMovementChange }: EmotionControlsProps) {
  return (
    <div className="px-4 py-2 border-t border-b border-[#2D5016]/20 bg-[#EDE8E0]">
      <p className="text-[#2D5016] text-xs font-semibold font-[Atkinson_Hyperlegible] uppercase tracking-wide mb-2">
        Estado emocional
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {STATES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onStateChange(value)}
            className={`px-3 py-1 rounded-full text-xs font-[Atkinson_Hyperlegible] border transition-colors ${
              avatarState === value
                ? 'bg-[#2D5016] text-white border-[#2D5016]'
                : 'bg-transparent text-[#2D5016] border-[#2D5016] hover:bg-[#2D5016]/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-[#2D5016] text-xs font-semibold font-[Atkinson_Hyperlegible] uppercase tracking-wide mb-2">
        Movimento
      </p>
      <div className="flex flex-wrap gap-2">
        {MOVEMENTS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onMovementChange(value)}
            className={`px-3 py-1 rounded-full text-xs font-[Atkinson_Hyperlegible] border transition-colors ${
              movement === value
                ? 'bg-[#C8860A] text-white border-[#C8860A]'
                : 'bg-transparent text-[#C8860A] border-[#C8860A] hover:bg-[#C8860A]/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
