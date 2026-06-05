# Spec: Redesign do Chapéu de Formatura — OllieAvatar

**Data:** 2026-05-25
**Arquivo alvo:** `src/components/OllieAvatar/OllieAvatar.tsx`

## Objetivo

Redesenhar o chapéu de formatura (mortarboard) do Ollie com proporções mais fiéis, textura de feltro simulada, piping creme, botão central, cordão ocher e borla de fios creme — substituindo os dois círculos atuais da borla e a geometria achatada da coroa.

---

## Proporções (geometria nova)

| Elemento | Atual | Novo |
|---|---|---|
| Coroa — rect | x=54 y=6 width=132 height=38 rx=3 | x=62 y=2 width=116 height=46 rx=4 |
| Faixa — rect | x=50 y=42 width=140 height=12 rx=3 | x=52 y=46 width=136 height=10 rx=3 |
| Aba — rect | x=28 y=52 width=184 height=13 rx=5 | x=30 y=54 width=180 height=12 rx=6 |
| Sombra da aba | x=32 y=63 width=176 height=5 rx=3 | x=34 y=64 width=172 height=5 rx=3 |

Centro geométrico da nova coroa: **cx=120, cy=25** (y=2 + height=46/2 = 25).

---

## Gradiente `ollieHatGrad` (substituir valores em `<defs>`)

```tsx
<radialGradient id={`ollieHatGrad-${uid}`} cx="35%" cy="25%" r="75%" gradientUnits="objectBoundingBox">
  <stop offset="0%"   stopColor="#F0C040" />
  <stop offset="55%"  stopColor="#C88810" />
  <stop offset="100%" stopColor="#8A5C05" />
</radialGradient>
```

---

## Padrão de feltro `ollieFelt` (novo, adicionar em `<defs>`)

```tsx
<pattern id={`ollieFelt-${uid}`} x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
  <circle cx="1" cy="1" r="0.7" fill="#7A4E04" opacity="0.18" />
</pattern>
```

---

## Elementos SVG do chapéu (substituição completa das linhas ~281–295)

### 1. Piping creme (rect atrás da coroa)
```tsx
<rect x="59" y="-1" width="122" height="52" rx="6" fill="#F5EFE0" stroke="#D8C898" strokeWidth="1" />
```

### 2. Coroa — gradiente ocher
```tsx
<rect x="62" y="2" width="116" height="46" rx="4" fill={`url(#ollieHatGrad-${uid})`} stroke="#3D2000" strokeWidth="1" />
```

### 3. Overlay de textura feltro
```tsx
<rect x="62" y="2" width="116" height="46" rx="4" fill={`url(#ollieFelt-${uid})`} />
```

### 4. Highlight da coroa (manter)
```tsx
<rect x="66" y="5" width="72" height="10" rx="2" fill="white" opacity="0.18" />
```

### 5. Faixa (band)
```tsx
<rect x="52" y="46" width="136" height="10" rx="3" fill="#F5F0E5" stroke="#D8C890" strokeWidth="1" />
```

### 6. Aba (brim)
```tsx
<rect x="30" y="54" width="180" height="12" rx="6" fill={`url(#ollieHatGrad-${uid})`} stroke="#3D2000" strokeWidth="1.5" />
```

### 7. Sombra da aba
```tsx
<rect x="34" y="64" width="172" height="5" rx="3" fill="#3D2000" opacity="0.25" />
```

### 8. Botão central (dois círculos concêntricos)
```tsx
<circle cx="120" cy="25" r="5" fill="#F0EAD8" stroke="#C8B888" strokeWidth="1" />
<circle cx="120" cy="25" r="2.5" fill="#E8DFCA" />
```

### 9. Cordão ocher (botão → canto superior-direito → knot da borla)
```tsx
<path
  d="M 120,25 L 178,8 L 205,43"
  stroke="#C88810"
  strokeWidth="2"
  fill="none"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
```

### 10. Knot da borla (círculo ocher)
```tsx
<circle data-testid="ollie-hat-tassel" cx="205" cy="43" r="6" fill="#C88810" stroke="#8A5C05" strokeWidth="1" />
```

### 11. Fios creme da borla (7 linhas em leque)
```tsx
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

---

## Testes

Os testes existentes verificam `data-testid="ollie-hat-tassel"` (presente no knot circle), estrutura da cabeça, estados e movimentos — todos continuam passando. Nenhum teste verifica coordenadas ou cores.

O `data-testid="ollie-hat-tassel"` migra do circle antigo (cx=210, cy=43, r=9) para o novo knot (cx=205, cy=43, r=6).

---

## Fora do escopo

- Geometria do corpo, asas, olhos, bico — não muda
- Expressões/animações — não afetadas
- Outros componentes
