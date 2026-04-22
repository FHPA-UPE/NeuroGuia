# OLLIE Expression + Visual 3D Upgrade

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar as 5 expressões da OLLIE visualmente distintas e legíveis em <1 segundo, e aplicar estilo 3D soft cartoon (gradientes radiais, sombra no chão, disco facial) fiel à imagem de referência.

**Architecture:** `ExpressionConfig` é estendido com `eyeShape`, `eyeLidOffset`, `beakPath` e `headTilt`. O SVG recebe: olhos como `<ellipse>` com `ry` dinâmico, `clipPath` para pupilas, bico inferior como `<path>` expressivo, grupo `<g>` de cabeça com `transform="rotate(...)"`. Gradientes radiais e sombra são adicionados em `<defs>` sem alterar a interface de props.

**Tech Stack:** React 19, TypeScript, SVG inline, CSS keyframes, Jest + @testing-library/react

---

## Mapa de Arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `frontend/src/components/OllieAvatar/OllieAvatar.test.tsx` | Modificar | +6 testes para novos campos (ry dos olhos, beakPath, headTilt) |
| `frontend/src/components/OllieAvatar/OllieAvatar.tsx` | Modificar | ExpressionConfig + EXPRESSIONS + SVG estrutural + gradientes |
| `frontend/src/app/globals.css` | Modificar | Adicionar `transform-box: fill-box` para animar `<path>` do bico |

**Arquivos que NÃO mudam:**
- `src/types/chat.ts` — AvatarState e Movement permanecem iguais
- `src/components/ChatInterface/ChatInterface.tsx`
- `backend/`

---

## Task 1: TDD — Novos Testes de Expressão

**Files:**
- Modify: `frontend/src/components/OllieAvatar/OllieAvatar.test.tsx`

- [ ] **Step 1: Adicionar 6 testes novos ao arquivo existente**

Abrir `frontend/src/components/OllieAvatar/OllieAvatar.test.tsx` e adicionar após o último teste (`atualiza aria-label quando avatarState muda`), ainda dentro do `describe`:

```typescript
  it('olhos totalmente abertos no estado neutral (ry=19)', () => {
    render(<OllieAvatar avatarState="neutral" movement="idle" />)
    expect(screen.getByTestId('ollie-left-eye')).toHaveAttribute('ry', '19')
    expect(screen.getByTestId('ollie-right-eye')).toHaveAttribute('ry', '19')
  })

  it('olhos squint no estado happy (ry=13)', () => {
    render(<OllieAvatar avatarState="happy" movement="idle" />)
    expect(screen.getByTestId('ollie-left-eye')).toHaveAttribute('ry', '13')
    expect(screen.getByTestId('ollie-right-eye')).toHaveAttribute('ry', '13')
  })

  it('bico de happy tem curva aberta (path com Q)', () => {
    render(<OllieAvatar avatarState="happy" movement="idle" />)
    expect(screen.getByTestId('ollie-beak-lower').getAttribute('d')).toMatch(/Q/)
  })

  it('bico de empathetic tem curva suave', () => {
    render(<OllieAvatar avatarState="empathetic" movement="idle" />)
    expect(screen.getByTestId('ollie-beak-lower').getAttribute('d')).toMatch(/Q/)
  })

  it('grupo da cabeça inclina para thoughtful', () => {
    render(<OllieAvatar avatarState="thoughtful" movement="idle" />)
    const t = screen.getByTestId('ollie-head-group').getAttribute('transform') ?? ''
    expect(t).toMatch(/rotate\(-?[1-9]/)
  })

  it('grupo da cabeça não inclina no neutral', () => {
    render(<OllieAvatar avatarState="neutral" movement="idle" />)
    expect(screen.getByTestId('ollie-head-group')).toHaveAttribute(
      'transform',
      'rotate(0, 100, 78)',
    )
  })
```

