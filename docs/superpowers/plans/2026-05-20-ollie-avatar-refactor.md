# Ollie Avatar Refactor + TTS Lip Sync — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever o SVG do avatar Ollie com alta fidelidade visual (estilo 3D da referência) e adicionar lip sync real via Web Speech API, com boca sincronizada a cada palavra pronunciada.

**Architecture:** Nova prop `beakOpen: boolean` controla o estado do bico via React (substituindo o CSS loop). Um hook `useTTS` encapsula toda a lógica da Web Speech API e retorna `{ isSpeaking, beakOpen }`. O `ChatInterface` chama o hook com o último texto do assistente e repassa as props ao avatar.

**Tech Stack:** Next.js 16, React 19, TypeScript, SVG inline, Web Speech API (`SpeechSynthesisUtterance`), Jest 30, @testing-library/react 16

**Referência visual obrigatória:** `C:\Users\FHPA\Downloads\Ollie - Base.png` — **abrir antes de qualquer tarefa que toque o SVG**

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `src/components/OllieAvatar/OllieAvatar.tsx` | Modificar → Reescrever | SVG completo + prop beakOpen |
| `src/components/OllieAvatar/OllieAvatar.test.tsx` | Modificar | Testes da nova prop e novo SVG |
| `src/app/globals.css` | Modificar | Remover animação CSS do bico |
| `src/hooks/useTTS.ts` | Criar | Hook Web Speech API |
| `src/hooks/useTTS.test.ts` | Criar | Testes do hook |
| `src/components/ChatInterface/ChatInterface.tsx` | Modificar | Integrar useTTS |
| `src/components/ChatInterface/ChatInterface.test.tsx` | Modificar | Mock useTTS + novo teste |

---

## Task 1: Adicionar prop `beakOpen` ao OllieAvatar (TDD)

**Files:**
- Modify: `src/components/OllieAvatar/OllieAvatar.test.tsx`
- Modify: `src/components/OllieAvatar/OllieAvatar.tsx`

- [ ] **Step 1: Escrever os testes que vão falhar**

Abrir `src/components/OllieAvatar/OllieAvatar.test.tsx` e **adicionar** os 4 testes abaixo ao final do `describe`, sem remover os existentes:

```tsx
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

  it('interior da boca ausente quando beakOpen=false', () => {
    render(<OllieAvatar avatarState="neutral" movement="idle" beakOpen={false} />)
    expect(screen.queryByTestId('ollie-mouth-interior')).not.toBeInTheDocument()
  })
```

- [ ] **Step 2: Confirmar que os 4 novos testes falham**

```bash
cd frontend
npx jest OllieAvatar.test --no-coverage
```

Esperado: 4 falhas (`beakOpen is not a prop`, `ollie-mouth-interior not found`). Os 9 testes existentes devem continuar passando.

- [ ] **Step 3: Implementar a prop `beakOpen` no componente**

Em `src/components/OllieAvatar/OllieAvatar.tsx`, fazer exatamente as seguintes mudanças (não alterar o SVG ainda):

**3a. Atualizar a interface:**
```tsx
interface OllieAvatarProps {
  avatarState: AvatarState
  movement:    Movement
  beakOpen?:   boolean
}
```

**3b. Adicionar a constante `BEAK_OPEN` imediatamente acima de `const EXPRESSIONS`:**
```tsx
const BEAK_OPEN = 'M 84,112 Q 100,130 116,112 L 114,119 Q 100,136 86,119 Z'
```

**3c. Atualizar a desestruturação da função:**
```tsx
export default function OllieAvatar({ avatarState, movement, beakOpen = false }: OllieAvatarProps) {
```

**3d. Adicionar derivação do path logo após as linhas existentes de `leftPupilCy`/`rightPupilCy`:**
```tsx
  const beakPath = beakOpen ? BEAK_OPEN : expr.beakPath
```

