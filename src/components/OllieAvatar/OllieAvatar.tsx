'use client'
import { useId } from 'react'
import type { AvatarState, Movement } from '@/types/chat'

type WingPose = 'rest' | 'raised-thumb' | 'raised-chin'
type EyeShape = 'open' | 'relaxed' | 'squint' | 'soft' | 'focused'

interface OllieAvatarProps {
  avatarState: AvatarState
  movement:    Movement
  beakOpen?:   boolean
}

interface ExpressionConfig {
  leftPupil:     { cx: number; cy: number }
  rightPupil:    { cx: number; cy: number }
  leftBrow:      string
  rightBrow:     string
  eyeShape:      EyeShape
  eyeLidOffset:  number
  beakPath:      string
  headTilt:      number
  rightEyeWink:  boolean
  wingRightPose: WingPose
}

const EYE_RY: Record<EyeShape, number> = {
  open:    26,
  relaxed: 22,
  squint:  20,
  soft:    22,
  focused: 24,
}

const BEAK_OPEN = 'M 100,127 Q 120,144 140,127 L 138,133 Q 120,150 102,133 Z'

const STATE_LABEL: Record<AvatarState, string> = {
  neutral:     'neutro',
  happy:       'feliz',
  encouraging: 'encorajador',
  empathetic:  'empático',
  thoughtful:  'pensativo',
}

const EXPRESSIONS: Record<AvatarState, ExpressionConfig> = {
  neutral: {
    leftPupil:     { cx: 90,  cy: 126 },
    rightPupil:    { cx: 150, cy: 126 },
    leftBrow:      'M 70 98 Q 90 91 110 98',
    rightBrow:     'M 130 98 Q 150 91 170 98',
    eyeShape:      'open',
    eyeLidOffset:  0,
    beakPath:      'M 108,130 L 132,130 L 132,135 L 108,135 Z',
    headTilt:      0,
    rightEyeWink:  false,
    wingRightPose: 'rest',
  },
  happy: {
    leftPupil:     { cx: 90,  cy: 126 },
    rightPupil:    { cx: 150, cy: 126 },
    leftBrow:      'M 70 93 Q 90 84 110 93',
    rightBrow:     'M 130 93 Q 150 84 170 93',
    eyeShape:      'squint',
    eyeLidOffset:  3,
    beakPath:      BEAK_OPEN,
    headTilt:      0,
    rightEyeWink:  false,
    wingRightPose: 'rest',
  },
  encouraging: {
    leftPupil:     { cx: 90,  cy: 124 },
    rightPupil:    { cx: 150, cy: 124 },
    leftBrow:      'M 70 90 Q 90 82 110 90',
    rightBrow:     'M 130 90 Q 150 82 170 90',
    eyeShape:      'open',
    eyeLidOffset:  -2,
    beakPath:      BEAK_OPEN,
    headTilt:      -4,
    rightEyeWink:  false,
    wingRightPose: 'raised-thumb',
  },
  empathetic: {
    leftPupil:     { cx: 90,  cy: 126 },
    rightPupil:    { cx: 150, cy: 126 },
    leftBrow:      'M 70 98 Q 90 91 110 98',
    rightBrow:     'M 130 103 Q 150 98 170 105',
    eyeShape:      'soft',
    eyeLidOffset:  2,
    beakPath:      'M 110,131 Q 120,138 130,131 L 130,135 Q 120,141 110,135 Z',
    headTilt:      4,
    rightEyeWink:  true,
    wingRightPose: 'rest',
  },
  thoughtful: {
    leftPupil:     { cx: 87,  cy: 126 },
    rightPupil:    { cx: 147, cy: 126 },
    leftBrow:      'M 70 101 Q 90 97 110 101',
    rightBrow:     'M 130 95 Q 150 88 170 95',
    eyeShape:      'relaxed',
    eyeLidOffset:  2,
    beakPath:      'M 108,130 L 132,130 L 132,135 L 108,135 Z',
    headTilt:      -6,
    rightEyeWink:  false,
    wingRightPose: 'raised-chin',
  },
}

