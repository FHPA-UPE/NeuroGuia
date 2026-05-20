'use client'
import type { AvatarState, Movement } from '@/types/chat'

interface OwlAvatarProps {
  state: AvatarState
  movement: Movement
  beakOpen: boolean
}

const MOVEMENT_CLASS: Record<Movement, string> = {
  idle: 'owl-idle',
  talking: 'owl-talking',
  thinking: 'owl-thinking',
}

const STATE_LABEL: Record<AvatarState, string> = {
  neutral: 'OWL neutral',
  happy: 'OWL happy',
  encouraging: 'OWL encouraging',
  empathetic: 'OWL empathetic',
  thoughtful: 'OWL thoughtful',
}

const PALETTE = {
  bodyLight: '#F5A623',
  bodyMid: '#C07818',
  bodyDark: '#7A4A10',
  belly: '#FFF8F0',
  hatDeep: '#2E1A6E',
  hatBand: '#C8D0F8',
  tassel: '#D95F3B',
  outline: 'rgba(28,14,0,0.7)',
}

const EXPRESSIONS: Record<AvatarState, {
  browLeft: string; browRight: string; beakPath: string;
  pupilOffset: [number, number]; eyeRy: number; headTilt: number
}> = {
  neutral:     { browLeft: 'M20,18 Q25,15 30,18', browRight: 'M50,18 Q55,15 60,18', beakPath: 'M35,45 Q40,50 45,45', pupilOffset: [0,0], eyeRy: 8, headTilt: 0 },
  happy:       { browLeft: 'M20,16 Q25,12 30,16', browRight: 'M50,16 Q55,12 60,16', beakPath: 'M33,44 Q40,52 47,44', pupilOffset: [0,1], eyeRy: 7, headTilt: 2 },
  encouraging: { browLeft: 'M20,15 Q25,11 30,15', browRight: 'M50,15 Q55,11 60,15', beakPath: 'M34,45 Q40,50 46,45', pupilOffset: [1,0], eyeRy: 8, headTilt: -2 },
  empathetic:  { browLeft: 'M20,20 Q25,17 30,20', browRight: 'M50,20 Q55,17 60,20', beakPath: 'M34,46 Q40,49 46,46', pupilOffset: [0,-1], eyeRy: 9, headTilt: 5 },
  thoughtful:  { browLeft: 'M20,19 Q25,14 30,17', browRight: 'M50,17 Q55,14 60,19', beakPath: 'M35,45 Q40,48 45,45', pupilOffset: [-1,0], eyeRy: 8, headTilt: -3 },
}

export function OwlAvatar({ state, movement, beakOpen }: OwlAvatarProps) {
  const expr = EXPRESSIONS[state]
  const motionClass = MOVEMENT_CLASS[movement]

  return (
    <div
      className={motionClass}
      style={{ transform: `rotate(${expr.headTilt}deg)`, transition: 'transform 0.4s ease' }}
    >
      <svg
        role="img"
        aria-label={STATE_LABEL[state]}
        viewBox="0 0 80 100"
        width="160"
        height="200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="bodyGrad" cx="40%" cy="30%">
            <stop offset="0%" stopColor="#FFC84A" />
            <stop offset="50%" stopColor={PALETTE.bodyLight} />
            <stop offset="85%" stopColor={PALETTE.bodyMid} />
            <stop offset="100%" stopColor={PALETTE.bodyDark} />
          </radialGradient>
        </defs>

        <ellipse cx="40" cy="70" rx="22" ry="25" fill="url(#bodyGrad)" stroke={PALETTE.outline} strokeWidth="1" />
        <ellipse cx="40" cy="72" rx="13" ry="16" fill={PALETTE.belly} opacity="0.9" />
        <circle cx="40" cy="38" r="22" fill="url(#bodyGrad)" stroke={PALETTE.outline} strokeWidth="1" />

        <g id="owl-hat">
          <rect x="22" y="18" width="36" height="3" rx="2" fill={PALETTE.hatDeep} />
          <rect x="27" y="6" width="26" height="13" rx="3" fill={PALETTE.hatDeep} />
          <rect x="27" y="14" width="26" height="3" fill={PALETTE.hatBand} opacity="0.8" />
          <g id="owl-hat-tassel" style={{ transformOrigin: '53px 6px' }}>
            <line x1="53" y1="6" x2="57" y2="14" stroke={PALETTE.tassel} strokeWidth="2" strokeLinecap="round" />
            <circle cx="57" cy="15" r="3" fill={PALETTE.tassel} />
          </g>
        </g>

        <ellipse cx="28" cy="40" rx="8" ry={expr.eyeRy} fill="white" stroke={PALETTE.outline} strokeWidth="0.8" />
        <ellipse cx="52" cy="40" rx="8" ry={expr.eyeRy} fill="white" stroke={PALETTE.outline} strokeWidth="0.8" />
        <circle cx={28 + expr.pupilOffset[0]} cy={40 + expr.pupilOffset[1]} r="4" fill="#1C0E00" />
        <circle cx={52 + expr.pupilOffset[0]} cy={40 + expr.pupilOffset[1]} r="4" fill="#1C0E00" />
        <circle cx={29 + expr.pupilOffset[0]} cy={38 + expr.pupilOffset[1]} r="1.5" fill="white" opacity="0.8" />
        <circle cx={53 + expr.pupilOffset[0]} cy={38 + expr.pupilOffset[1]} r="1.5" fill="white" opacity="0.8" />

        <path d={expr.browLeft} fill="none" stroke={PALETTE.bodyDark} strokeWidth="2" strokeLinecap="round" />
        <path d={expr.browRight} fill="none" stroke={PALETTE.bodyDark} strokeWidth="2" strokeLinecap="round" />

        <path
          className={`ollie-beak-bottom${beakOpen ? ' owl-talk' : ''}`}
          d={beakOpen ? 'M33,47 Q40,56 47,47' : expr.beakPath}
          fill={PALETTE.bodyMid}
          stroke={PALETTE.outline}
          strokeWidth="0.8"
          style={{ transition: 'd 80ms ease-in-out' }}
        />
      </svg>
    </div>
  )
}