**3e. Trocar `d={expr.beakPath}` por `d={beakPath}` na linha do bico inferior:**
```tsx
          <path
            data-testid="ollie-beak-lower"
            className="ollie-beak-bottom"
            d={beakPath}
            fill="#C8860A"
          />
```

**3f. Substituir o `<ellipse cx="100" cy="114" ...>` existente (boca interior) por renderização condicional com testid:**
```tsx
          {beakOpen && (
            <ellipse
              data-testid="ollie-mouth-interior"
              cx="100" cy="114" rx="16" ry="9"
              fill="#CC3300"
            />
          )}
```
O elemento deve estar posicionado ANTES do `<polygon>` do bico superior na ordem de renderização (mesma posição que o ellipse anterior).

- [ ] **Step 4: Confirmar que todos os testes passam**

```bash
npx jest OllieAvatar.test --no-coverage
```

Esperado: 13 testes passando, 0 falhas.

- [ ] **Step 5: Commit**

```bash
git add src/components/OllieAvatar/OllieAvatar.tsx src/components/OllieAvatar/OllieAvatar.test.tsx
git commit -m "feat(avatar): add beakOpen prop with conditional mouth rendering"
```

---

## Task 2: Reescrever SVG para design de alta fidelidade

**Files:**
- Modify: `src/components/OllieAvatar/OllieAvatar.tsx`
- Modify: `src/components/OllieAvatar/OllieAvatar.test.tsx`

> **ANTES de escrever qualquer código:** Abrir `C:\Users\FHPA\Downloads\Ollie - Base.png` e usar como referência visual direta para proporções, cores, detalhes de penas, chapéu e expressões.

- [ ] **Step 1: Atualizar o teste do head-group para o novo centro da cabeça**

Em `OllieAvatar.test.tsx`, localizar e substituir:
```tsx
  it('grupo da cabeça não inclina no neutral', () => {
    render(<OllieAvatar avatarState="neutral" movement="idle" />)
    expect(screen.getByTestId('ollie-head-group')).toHaveAttribute(
      'transform',
      'rotate(0, 100, 78)',
    )
  })
```
por:
```tsx
  it('grupo da cabeça não inclina no neutral', () => {
    render(<OllieAvatar avatarState="neutral" movement="idle" beakOpen={false} />)
    expect(screen.getByTestId('ollie-head-group')).toHaveAttribute(
      'transform',
      'rotate(0, 100, 80)',
    )
  })
```

- [ ] **Step 2: Confirmar que esse teste agora falha (SVG ainda usa y=78)**

```bash
npx jest OllieAvatar.test --no-coverage
```

Esperado: 1 falha no teste `grupo da cabeça não inclina no neutral`, os outros 12 passando.

- [ ] **Step 3: Reescrever o corpo de `OllieAvatar.tsx`**

Substituir o conteúdo completo de `src/components/OllieAvatar/OllieAvatar.tsx` pelo código abaixo. O viewBox muda para `0 0 200 240`. O centro da cabeça muda para `cy=80`. As coordenadas foram recalculadas para corrigir as proporções e o nível de detalhe.

