import type { AvatarState, Movement } from '@/types/chat'

interface OllieAvatarProps {
  avatarState: AvatarState
  movement: Movement
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

const EXPRESSIONS: Record<AvatarState, ExpressionConfig> = {
  neutral: {
    leftPupil:    { cx: 78,  cy: 80 },
    rightPupil:   { cx: 122, cy: 80 },
    leftBrow:     'M 62 56 Q 78 50 94 56',
    rightBrow:    'M 106 56 Q 122 50 138 56',
    eyeShape:     'open',
    eyeLidOffset: 0,
    beakPath:     'M 88,112 L 112,112 L 110,120 L 90,120 Z',
    headTilt:     0,
  },
  happy: {
    leftPupil:    { cx: 78,  cy: 82 },
    rightPupil:   { cx: 122, cy: 82 },
    leftBrow:     'M 62 49 Q 78 41 94 49',
    rightBrow:    'M 106 49 Q 122 41 138 49',
    eyeShape:     'squint',
    eyeLidOffset: 3,
    beakPath:     'M 82,110 Q 100,130 118,110 L 117,116 Q 100,134 83,116 Z',
    headTilt:     0,
  },
  encouraging: {
    leftPupil:    { cx: 80,  cy: 79 },
    rightPupil:   { cx: 124, cy: 79 },
    leftBrow:     'M 62 53 Q 78 45 94 53',
    rightBrow:    'M 106 49 Q 122 41 138 49',
    eyeShape:     'focused',
    eyeLidOffset: 1,
    beakPath:     'M 82,110 L 118,110 L 118,119 L 82,119 Z',
    headTilt:     -3,
  },
  empathetic: {
    leftPupil:    { cx: 78,  cy: 83 },
    rightPupil:   { cx: 122, cy: 83 },
    leftBrow:     'M 64 61 Q 76 54 86 52 Q 90 51 94 53',
    rightBrow:    'M 106 53 Q 110 51 114 52 Q 124 54 136 61',
    eyeShape:     'soft',
    eyeLidOffset: 4,
    beakPath:     'M 88,113 Q 100,124 112,113 L 112,118 Q 100,128 88,118 Z',
    headTilt:     5,
  },
  thoughtful: {
    leftPupil:    { cx: 74,  cy: 79 },
    rightPupil:   { cx: 118, cy: 79 },
    leftBrow:     'M 62 58 Q 78 55 94 58',
    rightBrow:    'M 106 52 Q 122 46 138 52',
    eyeShape:     'relaxed',
    eyeLidOffset: 2,
    beakPath:     'M 89,112 L 111,112 L 111,117 L 89,117 Z',
    headTilt:     -7,
  },
}

export default function OllieAvatar({ avatarState, movement }: OllieAvatarProps) {
  const expr        = EXPRESSIONS[avatarState]
  const eyeRy       = EYE_RY[expr.eyeShape]
  const leftPupilCy  = expr.leftPupil.cy  + expr.eyeLidOffset
  const rightPupilCy = expr.rightPupil.cy + expr.eyeLidOffset

  return (
    <div
      role="img"
      aria-label={`OLLIE está ${avatarState}`}
      className={`w-48 h-48 ollie-avatar ollie-${avatarState} ollie-${movement}`}
    >
      <svg
        viewBox="0 0 200 220"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        aria-hidden="true"
      >
        <defs>
          {/* Clipping das pupilas */}
          <clipPath id="ollieLeftEyeClip">
            <ellipse cx="78" cy="80" rx="22" ry={eyeRy} />
          </clipPath>
          <clipPath id="ollieRightEyeClip">
            <ellipse cx="122" cy="80" rx="22" ry={eyeRy} />
          </clipPath>

          {/* Gradiente 3D da cabeça */}
          <radialGradient id="ollieHeadGrad" cx="42%" cy="35%" r="58%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#F0A020" />
            <stop offset="55%"  stopColor="#C8760A" />
            <stop offset="100%" stopColor="#8A4A00" />
          </radialGradient>

          {/* Gradiente 3D do corpo */}
          <radialGradient id="ollieBodyGrad" cx="45%" cy="28%" r="65%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#E89C18" />
            <stop offset="50%"  stopColor="#C8760A" />
            <stop offset="100%" stopColor="#8A4A00" />
          </radialGradient>

          {/* Gradiente da barriga */}
          <radialGradient id="ollieBellyGrad" cx="50%" cy="38%" r="60%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="85%"  stopColor="#F0EAE0" />
            <stop offset="100%" stopColor="#E0D8CC" />
          </radialGradient>

          {/* Gradiente das asas */}
          <radialGradient id="ollieWingGrad" cx="50%" cy="30%" r="70%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#B87808" />
            <stop offset="100%" stopColor="#6A3800" />
          </radialGradient>

          {/* Disco facial */}
          <radialGradient id="ollieFaceDiscGrad" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#F0D490" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F0D490" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sombra no chão */}
        <ellipse cx="100" cy="219" rx="52" ry="5" fill="#5A2A00" opacity="0.22" />

        {/* Asas */}
        <ellipse cx="42"  cy="148" rx="22" ry="46" fill="url(#ollieWingGrad)" transform="rotate(-10 42 148)" />
        <ellipse cx="158" cy="148" rx="22" ry="46" fill="url(#ollieWingGrad)" transform="rotate(10 158 148)" />

        {/* Corpo com gradiente 3D */}
        <ellipse cx="100" cy="150" rx="62" ry="68" fill="url(#ollieBodyGrad)" />

        {/* Barriga */}
        <ellipse cx="100" cy="160" rx="38" ry="48" fill="url(#ollieBellyGrad)" />

        {/* Marcas de penas */}
        <path d="M 88 152 Q 94 159 100 152" stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
        <path d="M 100 152 Q 106 159 112 152" stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
        <path d="M 83 164 Q 91 171 99 164"  stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
        <path d="M 101 164 Q 109 171 117 164" stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
        <path d="M 88 177 Q 96 184 104 177"  stroke="#D8D0C4" strokeWidth="1.5" fill="none" />

        {/* Grupo da cabeça */}
        <g data-testid="ollie-head-group" transform={`rotate(${expr.headTilt}, 100, 78)`}>
          {/* Cabeça com gradiente 3D */}
          <circle cx="100" cy="78" r="52" fill="url(#ollieHeadGrad)" />

          {/* Disco facial */}
          <ellipse cx="100" cy="82" rx="46" ry="44" fill="url(#ollieFaceDiscGrad)" />

          {/* Tufos das orelhas */}
          <polygon points="72,32 60,10 84,28" fill="url(#ollieHeadGrad)" />
          <polygon points="128,32 140,10 116,28" fill="url(#ollieHeadGrad)" />

          {/* Chapéu — aba LARGA (mortarboard) */}
          <rect x="18" y="34" width="164" height="12" rx="5" fill="#4A2800" />
          {/* Chapéu — faixa branca entre aba e topo */}
          <rect x="48" y="27" width="104" height="10" rx="3" fill="#F5F0E8" />
          {/* Chapéu — topo chocolate escuro */}
          <rect x="56" y="1" width="88" height="28" rx="5" fill="#3D2000" />
          {/* Chapéu — borla */}
          <line x1="142" y1="10" x2="170" y2="28" stroke="#C8860A" strokeWidth="2.5" />
          <circle cx="172" cy="30" r="7" fill="#C8860A" />

          {/* Olhos brancos */}
          <ellipse data-testid="ollie-left-eye"  cx="78"  cy="80" rx="22" ry={eyeRy} fill="white" />
          <ellipse data-testid="ollie-right-eye" cx="122" cy="80" rx="22" ry={eyeRy} fill="white" />

          {/* Pupilas */}
          <g clipPath="url(#ollieLeftEyeClip)">
            <circle cx={expr.leftPupil.cx}      cy={leftPupilCy}      r="13"  fill="#1a1a1a" />
            <circle cx={expr.leftPupil.cx + 5}  cy={leftPupilCy  - 5} r="4.5" fill="white" />
          </g>
          <g clipPath="url(#ollieRightEyeClip)">
            <circle cx={expr.rightPupil.cx}     cy={rightPupilCy}     r="13"  fill="#1a1a1a" />
            <circle cx={expr.rightPupil.cx + 5} cy={rightPupilCy - 5} r="4.5" fill="white" />
          </g>

          {/* Sobrancelhas — marrom escuro, espessas */}
          <path d={expr.leftBrow}  stroke="#5C3200" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d={expr.rightBrow} stroke="#5C3200" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Interior da boca — visível quando bico abre (happy/encouraging) */}
          <ellipse cx="100" cy="114" rx="16" ry="9" fill="#CC3300" />
          {/* Bico superior — mais largo e proeminente */}
          <polygon points="100,88 82,112 118,112" fill="#E8B923" />
          {/* Bico inferior — expressivo */}
          <path
            data-testid="ollie-beak-lower"
            className="ollie-beak-bottom"
            d={expr.beakPath}
            fill="#C8860A"
          />
        </g>

        {/* Pé esquerdo — 3 dedos em leque */}
        <ellipse cx="75"  cy="214" rx="7" ry="4" fill="#E8B923" />
        <ellipse cx="86"  cy="215" rx="9" ry="5" fill="#E8B923" />
        <ellipse cx="97"  cy="214" rx="7" ry="4" fill="#E8B923" />
        {/* Pé direito — 3 dedos em leque */}
        <ellipse cx="103" cy="214" rx="7" ry="4" fill="#E8B923" />
        <ellipse cx="114" cy="215" rx="9" ry="5" fill="#E8B923" />
        <ellipse cx="125" cy="214" rx="7" ry="4" fill="#E8B923" />
      </svg>
    </div>
  )
}
