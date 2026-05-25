# Spec: Ollie Avatar Redesign — SVG Identity Visual

**Data:** 2026-05-24
**Branch alvo:** feat/backend-and-frontend
**Componente:** `src/components/OllieAvatar/OllieAvatar.tsx`

---

## Objetivo

Redesenhar o componente `OllieAvatar` como um SVG inline completo que reproduz fielmente a identidade visual do personagem "Ollie" da imagem de referência (`Ollie - Base.png`): coruja cartoon com chapéu de formatura, proporções volumosas, olhos grandes circulares, e 5 expressões com poses corporais distintas (incluindo gestos de asa).

A interface pública do componente permanece idêntica — zero impacto em consumidores.

---

## Fora de escopo

- Thumbnail nos balões de chat (`OllieAvatarThumb` em `ChatBubble`) — reaproveita o novo SVG via `scale(0.208)` automaticamente.
- Assets externos (PNG, Lottie, fontes). Tudo inline no SVG.

---

## Interface pública (inalterada)

```tsx
interface OllieAvatarProps {
  avatarState: AvatarState   // 'neutral' | 'happy' | 'encouraging' | 'empathetic' | 'thoughtful'
  movement:    Movement      // 'idle' | 'talking' | 'thinking'
  beakOpen?:   boolean
}
```

---

## Arquitetura do componente

### ViewBox

`0 0 240 280` — maior que o atual (200×240) para acomodar chapéu de borda larga e poses de asa levantada.

### Hierarquia SVG

```
<svg viewBox="0 0 240 280">
  <defs>
    gradientes radiais: headGrad, bodyGrad, bellyGrad, wingGrad, hatGrad, faceDiscGrad
    filtros: bodyDepth (feDropShadow)
    clipPaths: leftEyeClip, rightEyeClip (dinâmicos via useId)
  </defs>

  <ellipse />              ← sombra no chão

  <g data-testid="ollie-wing-left">   ← asa esquerda
  <g data-testid="ollie-wing-right">  ← asa direita (pose varia por estado)

  <ellipse />              ← corpo principal
  <ellipse />              ← belly
  <path × 5 />             ← textura de penas (3 fileiras)

  <g data-testid="ollie-head-group" transform="rotate(headTilt, 120, 115)">
    <circle />             ← cabeça
    <ellipse />            ← disco facial (overlay creme)
    <polygon × 6 />        ← tufos de orelha (3 polígonos × 2 lados)
    <g data-testid="ollie-hat">
      <rect />             ← faixa branca
      <rect />             ← brim (aba larga)
      <rect />             ← topo
      <line />             ← cordão do tassel
      <circle × 2 />       ← pompom duplo
    </g>
    <ellipse × 2 />        ← scleras (ou path de wink no estado empathetic)
    <g clipPath × 2 />     ← pupilas + specular (2 pontos de luz)
    <path × 2 />           ← sobrancelhas
    <ellipse? />           ← interior da boca (quando beakOpen)
    <polygon />            ← bico superior (fixo)
    <path />               ← bico inferior (varia)
  </g>

  <ellipse × 6 />          ← pés (3 dedos × 2 pés)
</svg>
```

### ExpressionConfig expandido

```ts
interface ExpressionConfig {
  // facial
  leftPupil:    { cx: number; cy: number }
  rightPupil:   { cx: number; cy: number }
  leftBrow:     string
  rightBrow:    string
  eyeShape:     'open' | 'relaxed' | 'squint' | 'soft' | 'focused'
  eyeLidOffset: number
  beakPath:     string
  headTilt:     number
  // novo
  rightEyeWink: boolean   // substitui sclera direita por arco de wink
  wingLeftPose:  WingPose
  wingRightPose: WingPose
}

type WingPose = 'rest' | 'raised-thumb' | 'raised-chin'
```

Cada `WingPose` resolve para uma função que retorna JSX do grupo SVG correspondente.

---