- [ ] **Step 2: Confirmar FAIL**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npx jest src/components/OllieAvatar/OllieAvatar.test.tsx --no-coverage 2>&1 | tail -20
```
Expected: 6 testes novos FAIL com `Unable to find an element by: [data-testid="ollie-left-eye"]`.

---

## Task 2: Implementar ExpressionConfig + SVG Estrutural

**Files:**
- Modify: `frontend/src/components/OllieAvatar/OllieAvatar.tsx`

- [ ] **Step 1: Substituir completamente o arquivo**

Escrever `frontend/src/components/OllieAvatar/OllieAvatar.tsx` com o conteúdo abaixo:

```typescript
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
  open:    19,
  relaxed: 17,
  squint:  13,
  soft:    15,
  focused: 18,
}

const EXPRESSIONS: Record<AvatarState, ExpressionConfig> = {
  neutral: {
    leftPupil:    { cx: 78,  cy: 80 },
    rightPupil:   { cx: 122, cy: 80 },
    leftBrow:     'M 62 62 Q 78 56 94 62',
    rightBrow:    'M 106 62 Q 122 56 138 62',
    eyeShape:     'open',
    eyeLidOffset: 0,
    beakPath:     'M 90,106 L 110,106 L 108,112 L 92,112 Z',
    headTilt:     0,
  },
  happy: {
    leftPupil:    { cx: 78,  cy: 82 },
    rightPupil:   { cx: 122, cy: 82 },
    leftBrow:     'M 62 55 Q 78 47 94 55',
    rightBrow:    'M 106 55 Q 122 47 138 55',
    eyeShape:     'squint',
    eyeLidOffset: 3,
    beakPath:     'M 87,104 Q 100,120 113,104 L 112,108 Q 100,124 88,108 Z',
    headTilt:     0,
  },
  encouraging: {
    leftPupil:    { cx: 80,  cy: 79 },
    rightPupil:   { cx: 124, cy: 79 },
    leftBrow:     'M 62 59 Q 78 51 94 59',
    rightBrow:    'M 106 55 Q 122 47 138 55',
    eyeShape:     'focused',
    eyeLidOffset: 1,
    beakPath:     'M 88,104 L 112,104 L 112,111 L 88,111 Z',
    headTilt:     -3,
  },
  empathetic: {
    leftPupil:    { cx: 78,  cy: 83 },
    rightPupil:   { cx: 122, cy: 83 },
    leftBrow:     'M 64 67 Q 76 60 86 58 Q 90 57 94 59',
    rightBrow:    'M 106 59 Q 110 57 114 58 Q 124 60 136 67',
    eyeShape:     'soft',
    eyeLidOffset: 4,
    beakPath:     'M 91,107 Q 100,112 109,107 L 109,110 Q 100,115 91,110 Z',
    headTilt:     5,
  },
  thoughtful: {
    leftPupil:    { cx: 74,  cy: 79 },
    rightPupil:   { cx: 118, cy: 79 },
    leftBrow:     'M 62 64 Q 78 61 94 64',
    rightBrow:    'M 106 58 Q 122 52 138 58',
    eyeShape:     'relaxed',
    eyeLidOffset: 2,
    beakPath:     'M 91,106 L 109,106 L 109,109 L 91,109 Z',
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
          <clipPath id="ollieLeftEyeClip">
            <ellipse cx="78" cy="80" rx="19" ry={eyeRy} />
          </clipPath>
          <clipPath id="ollieRightEyeClip">
            <ellipse cx="122" cy="80" rx="19" ry={eyeRy} />
          </clipPath>
        </defs>

        {/* Asas (fora do grupo de inclinação) */}
        <ellipse cx="42"  cy="148" rx="22" ry="46" fill="#A06808" transform="rotate(-10 42 148)" />
        <ellipse cx="158" cy="148" rx="22" ry="46" fill="#A06808" transform="rotate(10 158 148)" />

        {/* Corpo */}
        <ellipse cx="100" cy="150" rx="62" ry="68" fill="#C8860A" />

        {/* Barriga */}
        <ellipse cx="100" cy="160" rx="38" ry="48" fill="#F5F0E8" />

        {/* Grupo da cabeça — inclina conforme headTilt */}
        <g data-testid="ollie-head-group" transform={`rotate(${expr.headTilt}, 100, 78)`}>
          {/* Cabeça */}
          <circle cx="100" cy="78" r="52" fill="#C8860A" />

          {/* Tufos das orelhas */}
          <polygon points="72,32 60,10 84,28" fill="#C8860A" />
          <polygon points="128,32 140,10 116,28" fill="#C8860A" />

          {/* Chapéu — aba */}
          <rect x="57" y="29" width="86" height="12" rx="6" fill="#B87A0A" stroke="#FFFFFF" strokeWidth="2.5" />
          {/* Chapéu — topo (âmbar, corrigido de #2D5016) */}
          <rect x="71" y="7" width="58" height="24" rx="4" fill="#B06008" />
          {/* Chapéu — borla */}
          <line x1="129" y1="13" x2="152" y2="19" stroke="#C8860A" strokeWidth="1.5" />
          <circle cx="153" cy="20" r="4" fill="#C8860A" />

          {/* Olhos brancos — ry dinâmico por expressão */}
          <ellipse data-testid="ollie-left-eye"  cx="78"  cy="80" rx="19" ry={eyeRy} fill="white" />
          <ellipse data-testid="ollie-right-eye" cx="122" cy="80" rx="19" ry={eyeRy} fill="white" />

          {/* Pupilas com clipping para não vazar fora do olho */}
          <g clipPath="url(#ollieLeftEyeClip)">
            <circle cx={expr.leftPupil.cx}      cy={leftPupilCy}      r="11"  fill="#1a1a1a" />
            <circle cx={expr.leftPupil.cx + 4}  cy={leftPupilCy  - 4} r="3.5" fill="white" />
          </g>
          <g clipPath="url(#ollieRightEyeClip)">
            <circle cx={expr.rightPupil.cx}     cy={rightPupilCy}     r="11"  fill="#1a1a1a" />
            <circle cx={expr.rightPupil.cx + 4} cy={rightPupilCy - 4} r="3.5" fill="white" />
          </g>

          {/* Sobrancelhas */}
          <path d={expr.leftBrow}  stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d={expr.rightBrow} stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Bico superior (fixo) */}
          <polygon points="100,92 88,106 112,106" fill="#E8B923" />
          {/* Bico inferior — expressivo + animado em talking */}
          <path
            data-testid="ollie-beak-lower"
            className="ollie-beak-bottom"
            d={expr.beakPath}
            fill="#C8860A"
          />
        </g>

        {/* Pés */}
        <rect x="78"  y="213" width="18" height="7" rx="3.5" fill="#E8B923" />
        <rect x="104" y="213" width="18" height="7" rx="3.5" fill="#E8B923" />
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Rodar testes — confirmar 11 PASS**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npx jest src/components/OllieAvatar/OllieAvatar.test.tsx --no-coverage 2>&1 | tail -20
```
Expected: 11 testes PASS (5 antigos + 6 novos).

Se algum teste falhar com `Received: "19"` (string em vez de número), é comportamento correto do jsdom — o atributo SVG é sempre string. O `toHaveAttribute('ry', '19')` já espera string, portanto deve passar.

- [ ] **Step 3: Rodar todos os testes frontend**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npx jest --no-coverage 2>&1 | tail -10
```
Expected: todos os testes passando (ChatInterface, ChatBubble, QuickReply, ChatInput, useChat).

- [ ] **Step 4: Commit**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia
git add frontend/src/components/OllieAvatar/OllieAvatar.tsx \
        frontend/src/components/OllieAvatar/OllieAvatar.test.tsx
git commit -m "feat: OLLIE expressões distintas — eyeShape, beakPath, headTilt, eyeLidOffset"
```

---

## Task 3: Corrigir Animação do Bico (`<path>` vs `<polygon>`)

**Files:**
- Modify: `frontend/src/app/globals.css`

**Contexto:** O bico inferior era `<polygon>`. Agora é `<path>`. A animação `ollie-talk` usa `scaleY` com `transform-origin: top center`. Para que `transform-origin` funcione corretamente em elementos `<path>`, é necessário `transform-box: fill-box` — sem isso, a origem é relativa ao viewport e o bico some da tela ao animar.

- [ ] **Step 1: Adicionar transform-box ao seletor existente**

Localizar em `frontend/src/app/globals.css` o bloco:

```css
.ollie-talking .ollie-beak-bottom {
  animation: ollie-talk 0.35s ease-in-out infinite;
}
```

Substituir por:

```css
.ollie-beak-bottom {
  transform-box: fill-box;
}

.ollie-talking .ollie-beak-bottom {
  animation: ollie-talk 0.35s ease-in-out infinite;
}
```

- [ ] **Step 2: Confirmar testes ainda passam**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npx jest --no-coverage 2>&1 | tail -5
```
Expected: todos PASS.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia
git add frontend/src/app/globals.css
git commit -m "fix: transform-box fill-box para animar bico <path> corretamente"
```

---

## Task 4: Upgrade Visual 3D (Gradientes, Sombra, Cores)

**Files:**
- Modify: `frontend/src/components/OllieAvatar/OllieAvatar.tsx`

**Contexto:** Adicionar gradientes radiais para profundidade 3D (cabeça, corpo, asas, barriga), sombra no chão, disco facial claro ao redor dos olhos, marcas de penas na barriga, sobrancelhas em marrom escuro espessas. Nenhuma lógica de expressão muda — apenas atributos visuais SVG.

- [ ] **Step 1: Atualizar o SVG com gradientes e melhorias visuais**

O arquivo `OllieAvatar.tsx` já tem toda a estrutura lógica da Task 2. Substituir apenas a parte do SVG (de `<svg ...>` até `</svg>`) conforme abaixo. A seção acima do return (types, EYE_RY, EXPRESSIONS, variáveis) permanece idêntica.

```tsx
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
            <ellipse cx="78" cy="80" rx="19" ry={eyeRy} />
          </clipPath>
          <clipPath id="ollieRightEyeClip">
            <ellipse cx="122" cy="80" rx="19" ry={eyeRy} />
          </clipPath>

          {/* Gradiente 3D da cabeça — highlight no topo-esquerdo */}
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

          {/* Gradiente da barriga — branco ao centro, creme nas bordas */}
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

          {/* Disco facial — área suavemente iluminada ao redor dos olhos */}
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

        {/* Marcas de penas na barriga */}
        <path d="M 88 152 Q 94 159 100 152" stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
        <path d="M 100 152 Q 106 159 112 152" stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
        <path d="M 83 164 Q 91 171 99 164"  stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
        <path d="M 101 164 Q 109 171 117 164" stroke="#D8D0C4" strokeWidth="1.5" fill="none" />
        <path d="M 88 177 Q 96 184 104 177"  stroke="#D8D0C4" strokeWidth="1.5" fill="none" />

        {/* Grupo da cabeça */}
        <g data-testid="ollie-head-group" transform={`rotate(${expr.headTilt}, 100, 78)`}>
          {/* Cabeça com gradiente 3D */}
          <circle cx="100" cy="78" r="52" fill="url(#ollieHeadGrad)" />

          {/* Disco facial — área mais clara ao redor dos olhos */}
          <ellipse cx="100" cy="82" rx="46" ry="44" fill="url(#ollieFaceDiscGrad)" />

          {/* Tufos das orelhas */}
          <polygon points="72,32 60,10 84,28" fill="url(#ollieHeadGrad)" />
          <polygon points="128,32 140,10 116,28" fill="url(#ollieHeadGrad)" />

          {/* Chapéu — aba */}
          <rect x="57" y="29" width="86" height="12" rx="6" fill="#B87A0A" stroke="#FFFFFF" strokeWidth="2.5" />
          {/* Chapéu — topo (âmbar, corrigido de #2D5016 verde) */}
          <rect x="71" y="7" width="58" height="24" rx="4" fill="#B06008" />
          {/* Chapéu — borla */}
          <line x1="129" y1="13" x2="152" y2="19" stroke="#C8860A" strokeWidth="1.5" />
          <circle cx="153" cy="20" r="4" fill="#C8860A" />

          {/* Olhos brancos */}
          <ellipse data-testid="ollie-left-eye"  cx="78"  cy="80" rx="19" ry={eyeRy} fill="white" />
          <ellipse data-testid="ollie-right-eye" cx="122" cy="80" rx="19" ry={eyeRy} fill="white" />

          {/* Pupilas */}
          <g clipPath="url(#ollieLeftEyeClip)">
            <circle cx={expr.leftPupil.cx}      cy={leftPupilCy}      r="11"  fill="#1a1a1a" />
            <circle cx={expr.leftPupil.cx + 4}  cy={leftPupilCy  - 4} r="3.5" fill="white" />
          </g>
          <g clipPath="url(#ollieRightEyeClip)">
            <circle cx={expr.rightPupil.cx}     cy={rightPupilCy}     r="11"  fill="#1a1a1a" />
            <circle cx={expr.rightPupil.cx + 4} cy={rightPupilCy - 4} r="3.5" fill="white" />
          </g>

          {/* Sobrancelhas — marrom escuro, +espessas */}
          <path d={expr.leftBrow}  stroke="#5C3200" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d={expr.rightBrow} stroke="#5C3200" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Bico superior */}
          <polygon points="100,92 88,106 112,106" fill="#E8B923" />
          {/* Bico inferior */}
          <path
            data-testid="ollie-beak-lower"
            className="ollie-beak-bottom"
            d={expr.beakPath}
            fill="#C8860A"
          />
        </g>

        {/* Pés */}
        <rect x="78"  y="213" width="18" height="7" rx="3.5" fill="#E8B923" />
        <rect x="104" y="213" width="18" height="7" rx="3.5" fill="#E8B923" />
      </svg>