```tsx
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
          <clipPath id="ollieLeftEyeClip">
            <ellipse cx="78" cy="82" rx="22" ry={eyeRy} />
          </clipPath>
          <clipPath id="ollieRightEyeClip">
            <ellipse cx="122" cy="82" rx="22" ry={eyeRy} />
          </clipPath>

          <radialGradient id="ollieHeadGrad" cx="40%" cy="32%" r="60%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#F2A822" />
            <stop offset="50%"  stopColor="#C8760A" />
            <stop offset="100%" stopColor="#7A3E00" />
          </radialGradient>

          <radialGradient id="ollieBodyGrad" cx="45%" cy="28%" r="65%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#E89C18" />
            <stop offset="50%"  stopColor="#C8760A" />
            <stop offset="100%" stopColor="#7A3E00" />
          </radialGradient>

          <radialGradient id="ollieBellyGrad" cx="50%" cy="35%" r="60%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="80%"  stopColor="#F0EAE0" />
            <stop offset="100%" stopColor="#E0D8CC" />
          </radialGradient>

          <radialGradient id="ollieWingGrad" cx="50%" cy="30%" r="70%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#B87808" />
            <stop offset="100%" stopColor="#6A3800" />
          </radialGradient>

          <radialGradient id="ollieFaceDiscGrad" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#F0D490" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F0D490" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="ollieHatGrad" cx="50%" cy="20%" r="70%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#5A3010" />
            <stop offset="100%" stopColor="#2A1000" />
          </radialGradient>
        </defs>

        {/* Sombra no chão */}
        <ellipse cx="100" cy="236" rx="56" ry="6" fill="#5A2A00" opacity="0.18" />

        {/* Asas */}
        <ellipse cx="38"  cy="160" rx="26" ry="54" fill="url(#ollieWingGrad)" transform="rotate(-14 38 160)" />
        <ellipse cx="162" cy="160" rx="26" ry="54" fill="url(#ollieWingGrad)" transform="rotate(14 162 160)" />

        {/* Detalhe de penas nas asas */}
        <path d="M 28,148 Q 34,155 28,162" stroke="#5A3000" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M 22,158 Q 28,165 22,172" stroke="#5A3000" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M 172,148 Q 166,155 172,162" stroke="#5A3000" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M 178,158 Q 172,165 178,172" stroke="#5A3000" strokeWidth="1.5" fill="none" opacity="0.5" />

        {/* Corpo */}
        <ellipse cx="100" cy="168" rx="72" ry="60" fill="url(#ollieBodyGrad)" />

        {/* Barriga */}
        <ellipse cx="100" cy="178" rx="44" ry="52" fill="url(#ollieBellyGrad)" />

        {/* Marcas de penas na barriga — 3 fileiras */}
        <path d="M 87,158 Q 93,165 100,158" stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
        <path d="M 100,158 Q 107,165 114,158" stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
        <path d="M 82,170 Q 90,177 98,170"  stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
        <path d="M 102,170 Q 110,177 118,170" stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
        <path d="M 86,182 Q 95,189 104,182"  stroke="#D8D0C4" strokeWidth="1.5" fill="none" />

        {/* Grupo da cabeça */}
        <g data-testid="ollie-head-group" transform={`rotate(${expr.headTilt}, 100, 80)`}>

          {/* Cabeça */}
          <circle cx="100" cy="80" r="54" fill="url(#ollieHeadGrad)" />

          {/* Disco facial */}
          <ellipse cx="100" cy="84" rx="46" ry="44" fill="url(#ollieFaceDiscGrad)" />

          {/* Tufo esquerdo — 3 polígonos sobrepostos para textura de pena */}
          <polygon points="70,33 58,8 80,26"  fill="url(#ollieHeadGrad)" />
          <polygon points="65,33 55,12 74,28" fill="url(#ollieHeadGrad)" opacity="0.85" />
          <polygon points="75,33 63,8 84,27"  fill="url(#ollieHeadGrad)" opacity="0.7" />

          {/* Tufo direito — 3 polígonos sobrepostos */}
          <polygon points="130,33 142,8 120,26"  fill="url(#ollieHeadGrad)" />
          <polygon points="135,33 145,12 126,28" fill="url(#ollieHeadGrad)" opacity="0.85" />
          <polygon points="125,33 137,8 116,27"  fill="url(#ollieHeadGrad)" opacity="0.7" />

          {/* Chapéu mortarboard — aba larga */}
          <rect x="16" y="36" width="168" height="13" rx="5" fill="url(#ollieHatGrad)" />
          {/* Faixa branca */}
          <rect x="48" y="28" width="104" height="10" rx="3" fill="#F5F0E8" />
          {/* Topo do chapéu */}
          <rect x="55" y="1" width="90" height="29" rx="6" fill="url(#ollieHatGrad)" />
          {/* Borla — cordão */}
          <line x1="143" y1="10" x2="172" y2="30" stroke="#C8860A" strokeWidth="2.5" />
          {/* Borla — pompom duplo para volume */}
          <circle cx="174" cy="33" r="7" fill="#C8860A" />
          <circle cx="174" cy="33" r="4" fill="#E8A010" />

          {/* Olhos brancos */}
          <ellipse data-testid="ollie-left-eye"  cx="78"  cy="82" rx="22" ry={eyeRy} fill="white" />
          <ellipse data-testid="ollie-right-eye" cx="122" cy="82" rx="22" ry={eyeRy} fill="white" />

          {/* Pupilas */}
          <g clipPath="url(#ollieLeftEyeClip)">
            <circle cx={expr.leftPupil.cx}      cy={leftPupilCy}      r="13"  fill="#1a1a1a" />
            <circle cx={expr.leftPupil.cx + 5}  cy={leftPupilCy  - 5} r="4.5" fill="white" />
          </g>
          <g clipPath="url(#ollieRightEyeClip)">
            <circle cx={expr.rightPupil.cx}     cy={rightPupilCy}     r="13"  fill="#1a1a1a" />
            <circle cx={expr.rightPupil.cx + 5} cy={rightPupilCy - 5} r="4.5" fill="white" />
          </g>

          {/* Sobrancelhas */}
          <path d={expr.leftBrow}  stroke="#5C3200" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d={expr.rightBrow} stroke="#5C3200" strokeWidth="4.5" strokeLinecap="round" fill="none" />

          {/* Interior da boca — renderizado antes do bico superior para ficar atrás */}
          {beakOpen && (
            <ellipse
              data-testid="ollie-mouth-interior"
              cx="100" cy="116" rx="15" ry="8"
              fill="#CC3300"
            />
          )}

          {/* Bico superior */}
          <polygon points="100,90 82,115 118,115" fill="#E8B923" />
          <line x1="82" y1="115" x2="118" y2="115" stroke="#C8860A" strokeWidth="1.5" />

          {/* Bico inferior */}
          <path
            data-testid="ollie-beak-lower"
            d={beakPath}
            fill="#C8860A"
          />
        </g>

        {/* Pé esquerdo — 3 dedos */}
        <ellipse cx="74"  cy="222" rx="7"  ry="4.5" fill="#E8B923" />
        <ellipse cx="85"  cy="223" rx="9"  ry="5.5" fill="#E8B923" />
        <ellipse cx="96"  cy="222" rx="7"  ry="4.5" fill="#E8B923" />

        {/* Pé direito — 3 dedos */}
        <ellipse cx="104" cy="222" rx="7"  ry="4.5" fill="#E8B923" />
        <ellipse cx="115" cy="223" rx="9"  ry="5.5" fill="#E8B923" />
        <ellipse cx="126" cy="222" rx="7"  ry="4.5" fill="#E8B923" />
      </svg>
    </div>
  )
}
```

