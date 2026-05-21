'use client'
import type { AvatarState, Movement } from '@/types/chat'

interface OllieAvatarProps {
  avatarState: AvatarState
  movement: Movement
  beakOpen?: boolean
}

interface ExpressionConfig {
  leftPupil: { cx: number; cy: number }
  rightPupil: { cx: number; cy: number }
  leftBrow: string
  rightBrow: string
  eyeShape: 'open' | 'relaxed' | 'squint' | 'soft' | 'focused'
  eyeLidOffset: number
  beakPath: string  // straight path, no Q
  headTilt: number
}

const EYE_RY: Record<ExpressionConfig['eyeShape'], number> = {
  open:    23,
  relaxed: 20,
  squint:  16,
  soft:    18,
  focused: 22,
}

const MOVEMENT_CLASS: Record<Movement, string> = {
  idle: 'ollie-idle',
  talking: 'ollie-talking',
  thinking: 'ollie-thinking',
}

const EXPRESSIONS: Record<AvatarState, ExpressionConfig> = {
  neutral: {
    leftPupil: { cx: 72, cy: 88 },
    rightPupil: { cx: 128, cy: 88 },
    leftBrow: 'M 60,70 Q 72,64 84,70',
    rightBrow: 'M 116,70 Q 128,64 140,70',
    eyeShape: 'open',
    eyeLidOffset: 0,
    beakPath: 'M 87,115 L 113,115 L 112,122 L 88,122 Z',
    headTilt: 0,
  },
  happy: {
    leftPupil: { cx: 72, cy: 89 },
    rightPupil: { cx: 128, cy: 89 },
    leftBrow: 'M 60,67 Q 72,61 84,67',
    rightBrow: 'M 116,67 Q 128,61 140,67',
    eyeShape: 'relaxed',
    eyeLidOffset: 2,
    beakPath: 'M 87,115 L 113,115 L 112,122 L 88,122 Z',
    headTilt: 0,
  },
  encouraging: {
    leftPupil: { cx: 73, cy: 88 },
    rightPupil: { cx: 129, cy: 88 },
    leftBrow: 'M 60,66 Q 72,60 84,66',
    rightBrow: 'M 116,66 Q 128,60 140,66',
    eyeShape: 'focused',
    eyeLidOffset: 0,
    beakPath: 'M 86,114 L 114,114 L 113,121 L 87,121 Z',
    headTilt: -2,
  },
  empathetic: {
    leftPupil: { cx: 72, cy: 87 },
    rightPupil: { cx: 128, cy: 87 },
    leftBrow: 'M 60,73 Q 72,68 84,73',
    rightBrow: 'M 116,73 Q 128,68 140,73',
    eyeShape: 'soft',
    eyeLidOffset: 1,
    beakPath: 'M 87,116 L 113,116 L 112,123 L 88,123 Z',
    headTilt: 5,
  },
  thoughtful: {
    leftPupil: { cx: 71, cy: 88 },
    rightPupil: { cx: 127, cy: 88 },
    leftBrow: 'M 60,71 Q 70,63 84,69',
    rightBrow: 'M 116,69 Q 130,63 140,71',
    eyeShape: 'squint',
    eyeLidOffset: 1,
    beakPath: 'M 87,115 L 113,115 L 112,122 L 88,122 Z',
    headTilt: -3,
  },
}

export default function OllieAvatar({ avatarState, movement, beakOpen = false }: OllieAvatarProps) {
  const expr = EXPRESSIONS[avatarState]
  const motionClass = MOVEMENT_CLASS[movement]
  const headTransform = `rotate(${expr.headTilt}, 100, 80)`
  const eyeRy        = EYE_RY[expr.eyeShape]
  const leftPupilCy  = expr.leftPupil.cy  + expr.eyeLidOffset
  const rightPupilCy = expr.rightPupil.cy + expr.eyeLidOffset

  const beakLowerPath = beakOpen
    ? 'M 84,114 Q 100,134 116,114 L 114,121 Q 100,140 86,121 Z'
    : expr.beakPath

  return (
    <div className={motionClass}>
      <svg
        role="img"
        aria-label={`OLLIE está ${avatarState}`}
        viewBox="0 0 200 240"
        width="200"
        height="240"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body */}
        <ellipse cx="100" cy="180" rx="50" ry="55" fill="#F5A623" stroke="rgba(28,14,0,0.7)" strokeWidth="1.5" />
        <ellipse cx="100" cy="185" rx="30" ry="38" fill="#FFF8F0" opacity="0.9" />

        {/* Head group — controls head tilt and contains all face elements */}
        <g data-testid="ollie-head-group" transform={headTransform}>
          {/* Head circle */}
          <circle cx="100" cy="80" r="55" fill="#F5A623" stroke="rgba(28,14,0,0.7)" strokeWidth="1.5" />

          {/* Mortarboard hat */}
          <g data-testid="ollie-hat">
            {/* Hat brim */}
            <rect x="55" y="34" width="90" height="7" rx="3" fill="#2E1A6E" />
            {/* Hat cap */}
            <rect x="65" y="10" width="70" height="26" rx="5" fill="#2E1A6E" />
            {/* Hat band */}
            <rect x="65" y="28" width="70" height="7" fill="#C8D0F8" opacity="0.85" />
            {/* Tassel */}
            <line x1="135" y1="10" x2="148" y2="26" stroke="#D95F3B" strokeWidth="3" strokeLinecap="round" />
            <circle cx="150" cy="28" r="5" fill="#D95F3B" />
          </g>

          {/* Left eye */}
          <ellipse cx="72" cy="88" rx="18" ry={eyeRy} fill="white" stroke="rgba(28,14,0,0.7)" strokeWidth="1" />
          <circle cx={expr.leftPupil.cx} cy={leftPupilCy} r="9" fill="#1C0E00" />
          <circle cx={expr.leftPupil.cx + 3} cy={leftPupilCy - 3} r="3" fill="white" opacity="0.8" />

          {/* Right eye */}
          <ellipse cx="128" cy="88" rx="18" ry={eyeRy} fill="white" stroke="rgba(28,14,0,0.7)" strokeWidth="1" />
          <circle cx={expr.rightPupil.cx} cy={rightPupilCy} r="9" fill="#1C0E00" />
          <circle cx={expr.rightPupil.cx + 3} cy={rightPupilCy - 3} r="3" fill="white" opacity="0.8" />

          {/* Brows */}
          <path d={expr.leftBrow} fill="none" stroke="#7A4A10" strokeWidth="3" strokeLinecap="round" />
          <path d={expr.rightBrow} fill="none" stroke="#7A4A10" strokeWidth="3" strokeLinecap="round" />

          {/* Beak upper */}
          <path
            data-testid="ollie-beak-upper"
            d="M 84,108 Q 100,100 116,108 L 113,115 L 87,115 Z"
            fill="#C07818"
            stroke="rgba(28,14,0,0.7)"
            strokeWidth="1"
          />

          {/* Mouth interior (only when beak is open) */}
          {beakOpen && (
            <ellipse
              data-testid="ollie-mouth-interior"
              cx="100"
              cy="120"
              rx="12"
              ry="6"
              fill="#CC3300"
            />
          )}

          {/* Beak lower */}
          <path
            data-testid="ollie-beak-lower"
            d={beakLowerPath}
            fill="#C07818"
            stroke="rgba(28,14,0,0.7)"
            strokeWidth="1"
          />
        </g>
      </svg>
    </div>
  )
}