function renderWingLeft(uid: string) {
  return (
    <g data-testid="ollie-wing-left">
      <ellipse
        cx="44" cy="198" rx="28" ry="56"
        fill={`url(#ollieWingGrad-${uid})`}
        transform="rotate(-16, 44, 198)"
      />
      <path d="M 34,186 Q 40,193 34,200" stroke="#4F2C00" strokeWidth="1.5" fill="none" opacity="0.55" />
      <path d="M 28,198 Q 34,205 28,212" stroke="#4F2C00" strokeWidth="1.5" fill="none" opacity="0.55" />
    </g>
  )
}

function renderWingRight(pose: WingPose, uid: string) {
  if (pose === 'raised-thumb') {
    return (
      <g data-testid="ollie-wing-right">
        <path
          d="M 196,178 Q 202,165 196,158"
          stroke={`url(#ollieWingGrad-${uid})`}
          strokeWidth="22"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx="196" cy="158" rx="22" ry="18" fill={`url(#ollieWingGrad-${uid})`} />
        <path
          data-testid="ollie-wing-right-thumb"
          d="M 195,138 Q 188,122 196,112 Q 204,102 210,114 Q 214,126 205,138 Z"
          fill={`url(#ollieWingGrad-${uid})`}
        />
        <ellipse cx="202" cy="113" rx="5" ry="7" fill="#E8B040" opacity="0.35" />
      </g>
    )
  }
  if (pose === 'raised-chin') {
    return (
      <g data-testid="ollie-wing-right">
        <ellipse
          data-testid="ollie-wing-right-chin"
          cx="168" cy="162" rx="24" ry="44"
          fill={`url(#ollieWingGrad-${uid})`}
          transform="rotate(-50, 168, 162)"
        />
        <path d="M 175,150 Q 168,157 175,164" stroke="#4F2C00" strokeWidth="1.5" fill="none" opacity="0.55" />
      </g>
    )
  }
  return (
    <g data-testid="ollie-wing-right">
      <ellipse
        cx="196" cy="198" rx="28" ry="56"
        fill={`url(#ollieWingGrad-${uid})`}
        transform="rotate(16, 196, 198)"
      />
      <path d="M 206,186 Q 200,193 206,200" stroke="#4F2C00" strokeWidth="1.5" fill="none" opacity="0.55" />
      <path d="M 212,198 Q 206,205 212,212" stroke="#4F2C00" strokeWidth="1.5" fill="none" opacity="0.55" />
    </g>
  )
}