- [ ] **Step 4: Confirmar que todos os 13 testes passam**

```bash
npx jest OllieAvatar.test --no-coverage
```

Esperado: 13 passando, 0 falhas.

- [ ] **Step 5: Commit**

```bash
git add src/components/OllieAvatar/OllieAvatar.tsx src/components/OllieAvatar/OllieAvatar.test.tsx
git commit -m "feat(avatar): rewrite SVG to high-fidelity Ollie design with corrected proportions"
```

---

## Task 3: Remover animação CSS do bico

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Remover os 3 blocos relacionados ao bico do CSS**

Em `src/app/globals.css`, remover exatamente:

```css
@keyframes ollie-talk {
  0%, 100% { transform: scaleY(1); transform-origin: top center; }
  50%       { transform: scaleY(1.6); transform-origin: top center; }
}
```

```css
.ollie-beak-bottom {
  transform-box: fill-box;
}
```

```css
.ollie-talking .ollie-beak-bottom {
  animation: ollie-talk 0.35s ease-in-out infinite;
}
```

Manter intactos: `@keyframes ollie-bob`, `@keyframes ollie-think`, `.ollie-idle`, `.ollie-talking`, `.ollie-thinking`, `@media (prefers-reduced-motion)`.

O arquivo final deve conter exatamente:

