# OLLIE Chibi Visual Upgrade

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aproximar o visual da OLLIE da imagem de referência: chapéu mortarboard largo e escuro, olhos maiores, bico mais proeminente com interior visível, pés com 3 dedos arredondados.

**Architecture:** Três mudanças isoladas no mesmo arquivo `OllieAvatar.tsx`. Tasks 1 e 2 são puramente visuais (cap e pés) sem impacto em expressões ou testes. Task 3 atualiza os dados de expressão (EYE_RY, eyebrows, beak) e requer atualização de testes via TDD.

**Tech Stack:** React 19, TypeScript, SVG inline, Jest + @testing-library/react

---

## Mapa de Arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `frontend/src/components/OllieAvatar/OllieAvatar.tsx` | Modificar (3x) | Cap, pés, olhos+bico+expressões |
| `frontend/src/components/OllieAvatar/OllieAvatar.test.tsx` | Modificar (Task 3) | Atualizar ry esperados para novos tamanhos |

**Arquivos que NÃO mudam:** `globals.css`, `types/chat.ts`, demais componentes.

---

## Contexto compartilhado

`OllieAvatar.tsx` tem **viewBox 0 0 200 220**. Coordenadas relevantes antes das mudanças:

| Elemento | Posição atual |
|----------|--------------|
| Cabeça | cx=100 cy=78 r=52 |
| Olho esq | cx=78 cy=80 rx=19 ry={eyeRy} |
| Olho dir | cx=122 cy=80 rx=19 ry={eyeRy} |
| Bico sup | polygon "100,92 88,106 112,106" |
| Bico inf | beakPath começa em y≈106 |
| Cap topo | rect x=71 y=7 w=58 h=24 fill=#B06008 |
| Cap aba | rect x=57 y=29 w=86 h=12 |
| Pés | 2 rects y=213 |

---

## Task 1: Cap Mortarboard (visual puro)

**Files:**
- Modify: `frontend/src/components/OllieAvatar/OllieAvatar.tsx` (linhas 174–180)

**Mudança:** substituir o chapéu atual (pequeno, âmbar) por um mortarboard amplo com topo chocolate escuro, faixa branca e aba larga.

- [ ] **Step 1: Ler o arquivo atual**

```bash
# Apenas confirmar as linhas do chapéu antes de editar
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
```

Ler `frontend/src/components/OllieAvatar/OllieAvatar.tsx` para confirmar as linhas 174–180 contêm os elementos do chapéu.

- [ ] **Step 2: Substituir os elementos do chapéu**

Localizar este bloco (dentro do `<g data-testid="ollie-head-group">`):

```tsx
          {/* Chapéu — aba */}
          <rect x="57" y="29" width="86" height="12" rx="6" fill="#B87A0A" stroke="#FFFFFF" strokeWidth="2.5" />
          {/* Chapéu — topo âmbar */}
          <rect x="71" y="7" width="58" height="24" rx="4" fill="#B06008" />
          {/* Chapéu — borla */}
          <line x1="129" y1="13" x2="152" y2="19" stroke="#C8860A" strokeWidth="1.5" />
          <circle cx="153" cy="20" r="4" fill="#C8860A" />
```

Substituir por (ordem de pintura: aba atrás → faixa → topo na frente → borla):

```tsx
          {/* Chapéu — aba LARGA (mortarboard) */}
          <rect x="18" y="34" width="164" height="12" rx="5" fill="#4A2800" />
          {/* Chapéu — faixa branca entre aba e topo */}
          <rect x="48" y="27" width="104" height="10" rx="3" fill="#F5F0E8" />
          {/* Chapéu — topo chocolate escuro */}
          <rect x="56" y="1" width="88" height="28" rx="5" fill="#3D2000" />
          {/* Chapéu — borla */}
          <line x1="142" y1="10" x2="170" y2="28" stroke="#C8860A" strokeWidth="2.5" />
          <circle cx="172" cy="30" r="7" fill="#C8860A" />
```

