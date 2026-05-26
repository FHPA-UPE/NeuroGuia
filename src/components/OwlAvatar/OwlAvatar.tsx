'use client'
import { useId } from 'react'
import type { AvatarState, Movement } from '@/types/chat'

type WingPose = 'rest' | 'raised-thumb' | 'raised-chin'
type EyeShape = 'open' | 'relaxed' | 'squint' | 'soft' | 'focused'

interface OwlAvatarProps {
  avatarState: AvatarState
  movement:     Movement
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
  open:    28,
  relaxed: 22,
  squint:  18,
  soft:    24,
  focused: 26,
}

// Bico aberto atualizado
const BEAK_OPEN = 'M 110,135 Q 120,125 130,135 Q 125,160 120,165 Q 115,160 110,135 Z'
// Bico fechado padrao
const BEAK_CLOSED = 'M 108,135 Q 120,128 132,135 Q 120,148 108,135 Z'

const STATE_LABEL: Record<AvatarState, string> = {
  neutral:     'neutro',
  happy:       'feliz',
  encouraging: 'encorajador',
  empathetic:  'empático',
  thoughtful:  'pensativo',
}

const EXPRESSIONS: Record<AvatarState, ExpressionConfig> = {
  neutral: {
    leftPupil:     { cx: 85,  cy: 122 },
    rightPupil:    { cx: 155, cy: 122 },
    leftBrow:      'M 65 92 Q 85 82 105 92',
    rightBrow:     'M 135 92 Q 155 82 175 92',
    eyeShape:      'open',
    eyeLidOffset:  0,
    beakPath:      BEAK_CLOSED,
    headTilt:      0,
    rightEyeWink:  false,
    wingRightPose: 'rest',
  },
  happy: {
    leftPupil:     { cx: 85,  cy: 122 },
    rightPupil:    { cx: 155, cy: 122 },
    leftBrow:      'M 65 88 Q 85 75 105 88',
    rightBrow:     'M 135 88 Q 155 75 175 88',
    eyeShape:      'squint',
    eyeLidOffset:  2,
    beakPath:      BEAK_OPEN,
    headTilt:      0,
    rightEyeWink:  false,
    wingRightPose: 'rest',
  },
  encouraging: {
    leftPupil:     { cx: 85,  cy: 120 },
    rightPupil:    { cx: 155, cy: 120 },
    leftBrow:      'M 65 85 Q 85 75 105 88',
    rightBrow:     'M 135 88 Q 155 75 175 85',
    eyeShape:      'open',
    eyeLidOffset:  -2,
    beakPath:      BEAK_OPEN,
    headTilt:      -4,
    rightEyeWink:  true,
    wingRightPose: 'raised-thumb',
  },
  empathetic: {
    leftPupil:     { cx: 85,  cy: 124 },
    rightPupil:    { cx: 155, cy: 124 },
    leftBrow:      'M 65 95 Q 85 85 105 100',
    rightBrow:     'M 135 100 Q 155 85 175 95',
    eyeShape:      'soft',
    eyeLidOffset:  2,
    beakPath:      'M 112,136 Q 120,132 128,136 Q 120,142 112,136 Z',
    headTilt:      4,
    rightEyeWink:  false,
    wingRightPose: 'rest',
  },
  thoughtful: {
    leftPupil:     { cx: 78,  cy: 122 },
    rightPupil:    { cx: 148, cy: 122 },
    leftBrow:      'M 65 98 Q 85 92 105 95',
    rightBrow:     'M 135 90 Q 155 82 175 90',
    eyeShape:      'relaxed',
    eyeLidOffset:  0,
    beakPath:      BEAK_CLOSED,
    headTilt:      -6,
    rightEyeWink:  false,
    wingRightPose: 'raised-chin',
  },
}