```css
@import "tailwindcss";

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-atkinson), sans-serif;
  background-color: #F5F0E8;
  color: #1a1a1a;
  line-height: 1.6;
  letter-spacing: 0.02em;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .ollie-avatar svg {
    animation: none !important;
  }
}

@keyframes ollie-bob {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}

@keyframes ollie-think {
  0%, 100% { transform: rotate(0deg); transform-origin: bottom center; }
  40%       { transform: rotate(-10deg); transform-origin: bottom center; }
  60%       { transform: rotate(10deg); transform-origin: bottom center; }
}

.ollie-idle     { animation: ollie-bob   3s ease-in-out infinite; }
.ollie-talking  { animation: ollie-bob   3s ease-in-out infinite; }
.ollie-thinking { animation: ollie-think 2s ease-in-out infinite; }
```

- [ ] **Step 2: Rodar todos os testes para confirmar que nada quebrou**

```bash
npx jest --no-coverage
```

Esperado: todos os testes passando.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "refactor(avatar): remove CSS beak animation, now driven by React state"
```

---

## Task 4: Criar hook `useTTS` (TDD)

**Files:**
- Create: `src/hooks/useTTS.test.ts`
- Create: `src/hooks/useTTS.ts`

- [ ] **Step 1: Criar o arquivo de testes com todos os casos**

Criar `src/hooks/useTTS.test.ts` com o conteúdo abaixo:

```ts
import { renderHook, act } from '@testing-library/react'
import { useTTS } from './useTTS'

const mockSpeak  = jest.fn()
const mockCancel = jest.fn()

type MockUtterance = {
  lang:        string
  rate:        number
  pitch:       number
  onstart:     (() => void) | null
  onend:       (() => void) | null
  onerror:     (() => void) | null
  onboundary:  ((e: { name: string }) => void) | null
}

let capturedUtterance: MockUtterance | null = null