```

- [ ] **Step 2: Confirmar testes ainda passam**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npx jest --no-coverage 2>&1 | tail -10
```
Expected: 11 testes OllieAvatar + restantes todos PASS. Mudanças visuais não alteram comportamento testado.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia
git add frontend/src/components/OllieAvatar/OllieAvatar.tsx
git commit -m "feat: OLLIE visual 3D — gradientes radiais, sombra, disco facial, penas"
```

---

## Self-Review

### Spec Coverage

| Requisito | Task |
|-----------|------|
| ExpressionConfig com eyeShape, eyeLidOffset, beakPath, headTilt | Task 2 |
| Pelo menos 3 elementos mudam por emoção (brow + eye + beak) | Task 2 |
| Eye SHAPE muda por emoção (ry dinâmico) | Task 2 |
| Beak muda por emoção (beakPath) | Task 2 |
| Assimetria para emoções não-neutras (brows + headTilt) | Task 2 |
| Cap âmbar conforme imagem de referência (corrige #2D5016) | Task 2 |
| Gradientes radiais 3D (cabeça, corpo, asas, barriga) | Task 4 |
| Sombra no chão | Task 4 |
| Disco facial iluminado | Task 4 |
| Marcas de penas na barriga | Task 4 |
| Sobrancelhas mais espessas e em marrom escuro | Task 4 |
| Animação do bico corrigida para `<path>` | Task 3 |
| Testes passando em todos os estados | Tasks 1–4 |

### Placeholder Scan
Nenhum TBD, TODO, "similar ao Task N" ou step sem código.

### Type Consistency
- `EYE_RY` usa `Record<ExpressionConfig['eyeShape'], number>` — seguro, cobre todos os 5 valores literais.
- `EXPRESSIONS` usa `Record<AvatarState, ExpressionConfig>` — TypeScript obriga todos os 5 estados.
- `data-testid` nos elementos SVG batem com os seletores nos testes: `ollie-left-eye`, `ollie-right-eye`, `ollie-beak-lower`, `ollie-head-group`.
- `clipPath id="ollieLeftEyeClip"` no `<defs>` bate com `clipPath="url(#ollieLeftEyeClip)"` nos grupos de pupila.