function renderWingLeft(uid: string) {
  return (
    <g data-testid="owl-wing-left">
      <path
        d="M 50,170 C 15,170 5,235 25,250 C 35,255 45,245 50,250 C 55,255 65,245 70,250 C 80,255 85,210 70,180 Z"
        fill={`url(#owlWingGrad-${uid})`}
      />
      {/* Detalhes de penas */}
      <path d="M 35,220 Q 40,230 35,245" stroke="#A96B00" strokeWidth="2.5" fill="none" opacity="0.4" strokeLinecap="round" />
      <path d="M 55,225 Q 55,235 50,248" stroke="#A96B00" strokeWidth="2.5" fill="none" opacity="0.4" strokeLinecap="round" />
    </g>
  )
}

function renderWingRight(pose: WingPose, uid: string) {
  if (pose === 'raised-thumb') {
    return (
      <g data-testid="owl-wing-right">
        {/* Braço levantado mais gordinho */}
        <path
          d="M 190,170 C 210,170 230,140 210,120 C 200,110 180,120 170,140"
          fill={`url(#owlWingGrad-${uid})`}
        />
        {/* Polegar / Joinha */}
        <path
          data-testid="owl-wing-right-thumb"
          d="M 195,115 Q 195,95 205,95 Q 215,95 210,115 Z"
          fill="#F5AA1C"
        />
      </g>
    )
  }
  if (pose === 'raised-chin') {
    return (
      <g data-testid="owl-wing-right">
        <path
          data-testid="owl-wing-right-chin"
          d="M 170,180 C 190,180 200,150 160,145 C 145,145 150,165 170,180 Z"
          fill={`url(#owlWingGrad-${uid})`}
        />
      </g>
    )
  }
  return (
    <g data-testid="owl-wing-right">
      <path
        d="M 190,170 C 225,170 235,235 215,250 C 205,255 195,245 190,250 C 185,255 175,245 170,250 C 160,255 155,210 170,180 Z"
        fill={`url(#owlWingGrad-${uid})`}
      />
      <path d="M 205,220 Q 200,230 205,245" stroke="#A96B00" strokeWidth="2.5" fill="none" opacity="0.4" strokeLinecap="round" />
      <path d="M 185,225 Q 185,235 190,248" stroke="#A96B00" strokeWidth="2.5" fill="none" opacity="0.4" strokeLinecap="round" />
    </g>
  )
}