beforeEach(() => {
  jest.useFakeTimers()
  capturedUtterance = null
  mockSpeak.mockClear()
  mockCancel.mockClear()

  Object.defineProperty(window, 'speechSynthesis', {
    value:        { speak: mockSpeak, cancel: mockCancel },
    writable:     true,
    configurable: true,
  })

  ;(global as typeof globalThis & { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
    jest.fn().mockImplementation(() => {
      capturedUtterance = {
        lang: '', rate: 1, pitch: 1,
        onstart: null, onend: null, onerror: null, onboundary: null,
      }
      return capturedUtterance
    })
})

afterEach(() => {
  jest.useRealTimers()
})

describe('useTTS', () => {
  it('não chama speak quando text é null', () => {
    renderHook(() => useTTS(null))
    expect(mockSpeak).not.toHaveBeenCalled()
  })

  it('chama speak quando text não é null', () => {
    renderHook(() => useTTS('Olá'))
    expect(mockSpeak).toHaveBeenCalledTimes(1)
  })

  it('configura lang=pt-BR, rate=0.95, pitch=1.1', () => {
    renderHook(() => useTTS('Olá'))
    expect(capturedUtterance!.lang).toBe('pt-BR')
    expect(capturedUtterance!.rate).toBe(0.95)
    expect(capturedUtterance!.pitch).toBe(1.1)
  })

  it('isSpeaking começa false', () => {
    const { result } = renderHook(() => useTTS(null))
    expect(result.current.isSpeaking).toBe(false)
  })

  it('isSpeaking vira true em onstart', () => {
    const { result } = renderHook(() => useTTS('Olá'))
    act(() => { capturedUtterance!.onstart?.() })
    expect(result.current.isSpeaking).toBe(true)
  })

  it('isSpeaking vira false em onend', () => {
    const { result } = renderHook(() => useTTS('Olá'))
    act(() => { capturedUtterance!.onstart?.() })
    act(() => { capturedUtterance!.onend?.() })
    expect(result.current.isSpeaking).toBe(false)
  })

  it('isSpeaking vira false em onerror', () => {
    const { result } = renderHook(() => useTTS('Olá'))
    act(() => { capturedUtterance!.onstart?.() })
    act(() => { capturedUtterance!.onerror?.() })
    expect(result.current.isSpeaking).toBe(false)
  })

  it('beakOpen vira true em onboundary do tipo word', () => {
    const { result } = renderHook(() => useTTS('Olá mundo'))
    act(() => { capturedUtterance!.onstart?.() })
    act(() => { capturedUtterance!.onboundary?.({ name: 'word' }) })
    expect(result.current.beakOpen).toBe(true)
  })

  it('beakOpen vira false após 180ms', () => {
    const { result } = renderHook(() => useTTS('Olá mundo'))
    act(() => { capturedUtterance!.onstart?.() })
    act(() => { capturedUtterance!.onboundary?.({ name: 'word' }) })
    act(() => { jest.advanceTimersByTime(180) })
    expect(result.current.beakOpen).toBe(false)
  })

  it('onboundary do tipo sentence não abre o bico', () => {
    const { result } = renderHook(() => useTTS('Frase.') )
    act(() => { capturedUtterance!.onstart?.() })
    act(() => { capturedUtterance!.onboundary?.({ name: 'sentence' }) })
    expect(result.current.beakOpen).toBe(false)
  })

  it('beakOpen vira false em onend mesmo que estivesse true', () => {
    const { result } = renderHook(() => useTTS('Olá'))
    act(() => { capturedUtterance!.onstart?.() })
    act(() => { capturedUtterance!.onboundary?.({ name: 'word' }) })
    act(() => { capturedUtterance!.onend?.() })
    expect(result.current.beakOpen).toBe(false)
  })

  it('ativa fallback interval após 600ms sem onboundary', () => {
    const { result } = renderHook(() => useTTS('Olá'))
    act(() => { capturedUtterance!.onstart?.() })
    act(() => { jest.advanceTimersByTime(600) })
    act(() => { jest.advanceTimersByTime(350) })
    expect(result.current.beakOpen).toBe(true)
    act(() => { jest.advanceTimersByTime(350) })
    expect(result.current.beakOpen).toBe(false)
  })

  it('cancela fala anterior ao receber novo text', () => {
    const { rerender } = renderHook(
      ({ text }: { text: string | null }) => useTTS(text),
      { initialProps: { text: 'Texto 1' as string | null } },
    )
    rerender({ text: 'Texto 2' })
    expect(mockCancel).toHaveBeenCalled()
    expect(mockSpeak).toHaveBeenCalledTimes(2)
  })

  it('cancela fala quando text vira null', () => {
    const { rerender } = renderHook(
      ({ text }: { text: string | null }) => useTTS(text),
      { initialProps: { text: 'Texto 1' as string | null } },
    )
    rerender({ text: null })
    expect(mockCancel).toHaveBeenCalled()
  })

  it('guard: retorna valores padrão quando speechSynthesis indisponível', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: undefined, writable: true, configurable: true,
    })
    const { result } = renderHook(() => useTTS('Olá'))
    expect(result.current.isSpeaking).toBe(false)
    expect(result.current.beakOpen).toBe(false)
  })
})
```

- [ ] **Step 2: Confirmar que os testes falham (arquivo não existe)**

```bash
npx jest useTTS.test --no-coverage
```

Esperado: erro de compilação ou `Cannot find module './useTTS'`.

- [ ] **Step 3: Criar a implementação do hook**

Criar `src/hooks/useTTS.ts`:

```ts
'use client'
import { useState, useEffect } from 'react'