## Paleta de cores

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ollie-amber-light` | `#F0B840` | highlight cabeça/corpo |
| `--ollie-amber-mid`   | `#C97E18` | tom médio cabeça/corpo |
| `--ollie-amber-dark`  | `#7A4A05` | sombra profunda |
| `--ollie-belly-white` | `#FFFFFF` | centro do belly |
| `--ollie-belly-cream` | `#F2EBD8` | borda do belly |
| `--ollie-beak`        | `#E8B020` | bico superior |
| `--ollie-beak-dark`   | `#B07510` | linha/sombra do bico |
| `--ollie-brow`        | `#3D2000` | sobrancelhas |
| `--ollie-hat`         | `#C07818` | chapéu |
| `--ollie-hat-band`    | `#F5F0E5` | faixa branca do chapéu |

### Gradientes radiais (todos `gradientUnits="objectBoundingBox"`)

| ID | cx/cy | Stops |
|----|-------|-------|
| `headGrad`     | 40%/30% | `#F0B840 → #C97E18 → #7A4A05` |
| `bodyGrad`     | 45%/25% | `#EAA820 → #C47A14 → #7A4A05` |
| `bellyGrad`    | 50%/35% | `#FFFFFF → #F2EBD8 → #DACCB0` |
| `wingGrad`     | 50%/25% | `#D98C18 → #6B3A02` |
| `hatGrad`      | 42%/20% | `#E0A020 → #C07818 → #8A5005` |
| `faceDiscGrad` | 50%/50% | `#FCE4A6 opac.50% → opac.0%` |

### Filtro de profundidade

```svg
<filter id="bodyDepth" x="-20%" y="-20%" width="140%" height="140%">
  <feDropShadow dx="3" dy="5" stdDeviation="6"
    flood-color="#3A1800" flood-opacity="0.30" />
</filter>
```

Aplicado ao grupo `<g>` que envolve corpo + cabeça.

---

## Anatomia — coordenadas principais (viewBox 240×280)

### Cabeça
- `<circle cx="120" cy="115" r="72">` — r=72 vs r=54 atual
- Disco facial: `<ellipse cx="120" cy="120" rx="58" ry="55">`

### Tufos de orelha
- Esquerda: `points="62,48 50,18 78,40"` + 2 polígonos sobrepõem
- Direita: `points="178,48 190,18 162,40"` + 2 polígonos

### Chapéu
- Faixa branca: `<rect x="58" y="40" width="124" height="11" rx="4">`
- Brim: `<rect x="14" y="49" width="212" height="14" rx="6">` — 212px (vs 168px atual)
- Topo: `<rect x="62" y="10" width="116" height="32" rx="7">`
- Cordão: `<line x1="176" y1="14" x2="205" y2="42">`
- Pompom: `<circle cx="208" cy="45" r="9">` + `<circle r="5">`

### Olhos
- Scleras: `<ellipse cx="90/150" cy="126" rx="26" ry="26">` — circulares (vs elipses no atual)
- Pupila: `r="17"`
- Specular 1: `r="6"` offset `(+6, -6)`
- Specular 2: `r="3"` offset `(+10, -10)`

### Bico
- Superior (fixo): `<polygon points="120,108 100,128 140,128">`
- Inferior: path por estado (ver expressões)

### Corpo
- Principal: `<ellipse cx="120" cy="208" rx="80" ry="65">`
- Belly: `<ellipse cx="120" cy="218" rx="50" ry="58">`

### Asas (repouso)
- Esquerda: `<ellipse cx="44" cy="198" rx="28" ry="56" transform="rotate(-16, 44, 198)">`
- Direita: `<ellipse cx="196" cy="198" rx="28" ry="56" transform="rotate(16, 196, 198)">`

### Pés
- 3 elipses por pé, `ry="5.5"`, fill `#E8B020`

---

## 5 Expressões

### NEUTRAL
| Parte | Valor |
|-------|-------|
| Pupilas | L `(90,126)` R `(150,126)` |
| Sobrancelha E | `M 70 98 Q 90 91 110 98` |
| Sobrancelha D | `M 130 98 Q 150 91 170 98` |
| Olho shape | `open` (ry=26) |
| Bico inf. | `<ellipse cx="120" cy="130" rx="12" ry="5">` |
| Wink direito | false |
| Head tilt | 0° |
| Asa direita | `rest` |
| Asa esquerda | `rest` |