> **Por que essa ordem?** SVG pinta último elemento no topo. Topo (y=1–29) cobre parte da faixa (y=27–37). A faixa fica visível na faixa y=29–34 (5px de branco). A aba (y=34–46) fica abaixo da faixa.

- [ ] **Step 3: Rodar testes — confirmar 23 PASS**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npx jest --no-coverage 2>&1 | grep -E "Tests:|Suites:"
```
Expected: `Tests: 23 passed, 23 total`

- [ ] **Step 4: Commit**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia
git add frontend/src/components/OllieAvatar/OllieAvatar.tsx
git commit -m "feat: OLLIE chapéu mortarboard largo — topo chocolate, faixa branca, aba 164px"
```

---

## Task 2: Pés com 3 Dedos (visual puro)

**Files:**
- Modify: `frontend/src/components/OllieAvatar/OllieAvatar.tsx` (linhas 211–213)

**Mudança:** substituir 2 retângulos por 3 elipses arredondadas em leque por pé.

- [ ] **Step 1: Substituir os elementos dos pés**

Localizar este bloco (após o fechamento `</g>` do head group):

```tsx
        {/* Pés */}
        <rect x="78"  y="213" width="18" height="7" rx="3.5" fill="#E8B923" />
        <rect x="104" y="213" width="18" height="7" rx="3.5" fill="#E8B923" />
```

Substituir por:

```tsx
        {/* Pé esquerdo — 3 dedos em leque */}
        <ellipse cx="75"  cy="214" rx="7" ry="4" fill="#E8B923" />
        <ellipse cx="86"  cy="216" rx="9" ry="5" fill="#E8B923" />
        <ellipse cx="97"  cy="214" rx="7" ry="4" fill="#E8B923" />
        {/* Pé direito — 3 dedos em leque */}
        <ellipse cx="103" cy="214" rx="7" ry="4" fill="#E8B923" />
        <ellipse cx="114" cy="216" rx="9" ry="5" fill="#E8B923" />
        <ellipse cx="125" cy="214" rx="7" ry="4" fill="#E8B923" />
```

> Cada pé: dedo interno (menor), dedo central (maior, mais baixo), dedo externo (menor). Padrão em leque de 3 dedos.

- [ ] **Step 2: Rodar testes**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npx jest --no-coverage 2>&1 | grep -E "Tests:|Suites:"
```
Expected: `Tests: 23 passed, 23 total`

- [ ] **Step 3: Commit**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia
git add frontend/src/components/OllieAvatar/OllieAvatar.tsx
git commit -m "feat: OLLIE pés com 3 dedos arredondados em leque"
```

---

## Task 3: Olhos Maiores + Bico Proeminente + Expressões (TDD)

**Files:**
- Modify: `frontend/src/components/OllieAvatar/OllieAvatar.test.tsx` (atualizar 2 testes)
- Modify: `frontend/src/components/OllieAvatar/OllieAvatar.tsx` (EYE_RY, rx, clipPaths, pupilas, sobrancelhas, bico, beakPaths)

**Mudanças:**
- `EYE_RY`: open 19→23, relaxed 17→20, squint 13→16, soft 15→18, focused 18→22
- `rx` dos olhos: 19→22 (quase circular com ry_max=23)
- Sobrancelhas: todas as paths sobem ~6px (olhos maiores exigem sobrancelhas acima deles)
- Bico superior: `polygon "100,92 88,106 112,106"` → `polygon "100,88 82,112 118,112"` (mais largo e longo)
- Interior da boca: nova `<ellipse>` vermelha antes do bico (visível quando bico abre)
- Todas as `beakPath`: atualizar y de partida de ≈106 → ≈112 (nova base do bico)
- Pupilas: r=11→r=13, highlight r=3.5→r=4.5
- clipPaths: rx=19→rx=22

**Por que o bico sobe para y=88 (era y=92)?** Maior proeminência. Por que a base vai para y=112 (era y=106)? Bico mais comprido (24px de altura vs 14px atual).

### Step 1 (TDD): Atualizar os 2 testes de ry

- [ ] **Step 1: Editar OllieAvatar.test.tsx**

