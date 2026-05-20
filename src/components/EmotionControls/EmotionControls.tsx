import type { AvatarState, Movement } from '@/types/chat'

interface EmotionControlsProps {
  visible: boolean
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
  { value: 'idle',     label: 'Repouso' },
  { value: 'talking',  label: 'Falando' },
  { value: 'thinking', label: 'Pensando' },
]

export function EmotionControls({ visible, avatarState, movement, onStateChange, onMovementChange }: EmotionControlsProps) {
  if (!visible) return null
  return (
    <div className="flex-shrink-0 border-y border-[#2D5016]/10 px-4 py-2 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="flex-shrink-0 text-[10px] font-bold text-[#2D5016]/35 uppercase tracking-widest w-10">
          Emoção
        </span>
        <div className="flex flex-wrap gap-1.5">
          {STATES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onStateChange(value)}
              className={`px-2.5 py-0.5 rounded-full text-xs border transition-colors ${
                avatarState === value
                  ? 'bg-[#2D5016] text-white border-[#2D5016]'
                  : 'text-[#2D5016]/55 border-[#2D5016]/20 hover:border-[#2D5016]/45'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex-shrink-0 text-[10px] font-bold text-[#C8860A]/45 uppercase tracking-widest w-10">
          Mov.
        </span>
        <div className="flex flex-wrap gap-1.5">
          {MOVEMENTS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onMovementChange(value)}
              className={`px-2.5 py-0.5 rounded-full text-xs border transition-colors ${
                movement === value
                  ? 'bg-[#C8860A] text-white border-[#C8860A]'
                  : 'text-[#C8860A]/55 border-[#C8860A]/20 hover:border-[#C8860A]/45'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