### HAPPY
| Parte | Valor |
|-------|-------|
| Pupilas | L `(90,129)` R `(150,129)` |
| Sobrancelha E | `M 70 93 Q 90 84 110 93` (elevada) |
| Sobrancelha D | `M 130 93 Q 150 84 170 93` |
| Olho shape | `squint` (ry=20) |
| Bico inf. | `M 100,127 Q 120,144 140,127 L 138,133 Q 120,150 102,133 Z` |
| Interior boca | `<ellipse cx="120" cy="133" rx="16" ry="8" fill="#CC3300">` |
| Wink direito | false |
| Head tilt | 0° |
| Asas | `rest` bilateral |

### ENCOURAGING
| Parte | Valor |
|-------|-------|
| Pupilas | L `(90,124)` R `(150,124)` (animadas, olhar alto) |
| Sobrancelha E | `M 70 90 Q 90 82 110 90` (muito elevada) |
| Sobrancelha D | `M 130 90 Q 150 82 170 90` |
| Olho shape | `open` |
| Bico inf. | sorriso largo (igual a happy) |
| Interior boca | sim |
| Wink direito | false |
| Head tilt | -4° |
| Asa esquerda | `rest` |
| **Asa direita** | **`raised-thumb`** — punho `<ellipse cx="196" cy="155" rx="22" ry="18">` + polegar `<path M 195,136 Q 188,120 196,110 Q 204,100 210,112 Q 214,124 205,136 Z>` |

### EMPATHETIC
| Parte | Valor |
|-------|-------|
| Pupilas | L `(90,128)` R — sem pupila (wink) |
| Sobrancelha E | `M 70 98 Q 90 91 110 98` |
| Sobrancelha D | `M 130 103 Q 150 98 170 105` (levemente baixa) |
| Olho shape E | `soft` (ry=22) |
| **Olho direito** | **wink** — `<path d="M 124,126 Q 150,112 176,126" stroke="#1a1a1a" strokeWidth="4" fill="none">` (substituí sclera + pupila) |
| Bico inf. | leve sorriso fechado |
| Head tilt | 4° |
| Asas | `rest` bilateral |

### THOUGHTFUL
| Parte | Valor |
|-------|-------|
| Pupilas | L `(87,126)` R `(147,126)` (levemente à esquerda) |
| Sobrancelha E | `M 70 101 Q 90 97 110 101` (baixa e reta) |
| Sobrancelha D | `M 130 95 Q 150 88 170 95` (elevada) |
| Olho shape | `relaxed` (ry=22) |
| Bico inf. | fechado neutro |
| Wink direito | false |
| Head tilt | -6° |
| Asa esquerda | `rest` |
| **Asa direita** | **`raised-chin`** — `<ellipse cx="168" cy="162" rx="24" ry="44" transform="rotate(-50, 168, 162)">` (ponta próxima ao bico) |

---

## Animações CSS (`globals.css`)

```css
@keyframes ollie-bob {
  0%, 100% { transform: translateY(0);    }
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

.ollie-idle     { animation: ollie-bob      3s ease-in-out infinite; }
.ollie-talking  { animation: ollie-talk-bob 0.35s ease-in-out infinite; }
.ollie-thinking { animation: ollie-think    2.5s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .ollie-idle, .ollie-talking, .ollie-thinking { animation: none; }
}
```

Tassel no estado `thoughtful` continua via `.ollie-thoughtful [data-testid="ollie-hat-tassel"]`.

---

## Testes

O arquivo `OllieAvatar.test.tsx` existente cobre renderização por estado. Após a reescrita:
- Ajustar seletores `data-testid` se algum mudar de nome
- Adicionar teste: estado `empathetic` não renderiza pupila direita (wink)
- Adicionar teste: estado `encouraging` renderiza elemento `data-testid="ollie-wing-right-thumb"`
- Adicionar teste: estado `thoughtful` renderiza elemento `data-testid="ollie-wing-right-chin"`

---

## Arquivos modificados

| Arquivo | Tipo de mudança |
|---------|----------------|
| `src/components/OllieAvatar/OllieAvatar.tsx` | Reescrita completa |
| `src/app/globals.css` | Atualizar keyframes `ollie-*` |
| `src/components/OllieAvatar/OllieAvatar.test.tsx` | Ajustar/adicionar testes |
