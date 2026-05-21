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
  { value: 'idle',    label: 'Repouso' },
  { value: 'talking', label: 'Falando' },
  { value: 'thinking',label: 'Pensando' },
]

export function EmotionControls({ visible, avatarState, movement, onStateChange, onMovementChange }: EmotionControlsProps) {
  if (!visible) return null
  return (
    <div className="flex-shrink-0 border-y border-mist px-4 py-2 flex flex-col gap-1.5 w-full">
      <div className="flex items-center gap-2">
        <span className="flex-shrink-0 text-[10px] font-bold text-slate-text/60 uppercase tracking-widest w-12">
          Emoção
        </span>
        <div className="flex flex-wrap gap-1.5">
          {STATES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onStateChange(value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors min-h-[28px] ${
                avatarState === value
                  ? 'bg-owl-orange text-white border-owl-orange'
                  : 'text-owl-orange/80 border-owl-orange/30 hover:border-owl-orange/60 bg-owl-orange-soft/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex-shrink-0 text-[10px] font-bold text-slate-text/60 uppercase tracking-widest w-12">
          Mov.
        </span>
        <div className="flex flex-wrap gap-1.5">
          {MOVEMENTS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onMovementChange(value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors min-h-[28px] ${
                movement === value
                  ? 'bg-violet text-white border-violet'
                  : 'text-violet/80 border-violet/30 hover:border-violet/60 bg-violet-soft/50'
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