Localizar e atualizar os dois testes de olho:

```typescript
// ANTES:
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
```

```typescript
// DEPOIS:
  it('olhos totalmente abertos no estado neutral (ry=23)', () => {
    render(<OllieAvatar avatarState="neutral" movement="idle" />)
    expect(screen.getByTestId('ollie-left-eye')).toHaveAttribute('ry', '23')
    expect(screen.getByTestId('ollie-right-eye')).toHaveAttribute('ry', '23')
  })

  it('olhos squint no estado happy (ry=16)', () => {
    render(<OllieAvatar avatarState="happy" movement="idle" />)
    expect(screen.getByTestId('ollie-left-eye')).toHaveAttribute('ry', '16')
    expect(screen.getByTestId('ollie-right-eye')).toHaveAttribute('ry', '16')
  })
```

- [ ] **Step 2: Confirmar FAIL nos 2 testes atualizados**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npx jest src/components/OllieAvatar/OllieAvatar.test.tsx --no-coverage 2>&1 | tail -15
```
Expected: 7 PASS, 2 FAIL — os 2 testes de ry falham com `Expected: "23", Received: "19"`.

### Step 2: Implementar as mudanças no componente

- [ ] **Step 3: Atualizar EYE_RY**

Localizar:
```typescript
const EYE_RY: Record<ExpressionConfig['eyeShape'], number> = {
  open:    19,
  relaxed: 17,
  squint:  13,
  soft:    15,
  focused: 18,
}
```

Substituir por:
```typescript
const EYE_RY: Record<ExpressionConfig['eyeShape'], number> = {
  open:    23,
  relaxed: 20,
  squint:  16,
  soft:    18,
  focused: 22,
}
```

- [ ] **Step 4: Atualizar EXPRESSIONS completo**

Localizar o objeto EXPRESSIONS inteiro (linhas 27–78) e substituir por:

```typescript
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
```

> **Por que os beakPaths mudaram?** A base do bico superior sobe de y=106 para y=112. Todos os paths do bico inferior partem de y≈112 (nova junção bico superior/inferior). Os valores relativos de abertura de cada expressão foram mantidos proporcionalmente.

- [ ] **Step 5: Atualizar SVG — clipPaths (rx=19→22)**

Localizar:
```tsx
          <clipPath id="ollieLeftEyeClip">
            <ellipse cx="78" cy="80" rx="19" ry={eyeRy} />
          </clipPath>
          <clipPath id="ollieRightEyeClip">
            <ellipse cx="122" cy="80" rx="19" ry={eyeRy} />
          </clipPath>
```

Substituir por:
```tsx
          <clipPath id="ollieLeftEyeClip">
            <ellipse cx="78" cy="80" rx="22" ry={eyeRy} />
          </clipPath>
          <clipPath id="ollieRightEyeClip">
            <ellipse cx="122" cy="80" rx="22" ry={eyeRy} />
          </clipPath>
```

- [ ] **Step 6: Atualizar SVG — olhos brancos (rx=19→22)**

Localizar:
```tsx
          <ellipse data-testid="ollie-left-eye"  cx="78"  cy="80" rx="19" ry={eyeRy} fill="white" />
          <ellipse data-testid="ollie-right-eye" cx="122" cy="80" rx="19" ry={eyeRy} fill="white" />
```

Substituir por:
```tsx
          <ellipse data-testid="ollie-left-eye"  cx="78"  cy="80" rx="22" ry={eyeRy} fill="white" />
          <ellipse data-testid="ollie-right-eye" cx="122" cy="80" rx="22" ry={eyeRy} fill="white" />
```

- [ ] **Step 7: Atualizar SVG — pupilas (r=11→13, highlight r=3.5→4.5)**

Localizar:
```tsx
          <g clipPath="url(#ollieLeftEyeClip)">
            <circle cx={expr.leftPupil.cx}      cy={leftPupilCy}      r="11"  fill="#1a1a1a" />
            <circle cx={expr.leftPupil.cx + 4}  cy={leftPupilCy  - 4} r="3.5" fill="white" />
          </g>
          <g clipPath="url(#ollieRightEyeClip)">
            <circle cx={expr.rightPupil.cx}     cy={rightPupilCy}     r="11"  fill="#1a1a1a" />
            <circle cx={expr.rightPupil.cx + 4} cy={rightPupilCy - 4} r="3.5" fill="white" />
          </g>