export function useTTS(text: string | null): { isSpeaking: boolean; beakOpen: boolean } {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [beakOpen,   setBeakOpen]   = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    if (text === null) {
      window.speechSynthesis.cancel()
      return
    }

    window.speechSynthesis.cancel()

    const utterance  = new SpeechSynthesisUtterance(text)
    utterance.lang   = 'pt-BR'
    utterance.rate   = 0.95
    utterance.pitch  = 1.1

    let boundaryFired  = false
    let fallbackId:    ReturnType<typeof setInterval>  | null = null
    let fallbackCheck: ReturnType<typeof setTimeout>   | null = null
    let beakCloseId:   ReturnType<typeof setTimeout>   | null = null
    let fallbackBeak   = false

    const stopAll = () => {
      if (fallbackId)    { clearInterval(fallbackId);   fallbackId    = null }
      if (fallbackCheck) { clearTimeout(fallbackCheck); fallbackCheck = null }
      if (beakCloseId)   { clearTimeout(beakCloseId);   beakCloseId   = null }
    }

    utterance.onstart = () => {
      setIsSpeaking(true)
      fallbackCheck = setTimeout(() => {
        if (!boundaryFired) {
          fallbackId = setInterval(() => {
            fallbackBeak = !fallbackBeak
            setBeakOpen(fallbackBeak)
          }, 350)
        }
      }, 600)
    }

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (event.name !== 'word') return
      boundaryFired = true
      if (fallbackId) { clearInterval(fallbackId); fallbackId = null }
      if (beakCloseId) { clearTimeout(beakCloseId); beakCloseId = null }
      setBeakOpen(true)
      beakCloseId = setTimeout(() => setBeakOpen(false), 180)
    }

    const finish = () => {
      stopAll()
      setIsSpeaking(false)
      setBeakOpen(false)
    }

    utterance.onend   = finish
    utterance.onerror = finish

    window.speechSynthesis.speak(utterance)

    return () => {
      stopAll()
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setBeakOpen(false)
    }
  }, [text])

  return { isSpeaking, beakOpen }
}
```

- [ ] **Step 4: Confirmar que todos os testes do hook passam**

```bash
npx jest useTTS.test --no-coverage
```

Esperado: 14 testes passando, 0 falhas.

- [ ] **Step 5: Rodar a suite completa**

```bash
npx jest --no-coverage
```

Esperado: todos os testes passando.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useTTS.ts src/hooks/useTTS.test.ts
git commit -m "feat(tts): add useTTS hook with Web Speech API and boundary-based lip sync"
```

---

## Task 5: Integrar `useTTS` no `ChatInterface`

**Files:**
- Modify: `src/components/ChatInterface/ChatInterface.test.tsx`
- Modify: `src/components/ChatInterface/ChatInterface.tsx`

- [ ] **Step 1: Escrever o teste que vai falhar**

Abrir `src/components/ChatInterface/ChatInterface.test.tsx`. Adicionar o mock de `useTTS` e um novo teste de integração:

```tsx
import { render, screen } from '@testing-library/react'
import ChatInterface from './ChatInterface'

jest.mock('@/hooks/useChat', () => ({
  useChat: jest.fn(() => ({
    messages:    [],
    isLoading:   false,
    avatarState: 'neutral',
    movement:    'idle',
    sendMessage: jest.fn(),
  })),
}))

jest.mock('@/hooks/useTTS', () => ({
  useTTS: jest.fn(() => ({ isSpeaking: false, beakOpen: false })),
}))

describe('ChatInterface', () => {
  it('renderiza a OLLIE (SVG) e o campo de input', () => {
    const { container } = render(<ChatInterface />)
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('exibe mensagens do histórico', () => {
    const { useChat } = require('@/hooks/useChat')
    useChat.mockReturnValueOnce({
      messages: [
        { id: '1', role: 'assistant', content: 'Olá! Como posso ajudar?' },
      ],
      isLoading:   false,
      avatarState: 'happy',
      movement:    'talking',
      sendMessage: jest.fn(),
    })
    render(<ChatInterface />)
    expect(screen.getByText('Olá! Como posso ajudar?')).toBeInTheDocument()
  })

  it('aplica classe ollie-talking quando useTTS reporta isSpeaking=true', () => {
    const { useTTS } = require('@/hooks/useTTS')
    useTTS.mockReturnValueOnce({ isSpeaking: true, beakOpen: false })
    const { container } = render(<ChatInterface />)
    expect(container.querySelector('.ollie-talking')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Confirmar que o novo teste falha**

```bash
npx jest ChatInterface.test --no-coverage
```

Esperado: o teste `aplica classe ollie-talking` falha com `Cannot find module '@/hooks/useTTS'`. Os outros 2 passam.

- [ ] **Step 3: Atualizar `ChatInterface.tsx`**

Substituir o conteúdo completo de `src/components/ChatInterface/ChatInterface.tsx` por:

```tsx
'use client'
import OllieAvatar from '@/components/OllieAvatar/OllieAvatar'
import ChatBubble  from '@/components/ChatBubble/ChatBubble'
import QuickReply  from '@/components/QuickReply/QuickReply'
import ChatInput   from '@/components/ChatInput/ChatInput'
import { useChat } from '@/hooks/useChat'
import { useTTS }  from '@/hooks/useTTS'
import type { Movement } from '@/types/chat'

