'use client'
import { useId } from 'react'
import type { AvatarState, Movement } from '@/types/chat'

interface OllieAvatarProps {
  avatarState: AvatarState
  movement:    Movement
  beakOpen?:   boolean
}

interface ExpressionConfig {
  leftPupil:    { cx: number; cy: number }
  rightPupil:   { cx: number; cy: number }
  leftBrow:     string
  rightBrow:    string
  eyeShape:     'open' | 'relaxed' | 'squint' | 'soft' | 'focused'
  eyeLidOffset: number
  beakPath:     string
  headTilt:     number
}

const EYE_RY: Record<ExpressionConfig['eyeShape'], number> = {
  open:    23,
  relaxed: 20,
  squint:  16,
  soft:    18,
  focused: 22,
}

const BEAK_OPEN = 'M 84,114 Q 100,134 116,114 L 114,121 Q 100,140 86,121 Z'

const EXPRESSIONS: Record<AvatarState, ExpressionConfig> = {
  neutral: {
    leftPupil:    { cx: 78,  cy: 82 },
    rightPupil:   { cx: 122, cy: 82 },
    leftBrow:     'M 62 58 Q 78 52 94 58',
    rightBrow:    'M 106 58 Q 122 52 138 58',
    eyeShape:     'open',
    eyeLidOffset: 0,
    beakPath:     'M 87,115 L 113,115 L 112,122 L 88,122 Z',
    headTilt:     0,
  },
  happy: {
    leftPupil:    { cx: 78,  cy: 84 },
    rightPupil:   { cx: 122, cy: 84 },
    leftBrow:     'M 62 51 Q 78 43 94 51',
    rightBrow:    'M 106 51 Q 122 43 138 51',
    eyeShape:     'squint',
    eyeLidOffset: 3,
    beakPath:     'M 82,113 Q 100,133 118,113 L 117,119 Q 100,137 83,119 Z',
    headTilt:     0,
  },
  encouraging: {
    leftPupil:    { cx: 80,  cy: 81 },
    rightPupil:   { cx: 124, cy: 81 },
    leftBrow:     'M 62 55 Q 78 47 94 55',
    rightBrow:    'M 106 51 Q 122 43 138 51',
    eyeShape:     'focused',
    eyeLidOffset: 1,
    beakPath:     'M 82,113 L 118,113 L 118,122 L 82,122 Z',
    headTilt:     -3,
  },
  empathetic: {
    leftPupil:    { cx: 78,  cy: 85 },
    rightPupil:   { cx: 122, cy: 85 },
    leftBrow:     'M 64 63 Q 76 56 86 54 Q 90 53 94 55',
    rightBrow:    'M 106 55 Q 110 53 114 54 Q 124 56 136 63',
    eyeShape:     'soft',
    eyeLidOffset: 4,
    beakPath:     'M 88,115 Q 100,126 112,115 L 112,120 Q 100,130 88,120 Z',
    headTilt:     5,
  },
  thoughtful: {
    leftPupil:    { cx: 74,  cy: 81 },
    rightPupil:   { cx: 118, cy: 81 },
    leftBrow:     'M 62 60 Q 78 57 94 60',
    rightBrow:    'M 106 54 Q 122 48 138 54',
    eyeShape:     'relaxed',
    eyeLidOffset: 2,
    beakPath:     'M 89,114 L 111,114 L 111,119 L 89,119 Z',
    headTilt:     -7,
  },
}

