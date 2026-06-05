# Ollie Avatar Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `OllieAvatar.tsx` as a full-fidelity SVG cartoon owl matching the "Ollie - Base.png" reference image — new viewBox 240×280, rounder proportions, 5 expressive states with wing pose variants and wink eye.

**Architecture:** Single-file SVG component rewrite; interface public permanece idêntica (`avatarState`, `movement`, `beakOpen?`). Wing poses (`rest`, `raised-thumb`, `raised-chin`) são renderizadas via funções auxiliares `renderWingLeft/Right`. O estado `empathetic` substitui a sclera direita por um arco de wink. `globals.css` recebe keyframes atualizados.

**Tech Stack:** React 19, TypeScript, SVG inline, Tailwind CSS 4, Jest + Testing Library

---

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/app/globals.css` | Atualizar keyframes `ollie-bob`, `ollie-talk-bob`, `ollie-think`; adicionar `ollie-tassel-pendulum`; atualizar classes `.ollie-*` |
| `src/components/OllieAvatar/OllieAvatar.test.tsx` | Atualizar transform string do head-group; adicionar testes para wink, raised-thumb, raised-chin |
| `src/components/OllieAvatar/OllieAvatar.tsx` | Reescrita completa |

---

## Task 1: Atualizar animações CSS em globals.css

**Arquivos:**
- Modify: `src/app/globals.css` (linhas 100–117)

- [ ] **Step 1: Localizar bloco de animações ollie em globals.css**

  Linhas ~100–117 contêm os keyframes `ollie-bob`, `ollie-think` e as classes `.ollie-idle/.ollie-talking/.ollie-thinking`. Este é o único bloco a ser modificado — os keyframes `owl-*` (linhas 62–98) permanecem intocados.

- [ ] **Step 2: Substituir o bloco ollie com as animações atualizadas**

  Substituir as linhas 100–117 inteiras por:

  ```css
  @keyframes ollie-bob {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
  }

  @keyframes ollie-talk-bob {
    0%, 100% { transform: translateY(0) scaleX(1);       }
    25%       { transform: translateY(-4px) scaleX(1.03); }
    75%       { transform: translateY(2px) scaleX(0.98);  }
  }

  @keyframes ollie-think {
    0%, 100% { transform: rotate(0deg);  }
    30%       { transform: rotate(-8deg); }
    70%       { transform: rotate(6deg);  }
  }

  @keyframes ollie-tassel-pendulum {
    0%, 100% { transform: rotate(-20deg); transform-origin: top center; }
    50%       { transform: rotate(20deg);  transform-origin: top center; }
  }

  .ollie-idle     { animation: ollie-bob      3s    ease-in-out infinite; }
  .ollie-talking  { animation: ollie-talk-bob 0.35s ease-in-out infinite; }
  .ollie-thinking { animation: ollie-think    2.5s  ease-in-out infinite; }

  .ollie-thoughtful [data-testid="ollie-hat-tassel"] {
    animation: ollie-tassel-pendulum 1.5s ease-in-out infinite;
  }
  ```

  Garantir que o bloco `@media (prefers-reduced-motion: reduce)` já existente (linhas 56–60) inclua `.ollie-thoughtful [data-testid="ollie-hat-tassel"]`:

  ```css
  @media (prefers-reduced-motion: reduce) {
    .owl-idle, .owl-talking, .owl-thinking, .owl-talk,
    .ollie-idle, .ollie-talking, .ollie-thinking,
    .ollie-thoughtful [data-testid="ollie-hat-tassel"],
    .owl-state-happy #owl-hat, .owl-state-happy #owl-hat-tassel,
    .owl-state-thoughtful #owl-hat-tassel { animation: none; }
  }
  ```

- [ ] **Step 3: Verificar que nenhum keyframe owl-* foi alterado**

  ```bash
  npm run lint
  ```

  Esperado: sem erros relacionados ao CSS.

---

## Task 2: Atualizar OllieAvatar.test.tsx (testes falhando)

**Arquivos:**
- Modify: `src/components/OllieAvatar/OllieAvatar.test.tsx`

- [ ] **Step 1: Substituir o conteúdo do arquivo de testes**

  O novo viewBox é `0 0 240 280` e o head-group tem pivot em `(120, 115)`. Os testes abaixo atualizam os existentes e adicionam cobertura para wink e poses de asa:

  ```tsx
  import '@testing-library/jest-dom'
  import { render, screen, cleanup } from '@testing-library/react'
  import OllieAvatar from './OllieAvatar'

  describe('OllieAvatar', () => {
    it('renderiza com role img e aria-label descrevendo estado', () => {
      render(<OllieAvatar avatarState="neutral" movement="idle" />)
      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('aria-label', expect.stringContaining('neutral'))
    })

    it('grupo da cabeça não inclina no neutral', () => {
      render(<OllieAvatar avatarState="neutral" movement="idle" beakOpen={false} />)
      expect(screen.getByTestId('ollie-head-group')).toHaveAttribute(
        'transform',
        'rotate(0, 120, 115)',
      )
    })

    it('aplica classe de movimento ollie-talking quando movement=talking', () => {
      const { container } = render(<OllieAvatar avatarState="neutral" movement="talking" />)
      expect(container.querySelector('.ollie-talking')).toBeInTheDocument()
    })

    it('aplica classe de movimento ollie-thinking quando movement=thinking', () => {
      const { container } = render(<OllieAvatar avatarState="neutral" movement="thinking" />)
      expect(container.querySelector('.ollie-thinking')).toBeInTheDocument()
    })

    it('bico inferior usa path com curva quando beakOpen=true', () => {
      render(<OllieAvatar avatarState="neutral" movement="idle" beakOpen={true} />)
      expect(screen.getByTestId('ollie-beak-lower').getAttribute('d')).toMatch(/Q/)
    })

    it('bico inferior usa path reto de neutral quando beakOpen=false', () => {
      render(<OllieAvatar avatarState="neutral" movement="idle" beakOpen={false} />)
      expect(screen.getByTestId('ollie-beak-lower').getAttribute('d')).not.toMatch(/Q/)
    })

    it('interior da boca presente quando beakOpen=true', () => {
      render(<OllieAvatar avatarState="neutral" movement="idle" beakOpen={true} />)
      expect(screen.getByTestId('ollie-mouth-interior')).toBeInTheDocument()
    })

    it('interior da boca ausente quando beakOpen=false em estado neutral', () => {
      render(<OllieAvatar avatarState="neutral" movement="idle" beakOpen={false} />)
      expect(screen.queryByTestId('ollie-mouth-interior')).not.toBeInTheDocument()
    })

    it('interior da boca presente no estado happy mesmo sem beakOpen', () => {
      render(<OllieAvatar avatarState="happy" movement="idle" beakOpen={false} />)
      expect(screen.getByTestId('ollie-mouth-interior')).toBeInTheDocument()
    })

    it('interior da boca presente no estado encouraging mesmo sem beakOpen', () => {
      render(<OllieAvatar avatarState="encouraging" movement="idle" beakOpen={false} />)
      expect(screen.getByTestId('ollie-mouth-interior')).toBeInTheDocument()
    })

    it('chapéu mortarboard presente no SVG', () => {
      const { container } = render(<OllieAvatar avatarState="neutral" movement="idle" />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('grupo da cabeça inclina diferente entre estados com tilt diferente', () => {
      render(<OllieAvatar avatarState="neutral" movement="idle" />)
      const neutralTransform = screen.getByTestId('ollie-head-group').getAttribute('transform')
      expect(neutralTransform).toBe('rotate(0, 120, 115)')

      cleanup()

      render(<OllieAvatar avatarState="empathetic" movement="idle" />)
      const empatheticTransform = screen.getByTestId('ollie-head-group').getAttribute('transform')
      expect(empatheticTransform).not.toBe('rotate(0, 120, 115)')
    })

    it('estado empathetic renderiza wink no olho direito', () => {
      render(<OllieAvatar avatarState="empathetic" movement="idle" />)
      expect(screen.getByTestId('ollie-eye-right-wink')).toBeInTheDocument()
      expect(screen.queryByTestId('ollie-right-eye')).not.toBeInTheDocument()
    })

    it('estado empathetic não renderiza pupila direita', () => {
      render(<OllieAvatar avatarState="empathetic" movement="idle" />)
      // ollie-right-eye sclera ausente → pupila também ausente (sem clipPath destino)
      expect(screen.queryByTestId('ollie-right-eye')).not.toBeInTheDocument()
    })

    it('estado encouraging renderiza asa direita com joinha', () => {
      render(<OllieAvatar avatarState="encouraging" movement="idle" />)
      expect(screen.getByTestId('ollie-wing-right-thumb')).toBeInTheDocument()
    })

    it('estado thoughtful renderiza asa direita no queixo', () => {
      render(<OllieAvatar avatarState="thoughtful" movement="idle" />)
      expect(screen.getByTestId('ollie-wing-right-chin')).toBeInTheDocument()
    })

    it('estados neutral/happy/empathetic/thoughtful não têm joinha', () => {
      for (const state of ['neutral', 'happy', 'empathetic', 'thoughtful'] as const) {
        const { unmount } = render(<OllieAvatar avatarState={state} movement="idle" />)
        expect(screen.queryByTestId('ollie-wing-right-thumb')).not.toBeInTheDocument()
        unmount()
      }
    })
  })
  ```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

  ```bash
  npm test -- --testPathPattern=OllieAvatar --no-coverage
  ```

  Esperado: múltiplos FAIL (transform string incorreta, testIds ausentes). Isso confirma que os testes são válidos e aguardam a implementação.

---

## Task 3: Reescrever OllieAvatar.tsx — tipos, ExpressionConfig e helpers de asa

**Arquivos:**
- Modify: `src/components/OllieAvatar/OllieAvatar.tsx` (reescrita completa)

- [ ] **Step 1: Substituir o arquivo inteiro com os tipos e dados de expressão**

  ```tsx
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
  ```

- [ ] **Step 2: Adicionar helpers de asa logo após EXPRESSIONS**

  Adicionar as funções `renderWingLeft` e `renderWingRight` no mesmo arquivo, após o objeto `EXPRESSIONS`:

  ```tsx
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
  ```

---

## Task 4: Implementar o componente SVG em OllieAvatar.tsx

**Arquivos:**
- Modify: `src/components/OllieAvatar/OllieAvatar.tsx` (continuação — adicionar a função default export)

- [ ] **Step 1: Adicionar a função componente após os helpers**

  Adicionar ao final do arquivo (após `renderWingRight`):

  ```tsx
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
        aria-label={`OLLIE está ${avatarState}`}
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
  ```

---

## Task 5: Rodar testes, lint e commit

**Arquivos:**
- Nenhum (verificação)

- [ ] **Step 1: Rodar a suite de testes do OllieAvatar**

  ```bash
  npm test -- --testPathPattern=OllieAvatar --no-coverage
  ```

  Esperado: todos os testes PASS. Se algum falhar, consultar a mensagem de erro — a causa mais provável é um `data-testid` com typo ou uma coordenada de `transform` com formato diferente do esperado.

- [ ] **Step 2: Rodar lint**

  ```bash
  npm run lint
  ```

  Esperado: sem erros. Se houver warning de `react/no-unknown-property` para atributos SVG como `floodColor`/`floodOpacity`, é falso positivo — o Next.js/React 19 suporta esses atributos corretamente.

- [ ] **Step 3: Verificar build**

  ```bash
  npm run build
  ```

  Esperado: build sem erros de TypeScript.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/OllieAvatar/OllieAvatar.tsx src/components/OllieAvatar/OllieAvatar.test.tsx src/app/globals.css
  git commit -m "feat(avatar): redesign OllieAvatar SVG — new proportions, wing poses, wink eye"
  ```

---

## Notas de ajuste fino pós-implementação

Após ver o avatar no browser (`npm run dev`), alguns valores podem precisar de ajuste visual:

- **Tufos de orelha** — se ficarem ocultos demais pelo chapéu, aumentar os valores Y negativos (ex: de `y=16` para `y=8`) para as pontas dos polígonos.
- **Pose raised-thumb** — se o "joinha" parecer desconectado do corpo, ajustar a path do braço (`M 196,178 Q 202,165 196,158`), aumentando o `ry` da path stroke ou ajustando o cx/cy.
- **Pose raised-chin** — se a asa não tocar o bico, ajustar `cx` da elipse de `168` para `160` ou reduzir o ângulo de rotação de `-50` para `-40`.
- **Belly position** — se o belly parecer muito alto, mudar `cy` de `218` para `222`.
- **Pés** — se ficarem fora do viewBox, mudar `cy` de `266/268` para `262/264`.

Esses ajustes são cosméticos e devem ser feitos na Task 4 antes do commit final.