export default function ChatInterface() {
  const { messages, isLoading, avatarState, movement, sendMessage } = useChat()

  const lastAssistantText =
    messages.filter((m) => m.role === 'assistant').at(-1)?.content ?? null

  const { isSpeaking, beakOpen } = useTTS(lastAssistantText)

  const lastMessage  = messages.filter((m) => m.role === 'assistant').at(-1)
  const quickReplies = lastMessage?.quick_replies ?? []

  const effectiveMovement: Movement = isSpeaking ? 'talking' : movement

  return (
    <main className="flex flex-col h-screen max-w-lg mx-auto bg-[#F5F0E8]">
      <header className="flex items-center justify-center p-4 bg-[#2D5016]">
        <span className="text-white text-xl font-bold font-[Atkinson_Hyperlegible]">
          NeuroGuia — OLLIE
        </span>
      </header>

      <div className="flex justify-center p-4">
        <OllieAvatar
          avatarState={avatarState}
          movement={effectiveMovement}
          beakOpen={beakOpen}
        />
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3"
        aria-live="polite"
        aria-label="Conversa com OLLIE"
      >
        {messages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <div className="text-[#2D5016] text-sm font-[Atkinson_Hyperlegible] self-start px-2">
            OLLIE está pensando...
          </div>
        )}
      </div>

      <div className="px-4 pb-2">
        <QuickReply options={quickReplies} onSelect={sendMessage} />
      </div>

      <ChatInput onSubmit={sendMessage} disabled={isLoading} />
    </main>
  )
}
```

- [ ] **Step 4: Confirmar que todos os testes passam**

```bash
npx jest --no-coverage
```

Esperado: todos os testes passando, 0 falhas.

- [ ] **Step 5: Commit**

```bash
git add src/components/ChatInterface/ChatInterface.tsx src/components/ChatInterface/ChatInterface.test.tsx
git commit -m "feat(chat): integrate useTTS for automatic lip sync on assistant messages"
```

---

## Verificação Final

- [ ] **Rodar todos os testes uma última vez**

```bash
npx jest --no-coverage
```

Esperado: toda a suite passando.

- [ ] **Iniciar o servidor de desenvolvimento e inspecionar visualmente**

```bash
npm run dev
```

Abrir `http://localhost:3000` e verificar:
1. O avatar Ollie tem forma de coruja reconhecível (não coco)
2. Chapéu de formatura com aba larga e borla visíveis
3. Olhos expressivos com gradiente 3D
4. Tufos de pena nas orelhas
5. Barriga branca/creme proeminente
6. Asas nas laterais com detalhe de penas
7. Enviar uma mensagem: o avatar deve começar a ler em voz alta (pt-BR) e a boca deve se mover sincronizada com as palavras

- [ ] **Commit final de encerramento (se necessário)**

```bash
git add -A
git status  # confirmar que não há arquivos indesejados
git commit -m "chore: finalize Ollie avatar refactor and TTS lip sync"
```
