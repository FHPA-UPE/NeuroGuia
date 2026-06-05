# OllieAvatar — Redesign Chapéu Mortarboard Ocher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar o chapéu de formatura do OllieAvatar com proporções mais fiéis, textura de feltro simulada, piping creme, botão central, cordão ocher e borla de fios creme.

**Architecture:** Todas as mudanças ficam em `src/components/OllieAvatar/OllieAvatar.tsx`. Task 1 atualiza `<defs>` (gradiente ocher + novo padrão feltro). Task 2 substitui os elementos SVG do chapéu (geometria nova + 11 elementos detalhados). Nenhuma lógica, prop ou tipo muda.

**Tech Stack:** React 19, SVG inline, TypeScript

---

### Task 1: Atualizar `<defs>` — gradiente ocher e padrão feltro

**Files:**
- Modify: `src/components/OllieAvatar/OllieAvatar.tsx:234-238`

- [ ] **Step 1: Verificar estado atual do arquivo**

Leia as linhas 230–245 de `src/components/OllieAvatar/OllieAvatar.tsx` para confirmar o estado atual do gradiente `ollieHatGrad` (deve ter valores navy: `#2A3F7E`, `#1A2B5C`, `#0D1A3A`).

- [ ] **Step 2: Substituir gradiente `ollieHatGrad` por ocher**

Localizar (valores exatos após implementação navy anterior):
```tsx
          <radialGradient id={`ollieHatGrad-${uid}`} cx="35%" cy="20%" r="80%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#2A3F7E" />
            <stop offset="55%"  stopColor="#1A2B5C" />
            <stop offset="100%" stopColor="#0D1A3A" />
          </radialGradient>
```

Substituir por:
```tsx
          <radialGradient id={`ollieHatGrad-${uid}`} cx="35%" cy="25%" r="75%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#F0C040" />
            <stop offset="55%"  stopColor="#C88810" />
            <stop offset="100%" stopColor="#8A5C05" />
          </radialGradient>
```

- [ ] **Step 3: Adicionar padrão `ollieFelt` após o gradiente `ollieHatGrad`**

Imediatamente após o bloco `ollieHatGrad` (já substituído no Step 2), inserir o seguinte bloco novo:
```tsx

          <pattern id={`ollieFelt-${uid}`} x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="#7A4E04" opacity="0.18" />
          </pattern>
```

- [ ] **Step 4: Rodar testes para confirmar que defs não quebraram nada**

```bash
npx jest OllieAvatar
```

Saída esperada: 16 testes passam. Se algum falhar, corrija antes de continuar.

- [ ] **Step 5: Commit**

```bash
git add src/components/OllieAvatar/OllieAvatar.tsx
git commit -m "feat(avatar): gradiente ocher e padrão feltro no hat grad"
```

---

### Task 2: Substituir elementos SVG do chapéu

**Files:**
- Modify: `src/components/OllieAvatar/OllieAvatar.tsx:281-295` (aproximadamente)

- [ ] **Step 1: Localizar o bloco atual do chapéu**

Leia as linhas 278–300 de `src/components/OllieAvatar/OllieAvatar.tsx` para confirmar o bloco exato do chapéu. O bloco começa com o comentário `{/* Hat — mortarboard graduation cap */}` e termina após o segundo `<circle>` da borla (que tem `fill="#F0C040"`).

- [ ] **Step 2: Substituir o bloco completo do chapéu**

Localizar exatamente (8 elementos: 1 comentário-bloco, 2 rects com comentários, 1 linha, 2 circles):
```tsx
            {/* Hat — mortarboard graduation cap */}
            {/* Hat crown top (square) */}
            <rect x="54"  y="6"  width="132" height="38" rx="3"  fill={`url(#ollieHatGrad-${uid})`} stroke="#0A1020" strokeWidth="1.5" />
            {/* Hat crown top highlight */}
            <rect x="58"  y="8"  width="80"  height="10" rx="2"  fill="white" opacity="0.18" />
            {/* Hat band - curved white strip */}
            <rect x="50"  y="42" width="140" height="12" rx="3"  fill="#E8B020" stroke="#C27A00" strokeWidth="1" />
            {/* Hat brim */}
            <rect x="28"  y="52" width="184" height="13" rx="5"  fill={`url(#ollieHatGrad-${uid})`} stroke="#0A1020" strokeWidth="1.5" />
            {/* Hat brim shadow */}
            <rect x="32"  y="63" width="176" height="5"  rx="3"  fill="#0A1020" opacity="0.25" />
            <line x1="182" y1="10" x2="208" y2="40" stroke="#E8B020" strokeWidth="2.5" />
            <circle data-testid="ollie-hat-tassel" cx="210" cy="43" r="9" fill="#D4900A" />
            <circle cx="210" cy="43" r="5" fill="#F0C040" />
```

Substituir por (11 elementos: piping + coroa + feltro overlay + highlight + faixa + aba + sombra + botão x2 + cordão + knot + fios):
```tsx
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
```

- [ ] **Step 3: Rodar testes**

```bash
npx jest OllieAvatar
```

Saída esperada: 16 testes passam. O teste `'chapéu mortarboard com tassel presente no SVG'` deve passar porque o `data-testid="ollie-hat-tassel"` foi migrado para o novo circle do knot (cx=205, cy=43, r=6).

Se algum teste falhar, investigue antes de continuar.

- [ ] **Step 4: Verificar visualmente no browser**

```bash
npm run dev
```

Abrir `http://localhost:3000` e confirmar:
- Chapéu tem contorno creme (piping) visível ao redor da coroa
- Coroa em ocher quente com leve textura pontilhada
- Botão pequeno creme visível no centro da coroa
- Cordão ocher saindo do botão até a borla à direita
- Borla com fios creme em leque (não dois círculos)
- Faixa creme separando coroa e aba
- Aba ocher mais larga

- [ ] **Step 5: Commit**

```bash
git add src/components/OllieAvatar/OllieAvatar.tsx
git commit -m "feat(avatar): redesign mortarboard — proporções, piping, botão, cordão e borla de fios"
```