export default function OllieAvatar({ avatarState, movement, beakOpen = false }: OllieAvatarProps) {
  const uid          = useId().replace(/:/g, '')
  const expr         = EXPRESSIONS[avatarState]
  const eyeRy        = EYE_RY[expr.eyeShape]
  const leftPupilCy  = expr.leftPupil.cy  + expr.eyeLidOffset
  const rightPupilCy = expr.rightPupil.cy + expr.eyeLidOffset
  const isBeakOpen   = beakOpen || avatarState === 'happy' || avatarState === 'encouraging'
  const beakPathFinal = isBeakOpen ? BEAK_OPEN : expr.beakPath

  return (
    <div
      role="img"
      aria-label={`OLLIE está ${STATE_LABEL[avatarState]}`}
      className={`w-48 h-48 ollie-avatar ollie-${avatarState} ollie-${movement}`}
    >
      <svg
        viewBox="0 0 240 280"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`ollieLeftEyeClip-${uid}`}>
            <ellipse cx="90" cy="126" rx="26" ry={eyeRy} />
          </clipPath>
          <clipPath id={`ollieRightEyeClip-${uid}`}>
            <ellipse cx="150" cy="126" rx="26" ry={eyeRy} />
          </clipPath>

          <radialGradient id={`ollieHeadGrad-${uid}`} cx="40%" cy="30%" r="65%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#F0B840" />
            <stop offset="55%"  stopColor="#C97E18" />
            <stop offset="100%" stopColor="#7A4A05" />
          </radialGradient>

          <radialGradient id={`ollieBodyGrad-${uid}`} cx="45%" cy="25%" r="70%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#EAA820" />
            <stop offset="55%"  stopColor="#C47A14" />
            <stop offset="100%" stopColor="#7A4A05" />
          </radialGradient>

          <radialGradient id={`ollieBellyGrad-${uid}`} cx="50%" cy="35%" r="62%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="78%"  stopColor="#F2EBD8" />
            <stop offset="100%" stopColor="#DACCB0" />
          </radialGradient>

          <radialGradient id={`ollieWingGrad-${uid}`} cx="50%" cy="25%" r="72%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#D98C18" />
            <stop offset="100%" stopColor="#6B3A02" />
          </radialGradient>

          <radialGradient id={`ollieFaceDiscGrad-${uid}`} cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#FCE4A6" stopOpacity="0.50" />
            <stop offset="100%" stopColor="#FCE4A6" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`ollieHatGrad-${uid}`} cx="42%" cy="20%" r="80%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#E0A020" />
            <stop offset="55%"  stopColor="#C07818" />
            <stop offset="100%" stopColor="#8A5005" />
          </radialGradient>

          <filter id={`ollieBodyDepth-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="5" stdDeviation="6" floodColor="#3A1800" floodOpacity="0.30" />
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="120" cy="274" rx="62" ry="7" fill="#3A1C00" opacity="0.18" />

        {/* Main group with depth shadow */}
        <g filter={`url(#ollieBodyDepth-${uid})`}>

          {/* Wings */}
          {renderWingLeft(uid)}
          {renderWingRight(expr.wingRightPose, uid)}

          {/* Body */}
          <ellipse cx="120" cy="208" rx="80" ry="65" fill={`url(#ollieBodyGrad-${uid})`} />

          {/* Belly */}
          <ellipse cx="120" cy="218" rx="50" ry="58" fill={`url(#ollieBellyGrad-${uid})`} />

          {/* Belly feather texture — 3 rows */}
          <path d="M 107,198 Q 113,205 120,198" stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
          <path d="M 120,198 Q 127,205 134,198" stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
          <path d="M 102,210 Q 110,217 118,210" stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
          <path d="M 122,210 Q 130,217 138,210" stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
          <path d="M 106,222 Q 115,229 124,222" stroke="#D8D0C4" strokeWidth="1.5" fill="none" />

          {/* Head group */}
          <g data-testid="ollie-head-group" transform={`rotate(${expr.headTilt}, 120, 115)`}>

            {/* Head circle */}
            <circle cx="120" cy="115" r="72" fill={`url(#ollieHeadGrad-${uid})`} />

            {/* Face disc overlay */}
            <ellipse cx="120" cy="120" rx="58" ry="55" fill={`url(#ollieFaceDiscGrad-${uid})`} />

            {/* Hat — rendered before ear tufts so tufts appear in front */}
            <rect x="14"  y="49" width="212" height="14" rx="6"  fill={`url(#ollieHatGrad-${uid})`} />
            <rect x="58"  y="40" width="124" height="11" rx="4"  fill="#F5F0E5" />
            <rect x="62"  y="10" width="116" height="32" rx="7"  fill={`url(#ollieHatGrad-${uid})`} />
            <line x1="176" y1="14" x2="205" y2="42" stroke="#7A3E00" strokeWidth="2.5" />
            <circle data-testid="ollie-hat-tassel" cx="208" cy="45" r="9" fill="#7A3E00" />
            <circle cx="208" cy="45" r="5" fill="#A85E08" />

            {/* Ear tufts — rendered after hat so they appear in front */}
            <polygon points="60,48 48,16 76,38"  fill={`url(#ollieHeadGrad-${uid})`} />
            <polygon points="55,48 45,20 70,36"  fill={`url(#ollieHeadGrad-${uid})`} opacity="0.85" />
            <polygon points="65,48 52,14 80,36"  fill={`url(#ollieHeadGrad-${uid})`} opacity="0.70" />
            <polygon points="180,48 192,16 164,38"  fill={`url(#ollieHeadGrad-${uid})`} />
            <polygon points="185,48 195,20 170,36"  fill={`url(#ollieHeadGrad-${uid})`} opacity="0.85" />
            <polygon points="175,48 188,14 160,36"  fill={`url(#ollieHeadGrad-${uid})`} opacity="0.70" />

            {/* Left eye sclera */}
            <ellipse data-testid="ollie-left-eye" cx="90" cy="126" rx="26" ry={eyeRy} fill="white" />

            {/* Right eye — normal sclera or wink arc */}
            {expr.rightEyeWink ? (
              <path
                data-testid="ollie-eye-right-wink"
                d="M 124,126 Q 150,112 176,126"
                stroke="#1a1a1a"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <ellipse data-testid="ollie-right-eye" cx="150" cy="126" rx="26" ry={eyeRy} fill="white" />
            )}

            {/* Left pupil with dual specular highlights */}
            <g clipPath={`url(#ollieLeftEyeClip-${uid})`}>
              <circle cx={expr.leftPupil.cx}       cy={leftPupilCy}       r="17" fill="#1a1a1a" />
              <circle cx={expr.leftPupil.cx  + 6}  cy={leftPupilCy  - 6}  r="6"  fill="white" />
              <circle cx={expr.leftPupil.cx  + 10} cy={leftPupilCy  - 10} r="3"  fill="white" opacity="0.7" />
            </g>

            {/* Right pupil — only when not winking */}
            {!expr.rightEyeWink && (
              <g clipPath={`url(#ollieRightEyeClip-${uid})`}>
                <circle cx={expr.rightPupil.cx}      cy={rightPupilCy}      r="17" fill="#1a1a1a" />
                <circle cx={expr.rightPupil.cx + 6}  cy={rightPupilCy - 6}  r="6"  fill="white" />
                <circle cx={expr.rightPupil.cx + 10} cy={rightPupilCy - 10} r="3"  fill="white" opacity="0.7" />
              </g>
            )}

            {/* Eyebrows */}
            <path d={expr.leftBrow}  stroke="#3D2000" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d={expr.rightBrow} stroke="#3D2000" strokeWidth="5" strokeLinecap="round" fill="none" />

            {/* Mouth interior — visible when beak is open */}
            {isBeakOpen && (
              <ellipse
                data-testid="ollie-mouth-interior"
                cx="120" cy="133" rx="16" ry="8"
                fill="#CC3300"
              />
            )}

            {/* Upper beak — fixed triangle */}
            <polygon points="120,108 100,128 140,128" fill="#E8B020" />
            <line x1="100" y1="128" x2="140" y2="128" stroke="#C8860A" strokeWidth="1.5" />

            {/* Lower beak */}
            <path
              data-testid="ollie-beak-lower"
              d={beakPathFinal}
              fill="#C8860A"
            />

          </g>
        </g>

        {/* Left foot — 3 toes */}
        <ellipse cx="88"  cy="266" rx="8"  ry="5.5" fill="#E8B020" />
        <ellipse cx="100" cy="268" rx="10" ry="6"   fill="#E8B020" />
        <ellipse cx="112" cy="266" rx="8"  ry="5.5" fill="#E8B020" />

        {/* Right foot — 3 toes */}
        <ellipse cx="128" cy="266" rx="8"  ry="5.5" fill="#E8B020" />
        <ellipse cx="140" cy="268" rx="10" ry="6"   fill="#E8B020" />
        <ellipse cx="152" cy="266" rx="8"  ry="5.5" fill="#E8B020" />

      </svg>
    </div>
  )
}