```

Substituir por:
```tsx
          <g clipPath="url(#ollieLeftEyeClip)">
            <circle cx={expr.leftPupil.cx}      cy={leftPupilCy}      r="13"  fill="#1a1a1a" />
            <circle cx={expr.leftPupil.cx + 5}  cy={leftPupilCy  - 5} r="4.5" fill="white" />
          </g>
          <g clipPath="url(#ollieRightEyeClip)">
            <circle cx={expr.rightPupil.cx}     cy={rightPupilCy}     r="13"  fill="#1a1a1a" />
            <circle cx={expr.rightPupil.cx + 5} cy={rightPupilCy - 5} r="4.5" fill="white" />
          </g>
```

- [ ] **Step 8: Atualizar SVG — bico superior + interior da boca**

Localizar:
```tsx
          {/* Bico superior */}
          <polygon points="100,92 88,106 112,106" fill="#E8B923" />
          {/* Bico inferior */}
          <path
            data-testid="ollie-beak-lower"
            className="ollie-beak-bottom"
            d={expr.beakPath}
            fill="#C8860A"
          />
```

Substituir por:
```tsx
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
```

> **Como o interior funciona?** A elipse vermelha fica em cy=114 (logo abaixo da base do bico superior y=112). O bico superior (polygon) a cobre quando o bico está fechado. Quando o bico inferior abre (happy: beakPath vai até y=134), o interior fica exposto entre o bico superior e o inferior, simulando a boca aberta.

- [ ] **Step 9: Rodar testes — confirmar 23 PASS**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npx jest --no-coverage 2>&1 | grep -E "Tests:|Suites:"
```
Expected: `Tests: 23 passed, 23 total`

Se algum dos 2 testes de ry ainda falhar, verificar se o EYE_RY foi salvo corretamente.

- [ ] **Step 10: Commit**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia
git add frontend/src/components/OllieAvatar/OllieAvatar.tsx \
        frontend/src/components/OllieAvatar/OllieAvatar.test.tsx
git commit -m "feat: OLLIE olhos maiores (ry 19→23), bico proeminente, interior da boca, sobrancelhas reposicionadas"
```

---

## Self-Review

### Spec Coverage

| Requisito visual | Task |
|-----------------|------|
| Chapéu mortarboard largo (164px) | Task 1 |
| Topo chocolate escuro #3D2000 | Task 1 |
| Faixa branca entre aba e topo | Task 1 |
| Borla maior (r=7) | Task 1 |
| Pés com 3 dedos arredondados | Task 2 |
| Olhos maiores (ry_max 19→23, rx 19→22) | Task 3 |
| Pupilas maiores (r=11→13) | Task 3 |
| Bico superior mais largo (88px vs 24px) | Task 3 |
| Interior da boca (elipse vermelha) | Task 3 |
| Sobrancelhas reposicionadas acima dos olhos maiores | Task 3 |
| Todos os beakPaths ajustados para nova base y=112 | Task 3 |
| 23 testes passando após cada task | Tasks 1–3 |

### Placeholder Scan
Nenhum TBD, TODO ou step sem código.

### Type Consistency
- `EYE_RY` atualizado cobre os mesmos 5 literais: open, relaxed, squint, soft, focused
- `EXPRESSIONS` mantém todos os 5 AvatarState com todos os campos de ExpressionConfig
- `beakPath` de cada expressão parte de y≈112 (nova base do bico superior), consistente com `polygon points="100,88 82,112 118,112"`
- `data-testid` de olhos (`ollie-left-eye`, `ollie-right-eye`) mantidos — testes os encontram
- Testes de ry atualizados para 23 (neutral) e 16 (happy) — batem com os novos valores de EYE_RY