export default function OwlAvatar({ avatarState, movement, beakOpen = false }: OwlAvatarProps) {
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
      aria-label={`OWL está ${STATE_LABEL[avatarState]}`}
      className={`w-48 h-48 owl-avatar owl-${avatarState} owl-${movement}`}
    >
      <svg
        viewBox="0 0 240 280"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        aria-hidden="true"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <clipPath id={`owlLeftEyeClip-${uid}`}>
            <ellipse cx="85" cy="122" rx="26" ry={eyeRy} />
          </clipPath>
          <clipPath id={`owlRightEyeClip-${uid}`}>
            <ellipse cx="155" cy="122" rx="26" ry={eyeRy} />
          </clipPath>

          {/* Novos Gradientes baseados na Referência */}
          <radialGradient id={`owlHeadGrad-${uid}`} cx="50%" cy="30%" r="65%">
            <stop offset="0%"    stopColor="#F9AE1A" />
            <stop offset="70%"   stopColor="#D47700" />
            <stop offset="100%"  stopColor="#A25000" />
          </radialGradient>

          <radialGradient id={`owlBodyGrad-${uid}`} cx="50%" cy="20%" r="70%">
            <stop offset="0%"    stopColor="#F4AA18" />
            <stop offset="80%"   stopColor="#C46E00" />
            <stop offset="100%"  stopColor="#904800" />
          </radialGradient>

          <radialGradient id={`owlBellyGrad-${uid}`} cx="50%" cy="40%" r="65%">
            <stop offset="0%"    stopColor="#FFFFFF" />
            <stop offset="85%"   stopColor="#F7F1E6" />
            <stop offset="100%"  stopColor="#E5D6BD" />
          </radialGradient>

          <radialGradient id={`owlWingGrad-${uid}`} cx="40%" cy="25%" r="75%">
            <stop offset="0%"    stopColor="#E89B10" />
            <stop offset="100%"  stopColor="#B25C00" />
          </radialGradient>

          <linearGradient id={`hatBoardGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FAB21A" />
            <stop offset="100%" stopColor="#D98200" />
          </linearGradient>

          <filter id={`owlBodyDepth-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#3A1800" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="120" cy="272" rx="65" ry="8" fill="#3A1C00" opacity="0.15" />

        <g filter={`url(#owlBodyDepth-${uid})`}>

          {/* Asas */}
          {renderWingLeft(uid)}
          {renderWingRight(expr.wingRightPose, uid)}

          {/* Corpo principal (Formato Pêra) */}
          <path 
            d="M 65,140 C 40,200 60,260 120,260 C 180,260 200,200 175,140 Z" 
            fill={`url(#owlBodyGrad-${uid})`} 
          />

          {/* Barriga Branca Distincta */}
          <path 
            d="M 75,185 C 65,225 85,252 120,252 C 155,252 175,225 165,185 C 155,150 85,150 75,185 Z" 
            fill={`url(#owlBellyGrad-${uid})`} 
          />

          {/* Penas da barriga (Formato U/Scallop) */}
          <g stroke="#D4C8B8" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M 105,200 Q 112,208 120,200" />
            <path d="M 120,200 Q 128,208 135,200" />
            <path d="M 98,215 Q 105,223 112,215" />
            <path d="M 112,215 Q 120,223 128,215" />
            <path d="M 128,215 Q 135,223 142,215" />
            <path d="M 105,230 Q 112,238 120,230" />
            <path d="M 120,230 Q 128,238 135,230" />
          </g>

          {/* Grupo da Cabeça */}
          <g data-testid="owl-head-group" transform={`rotate(${expr.headTilt}, 120, 115)`}>

            {/* Formato da Cabeça (Larga e redonda) */}
            <path 
              d="M 45,115 C 45,60 70,40 120,40 C 170,40 195,60 195,115 C 195,160 170,180 120,180 C 70,180 45,160 45,115 Z" 
              fill={`url(#owlHeadGrad-${uid})`} 
            />

            {/* Máscara Facial (Coração/Oval suave unidos) */}
            <path 
              d="M 120,70 
                 C 180,60 205,110 185,150 
                 C 165,180 130,165 120,175 
                 C 110,165 75,180 55,150 
                 C 35,110 60,60 120,70 Z" 
              fill="#FFF8EC" 
            />

            {/* Chapéu de Formatura Isométrico */}
            {/* Base Cilíndrica */}
            <path d="M 75,45 Q 120,65 165,45 L 165,55 Q 120,75 75,55 Z" fill="#BB6900" />
            {/* Faixa branca (Chevron) na base */}
            <path d="M 75,50 Q 120,70 165,50 L 165,53 Q 120,73 75,53 Z" fill="#FFFFFF" opacity="0.9" />
            {/* Espessura do Topo do Chapéu */}
            <path d="M 30,30 L 120,53 L 210,30 L 210,38 L 120,61 L 30,38 Z" fill="#B36A00" />
            {/* Superfície do Topo do Chapéu */}
            <path d="M 120,10 L 210,30 L 120,53 L 30,30 Z" fill={`url(#hatBoardGrad-${uid})`} />
            {/* Botão Superior */}
            <ellipse cx="120" cy="31" rx="7" ry="3.5" fill="#FFDC73" />
            
            {/* Tassel (Cordinha e franja pendurada) pendendo para a ESQUERDA da tela */}
            <path d="M 120,31 L 55,42 L 50,65" fill="none" stroke="#F5AA1C" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="65" r="4" fill="#E89B10" />
            <path d="M 46,67 L 42,85 M 48,68 L 46,88 M 50,68 L 50,89 M 52,68 L 54,88 M 54,67 L 58,85" stroke="#F5AA1C" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Sclera Esquerda */}
            <ellipse data-testid="owl-left-eye" cx="85" cy="122" rx="26" ry={eyeRy} fill="white" stroke="#E5D6BD" strokeWidth="1" />

            {/* Sclera Direita ou Piscadela */}
            {expr.rightEyeWink ? (
              <path
                data-testid="owl-eye-right-wink"
                d="M 132,122 Q 155,100 178,122"
                stroke="#1A1A1A"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <ellipse data-testid="owl-right-eye" cx="155" cy="122" rx="26" ry={eyeRy} fill="white" stroke="#E5D6BD" strokeWidth="1" />
            )}

            {/* Pupila Esquerda */}
            <g clipPath={`url(#owlLeftEyeClip-${uid})`}>
              <ellipse cx={expr.leftPupil.cx} cy={leftPupilCy} rx="18" ry="20" fill="#1A1A1A" />
              {/* Reflexos Gigantes */}
              <circle cx={expr.leftPupil.cx + 5} cy={leftPupilCy - 6} r="7" fill="white" />
              <circle cx={expr.leftPupil.cx - 6} cy={leftPupilCy + 6} r="3" fill="white" opacity="0.8" />
            </g>

            {/* Pupila Direita */}
            {!expr.rightEyeWink && (
              <g clipPath={`url(#owlRightEyeClip-${uid})`}>
                <ellipse cx={expr.rightPupil.cx} cy={rightPupilCy} rx="18" ry="20" fill="#1A1A1A" />
                <circle cx={expr.rightPupil.cx + 5} cy={rightPupilCy - 6} r="7" fill="white" />
                <circle cx={expr.rightPupil.cx - 6} cy={rightPupilCy + 6} r="3" fill="white" opacity="0.8" />
              </g>
            )}

            {/* Sobrancelhas Arredondadas e Grossas */}
            <path d={expr.leftBrow} stroke="#5C3400" strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d={expr.rightBrow} stroke="#5C3400" strokeWidth="9" strokeLinecap="round" fill="none" />

            {/* Bico (Forma Fleshy 3D) */}
            <path 
              data-testid="owl-beak"
              d={beakPathFinal} 
              fill="#F9AE1A" 
              stroke="#CC7A00" 
              strokeWidth="1" 
              strokeLinejoin="round" 
            />
            {/* Reflexo no Bico */}
            <path d="M 112,136 Q 120,131 128,136 Q 120,140 112,136 Z" fill="#FFE082" opacity="0.6" />
            
            {/* Interior da Boca */}
            {isBeakOpen && (
              <path d="M 115,145 Q 120,138 125,145 Q 120,158 115,145 Z" fill="#8C1C00" />
            )}

          </g>
        </g>

        {/* Pés - Estilo "Pílulas" 3D para combinar com o design mais arredondado */}
        {/* Pé Esquerdo */}
        <rect x="75" y="254" width="12" height="16" rx="6" fill="#F5AA1C" transform="rotate(15 81 262)" />
        <rect x="85" y="256" width="12" height="16" rx="6" fill="#F5AA1C" />
        <rect x="95" y="254" width="12" height="16" rx="6" fill="#F5AA1C" transform="rotate(-15 101 262)" />

        {/* Pé Direito */}
        <rect x="133" y="254" width="12" height="16" rx="6" fill="#F5AA1C" transform="rotate(15 139 262)" />
        <rect x="143" y="256" width="12" height="16" rx="6" fill="#F5AA1C" />
        <rect x="153" y="254" width="12" height="16" rx="6" fill="#F5AA1C" transform="rotate(-15 159 262)" />

      </svg>
    </div>
  )
}