export default function OllieAvatar({ avatarState, movement, beakOpen = false }: OllieAvatarProps) {
  const uid          = useId().replace(/:/g, '')
  const expr         = EXPRESSIONS[avatarState]
  const eyeRy        = EYE_RY[expr.eyeShape]
  const leftPupilCy  = expr.leftPupil.cy  + expr.eyeLidOffset
  const rightPupilCy = expr.rightPupil.cy + expr.eyeLidOffset
  const beakPath     = beakOpen ? BEAK_OPEN : expr.beakPath

  return (
    <div
      role="img"
      aria-label={`OLLIE está ${avatarState}`}
      className={`w-48 h-48 ollie-avatar ollie-${avatarState} ollie-${movement}`}
    >
      <svg
        viewBox="0 0 200 240"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`ollieLeftEyeClip-${uid}`}>
            <ellipse cx="78" cy="82" rx="22" ry={eyeRy} />
          </clipPath>
          <clipPath id={`ollieRightEyeClip-${uid}`}>
            <ellipse cx="122" cy="82" rx="22" ry={eyeRy} />
          </clipPath>

          <radialGradient id={`ollieHeadGrad-${uid}`} cx="40%" cy="32%" r="65%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#FBC04A" />
            <stop offset="55%"  stopColor="#E0900F" />
            <stop offset="100%" stopColor="#8A4A05" />
          </radialGradient>

          <radialGradient id={`ollieBodyGrad-${uid}`} cx="45%" cy="28%" r="70%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#F4AE26" />
            <stop offset="55%"  stopColor="#D9870C" />
            <stop offset="100%" stopColor="#834505" />
          </radialGradient>

          <radialGradient id={`ollieBellyGrad-${uid}`} cx="50%" cy="32%" r="62%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="78%"  stopColor="#F4EEE2" />
            <stop offset="100%" stopColor="#E2DACB" />
          </radialGradient>

          <radialGradient id={`ollieWingGrad-${uid}`} cx="50%" cy="28%" r="72%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#C9870E" />
            <stop offset="100%" stopColor="#6E3A03" />
          </radialGradient>

          <radialGradient id={`ollieFaceDiscGrad-${uid}`} cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#FCE4A6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FCE4A6" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`ollieHatGrad-${uid}`} cx="42%" cy="22%" r="80%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#F2A91E" />
            <stop offset="55%"  stopColor="#D2820B" />
            <stop offset="100%" stopColor="#9A5604" />
          </radialGradient>

          <radialGradient id={`ollieHatTopGrad-${uid}`} cx="42%" cy="22%" r="85%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#F4B12A" />
            <stop offset="60%"  stopColor="#D9870C" />
            <stop offset="100%" stopColor="#8F5004" />
          </radialGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="100" cy="236" rx="56" ry="6" fill="#3A1C00" opacity="0.18" />

        {/* Wings */}
        <ellipse cx="38"  cy="160" rx="26" ry="54" fill={`url(#ollieWingGrad-${uid})`} transform="rotate(-14 38 160)" />
        <ellipse cx="162" cy="160" rx="26" ry="54" fill={`url(#ollieWingGrad-${uid})`} transform="rotate(14 162 160)" />

        {/* Wing feather detail lines */}
        <path d="M 28,148 Q 34,155 28,162" stroke="#4F2C00" strokeWidth="1.5" fill="none" opacity="0.55" />
        <path d="M 22,158 Q 28,165 22,172" stroke="#4F2C00" strokeWidth="1.5" fill="none" opacity="0.55" />
        <path d="M 172,148 Q 166,155 172,162" stroke="#4F2C00" strokeWidth="1.5" fill="none" opacity="0.55" />
        <path d="M 178,158 Q 172,165 178,172" stroke="#4F2C00" strokeWidth="1.5" fill="none" opacity="0.55" />

        {/* Body */}
        <ellipse cx="100" cy="168" rx="72" ry="60" fill={`url(#ollieBodyGrad-${uid})`} />

        {/* Belly */}
        <ellipse cx="100" cy="178" rx="44" ry="52" fill={`url(#ollieBellyGrad-${uid})`} />

        {/* Belly feather texture — 3 rows */}
        <path d="M 87,158 Q 93,165 100,158"   stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
        <path d="M 100,158 Q 107,165 114,158" stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
        <path d="M 82,170 Q 90,177 98,170"    stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
        <path d="M 102,170 Q 110,177 118,170" stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
        <path d="M 86,182 Q 95,189 104,182"   stroke="#D8D0C4" strokeWidth="1.5" fill="none" />

        {/* Head group */}
        <g data-testid="ollie-head-group" transform={`rotate(${expr.headTilt}, 100, 80)`}>

          {/* Head circle */}
          <circle cx="100" cy="80" r="54" fill={`url(#ollieHeadGrad-${uid})`} />

          {/* Facial disc overlay */}
          <ellipse cx="100" cy="84" rx="46" ry="44" fill={`url(#ollieFaceDiscGrad-${uid})`} />

          {/* Left ear tuft — 3 overlapping polygons for feather texture */}
          <polygon points="70,33 58,8 80,26"  fill={`url(#ollieHeadGrad-${uid})`} />
          <polygon points="65,33 55,12 74,28" fill={`url(#ollieHeadGrad-${uid})`} opacity="0.85" />
          <polygon points="75,33 63,8 84,27"  fill={`url(#ollieHeadGrad-${uid})`} opacity="0.7" />

          {/* Right ear tuft — 3 overlapping polygons */}
          <polygon points="130,33 142,8 120,26"  fill={`url(#ollieHeadGrad-${uid})`} />
          <polygon points="135,33 145,12 126,28" fill={`url(#ollieHeadGrad-${uid})`} opacity="0.85" />
          <polygon points="125,33 137,8 116,27"  fill={`url(#ollieHeadGrad-${uid})`} opacity="0.7" />

          {/* Mortarboard hat — wide brim */}
          <rect x="16" y="36" width="168" height="13" rx="5" fill={`url(#ollieHatGrad-${uid})`} />
          {/* White band */}
          <rect x="48" y="28" width="104" height="10" rx="3" fill="#F8F3EA" />
          {/* Hat top */}
          <rect x="55" y="1" width="90" height="29" rx="6" fill={`url(#ollieHatTopGrad-${uid})`} />
          {/* Tassel cord — rendered after hat top so it appears on top */}
          <line x1="144" y1="8" x2="172" y2="30" stroke="#7A3E00" strokeWidth="2.5" />
          {/* Tassel pompom — double circle for volume */}
          <circle cx="174" cy="33" r="7" fill="#7A3E00" />
          <circle cx="174" cy="33" r="4" fill="#A85E08" />

          {/* White eye sclera */}
          <ellipse data-testid="ollie-left-eye"  cx="78"  cy="82" rx="22" ry={eyeRy} fill="white" />
          <ellipse data-testid="ollie-right-eye" cx="122" cy="82" rx="22" ry={eyeRy} fill="white" />

          {/* Pupils with specular highlight */}
          <g clipPath={`url(#ollieLeftEyeClip-${uid})`}>
            <circle cx={expr.leftPupil.cx}      cy={leftPupilCy}      r="13"  fill="#1a1a1a" />
            <circle cx={expr.leftPupil.cx + 5}  cy={leftPupilCy  - 5} r="4.5" fill="white" />
          </g>
          <g clipPath={`url(#ollieRightEyeClip-${uid})`}>
            <circle cx={expr.rightPupil.cx}     cy={rightPupilCy}     r="13"  fill="#1a1a1a" />
            <circle cx={expr.rightPupil.cx + 5} cy={rightPupilCy - 5} r="4.5" fill="white" />
          </g>

          {/* Eyebrows */}
          <path d={expr.leftBrow}  stroke="#5C3200" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d={expr.rightBrow} stroke="#5C3200" strokeWidth="4.5" strokeLinecap="round" fill="none" />

          {/* Mouth interior — rendered before upper beak to sit behind it */}
          {beakOpen && (
            <ellipse
              data-testid="ollie-mouth-interior"
              cx="100" cy="116" rx="15" ry="8"
              fill="#CC3300"
            />
          )}

          {/* Upper beak */}
          <polygon points="100,90 82,115 118,115" fill="#E8B923" />
          <line x1="82" y1="115" x2="118" y2="115" stroke="#C8860A" strokeWidth="1.5" />

          {/* Lower beak */}
          <path
            data-testid="ollie-beak-lower"
            d={beakPath}
            fill="#C8860A"
          />
        </g>

        {/* Left foot — 3 toes */}
        <ellipse cx="74"  cy="222" rx="7"  ry="4.5" fill="#E8B923" />
        <ellipse cx="85"  cy="223" rx="9"  ry="5.5" fill="#E8B923" />
        <ellipse cx="96"  cy="222" rx="7"  ry="4.5" fill="#E8B923" />

        {/* Right foot — 3 toes */}
        <ellipse cx="104" cy="222" rx="7"  ry="4.5" fill="#E8B923" />
        <ellipse cx="115" cy="223" rx="9"  ry="5.5" fill="#E8B923" />
        <ellipse cx="126" cy="222" rx="7"  ry="4.5" fill="#E8B923" />
      </svg>
    </div>
  )
}
