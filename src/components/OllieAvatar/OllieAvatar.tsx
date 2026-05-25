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
  open:    30,
  relaxed: 26,
  squint:  23,
  soft:    26,
  focused: 28,
}

const BEAK_OPEN = 'M 100,124 Q 120,145 140,124 L 138,132 Q 120,152 102,132 Z'

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
    beakPath:      'M 108,127 L 132,127 L 132,133 L 108,133 Z',
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
    beakPath:      'M 110,128 Q 120,137 130,128 L 130,133 Q 120,141 110,133 Z',
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
    beakPath:      'M 108,127 L 132,127 L 132,133 L 108,133 Z',
    headTilt:      -6,
    rightEyeWink:  false,
    wingRightPose: 'raised-chin',
  },
}

function renderWingLeft(uid: string) {
  return (
    <g data-testid="ollie-wing-left">
      {/* Compact rounded wing — like a closed feather fan */}
      <path
        d="M 58,188 Q 30,192 28,218 Q 30,242 58,246 Q 80,244 84,224 Q 86,200 58,188 Z"
        fill={`url(#ollieWingGrad-${uid})`}
        stroke="#5A3000" strokeWidth="1.5"
      />
      {/* Wing feather lines */}
      <path d="M 42,200 Q 52,210 46,224" stroke="#5A3000" strokeWidth="2" fill="none" opacity="0.55" />
      <path d="M 34,212 Q 44,222 38,234" stroke="#5A3000" strokeWidth="2" fill="none" opacity="0.55" />
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
      {/* Compact rounded wing — mirrored left wing */}
      <path
        d="M 182,188 Q 210,192 212,218 Q 210,242 182,246 Q 160,244 156,224 Q 154,200 182,188 Z"
        fill={`url(#ollieWingGrad-${uid})`}
        stroke="#5A3000" strokeWidth="1.5"
      />
      {/* Wing feather lines */}
      <path d="M 198,200 Q 188,210 194,224" stroke="#5A3000" strokeWidth="2" fill="none" opacity="0.55" />
      <path d="M 206,212 Q 196,222 202,234" stroke="#5A3000" strokeWidth="2" fill="none" opacity="0.55" />
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
  // beakOpen=true (TTS falando) sempre usa o shape genérico de boca aberta,
  // sobrescrevendo o beakPath específico do estado — comportamento intencional.
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
            <ellipse cx="90" cy="126" rx="30" ry={eyeRy} />
          </clipPath>
          <clipPath id={`ollieRightEyeClip-${uid}`}>
            <ellipse cx="150" cy="126" rx="30" ry={eyeRy} />
          </clipPath>

          <radialGradient id={`ollieHeadGrad-${uid}`} cx="38%" cy="28%" r="65%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#F8CC4A" />
            <stop offset="50%"  stopColor="#D4900A" />
            <stop offset="100%" stopColor="#8C5206" />
          </radialGradient>

          <radialGradient id={`ollieBodyGrad-${uid}`} cx="42%" cy="22%" r="70%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#F0B830" />
            <stop offset="50%"  stopColor="#CB8410" />
            <stop offset="100%" stopColor="#8A5006" />
          </radialGradient>

          <radialGradient id={`ollieBellyGrad-${uid}`} cx="50%" cy="35%" r="62%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="78%"  stopColor="#F2EBD8" />
            <stop offset="100%" stopColor="#DACCB0" />
          </radialGradient>

          <radialGradient id={`ollieWingGrad-${uid}`} cx="40%" cy="25%" r="72%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#E09A20" />
            <stop offset="100%" stopColor="#7A4604" />
          </radialGradient>

          <radialGradient id={`ollieFaceDiscGrad-${uid}`} cx="50%" cy="40%" r="55%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="60%"  stopColor="#FCE4A6" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#FCE4A6" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`ollieHatGrad-${uid}`} cx="35%" cy="25%" r="75%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#F0C040" />
            <stop offset="55%"  stopColor="#C88810" />
            <stop offset="100%" stopColor="#8A5C05" />
          </radialGradient>

          <pattern id={`ollieFelt-${uid}`} x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="#7A4E04" opacity="0.18" />
          </pattern>

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
          <ellipse cx="120" cy="210" rx="84" ry="68" fill={`url(#ollieBodyGrad-${uid})`} stroke="#3D2000" strokeWidth="2" />

          {/* Belly */}
          <ellipse cx="120" cy="222" rx="58" ry="62" fill={`url(#ollieBellyGrad-${uid})`} />

          {/* Belly feather texture — 4 rows */}
          <path d="M 106,192 Q 113,199 120,192" stroke="#C8C0B2" strokeWidth="2" fill="none" />
          <path d="M 120,192 Q 127,199 134,192" stroke="#C8C0B2" strokeWidth="2" fill="none" />
          <path d="M 100,204 Q 109,212 118,204" stroke="#C8C0B2" strokeWidth="2" fill="none" />
          <path d="M 122,204 Q 131,212 140,204" stroke="#C8C0B2" strokeWidth="2" fill="none" />
          <path d="M 104,216 Q 114,224 124,216" stroke="#C8C0B2" strokeWidth="2" fill="none" />
          <path d="M 108,228 Q 118,236 128,228" stroke="#C8C0B2" strokeWidth="1.5" fill="none" />

          {/* Head group */}
          <g data-testid="ollie-head-group" transform={`rotate(${expr.headTilt}, 120, 115)`}>

            {/* Head circle */}
            <circle cx="120" cy="115" r="72" fill={`url(#ollieHeadGrad-${uid})`} stroke="#3D2000" strokeWidth="2" />
            {/* 3D highlight on upper-left of head */}
            <ellipse cx="92" cy="78" rx="36" ry="28" fill="white" opacity="0.13" />

            {/* Face disc — large white oval, stays inside head circle */}
            <ellipse cx="120" cy="126" rx="64" ry="56" fill="#F5EFE2" />
            <ellipse cx="120" cy="120" rx="62" ry="54" fill={`url(#ollieFaceDiscGrad-${uid})`} />

            {/* Hat — mortarboard graduation cap */}
            {/* Piping creme atrás da coroa */}
            <rect x="59" y="-1" width="122" height="52" rx="6" fill="#F5EFE0" stroke="#D8C898" strokeWidth="1" />
            {/* Hat crown top */}
            <rect x="62" y="2" width="116" height="46" rx="4" fill={`url(#ollieHatGrad-${uid})`} stroke="#3D2000" strokeWidth="1" />
            {/* Felt texture overlay */}
            <rect x="62" y="2" width="116" height="46" rx="4" fill={`url(#ollieFelt-${uid})`} />
            {/* Hat crown top highlight */}
            <rect x="66" y="5" width="72" height="10" rx="2" fill="white" opacity="0.18" />
            {/* Hat band */}
            <rect x="52" y="46" width="136" height="10" rx="3" fill="#F5F0E5" stroke="#D8C890" strokeWidth="1" />
            {/* Hat brim */}
            <rect x="30" y="54" width="180" height="12" rx="6" fill={`url(#ollieHatGrad-${uid})`} stroke="#3D2000" strokeWidth="1.5" />
            {/* Hat brim shadow */}
            <rect x="34" y="64" width="172" height="5" rx="3" fill="#3D2000" opacity="0.25" />
            {/* Center button */}
            <circle cx="120" cy="25" r="5" fill="#F0EAD8" stroke="#C8B888" strokeWidth="1" />
            <circle cx="120" cy="25" r="2.5" fill="#E8DFCA" />
            {/* Cord: center button → crown top-right corner → tassel knot */}
            <path d="M 120,25 L 178,8 L 205,43" stroke="#C88810" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Tassel knot */}
            <circle data-testid="ollie-hat-tassel" cx="205" cy="43" r="6" fill="#C88810" stroke="#8A5C05" strokeWidth="1" />
            {/* Tassel threads */}
            <g stroke="#F0EAD8" strokeWidth="1.2" strokeLinecap="round" opacity="0.90">
              <line x1="199" y1="49" x2="196" y2="66" />
              <line x1="201" y1="49" x2="199" y2="68" />
              <line x1="203" y1="49" x2="202" y2="69" />
              <line x1="205" y1="49" x2="205" y2="69" />
              <line x1="207" y1="49" x2="208" y2="69" />
              <line x1="209" y1="49" x2="211" y2="68" />
              <line x1="211" y1="49" x2="214" y2="66" />
            </g>

            {/* No ear tufts — reference Ollie has a smooth round head */}

            {/* V-shaped forehead mark — owl's characteristic facial marking above brows */}
            <path d="M 80,74 Q 120,94 160,74" stroke="#3D2000" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.45" />

            {/* Left eye sclera */}
            <ellipse data-testid="ollie-left-eye" cx="90" cy="126" rx="30" ry={eyeRy} fill="white" />

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
              <ellipse data-testid="ollie-right-eye" cx="150" cy="126" rx="30" ry={eyeRy} fill="white" />
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
            <path d={expr.leftBrow}  stroke="#3D2000" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d={expr.rightBrow} stroke="#3D2000" strokeWidth="8" strokeLinecap="round" fill="none" />

            {/* Mouth interior — visible when beak is open */}
            {isBeakOpen && (
              <ellipse
                data-testid="ollie-mouth-interior"
                cx="120" cy="136" rx="15" ry="8"
                fill="#CC3300"
              />
            )}

            {/* Upper beak — compact rounded golden beak */}
            <path d="M 106,120 Q 120,110 134,120 L 132,134 Q 120,142 108,134 Z" fill="#E8A808" stroke="#B87800" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Beak highlight */}
            <ellipse cx="114" cy="121" rx="6" ry="4" fill="white" opacity="0.30" />

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
