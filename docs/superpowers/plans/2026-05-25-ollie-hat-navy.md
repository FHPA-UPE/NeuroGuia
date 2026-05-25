# OllieAvatar — Chapéu Marinho Acadêmico Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar o chapéu de formatura do OllieAvatar visualmente distinto do corpo usando azul-marinho acadêmico com borla dourada.

**Architecture:** Mudança exclusiva de valores de cor em `OllieAvatar.tsx` — gradiente `ollieHatGrad`, strokes do chapéu, faixa e borla. Nenhuma geometria SVG muda. Testes existentes são todos comportamentais e não verificam cores, portanto passarão sem alteração.

**Tech Stack:** React 19, SVG inline, TypeScript

---

### Task 1: Atualizar gradiente e cores do chapéu

**Files:**
- Modify: `src/components/OllieAvatar/OllieAvatar.tsx:234-238` (gradiente), `src/components/OllieAvatar/OllieAvatar.tsx:281-295` (elementos do chapéu)

- [ ] **Step 1: Substituir o gradiente `ollieHatGrad` (linhas 234–238)**

Localizar o bloco:
```tsx
<radialGradient id={`ollieHatGrad-${uid}`} cx="40%" cy="20%" r="80%" gradientUnits="objectBoundingBox">
  <stop offset="0%"   stopColor="#EAB028" />
  <stop offset="55%"  stopColor="#C27C14" />
  <stop offset="100%" stopColor="#8A5005" />
</radialGradient>
```

Substituir por:
```tsx
<radialGradient id={`ollieHatGrad-${uid}`} cx="35%" cy="20%" r="80%" gradientUnits="objectBoundingBox">
  <stop offset="0%"   stopColor="#2A3F7E" />
  <stop offset="55%"  stopColor="#1A2B5C" />
  <stop offset="100%" stopColor="#0D1A3A" />
</radialGradient>
```

- [ ] **Step 2: Atualizar stroke da coroa (linha ~283)**

Localizar:
```tsx
<rect x="54"  y="6"  width="132" height="38" rx="3"  fill={`url(#ollieHatGrad-${uid})`} stroke="#3D2000" strokeWidth="1.5" />
```

Substituir:
```tsx
<rect x="54"  y="6"  width="132" height="38" rx="3"  fill={`url(#ollieHatGrad-${uid})`} stroke="#0A1020" strokeWidth="1.5" />
```

- [ ] **Step 3: Atualizar faixa (band) entre coroa e aba (linha ~287)**

Localizar:
```tsx
<rect x="50"  y="42" width="140" height="12" rx="3"  fill="#F5F0E5" stroke="#D8C890" strokeWidth="1" />
```

Substituir:
```tsx
<rect x="50"  y="42" width="140" height="12" rx="3"  fill="#E8B020" stroke="#C27A00" strokeWidth="1" />
```

- [ ] **Step 4: Atualizar stroke da aba (brim) e sombra da aba (linhas ~289–291)**

Localizar:
```tsx
<rect x="28"  y="52" width="184" height="13" rx="5"  fill={`url(#ollieHatGrad-${uid})`} stroke="#3D2000" strokeWidth="1.5" />
{/* Hat brim shadow */}
<rect x="32"  y="63" width="176" height="5"  rx="3"  fill="#3D2000" opacity="0.25" />
```

Substituir:
```tsx
<rect x="28"  y="52" width="184" height="13" rx="5"  fill={`url(#ollieHatGrad-${uid})`} stroke="#0A1020" strokeWidth="1.5" />
{/* Hat brim shadow */}
<rect x="32"  y="63" width="176" height="5"  rx="3"  fill="#0A1020" opacity="0.25" />
```

- [ ] **Step 5: Atualizar borla (tassel) — fio e bolinhas (linhas ~292–295)**

Localizar:
```tsx
<line x1="182" y1="10" x2="208" y2="40" stroke="#6A3400" strokeWidth="2.5" />
<circle data-testid="ollie-hat-tassel" cx="210" cy="43" r="9" fill="#6A3400" />
<circle cx="210" cy="43" r="5" fill="#9A4E06" />
```

Substituir:
```tsx
<line x1="182" y1="10" x2="208" y2="40" stroke="#E8B020" strokeWidth="2.5" />
<circle data-testid="ollie-hat-tassel" cx="210" cy="43" r="9" fill="#D4900A" />
<circle cx="210" cy="43" r="5" fill="#F0C040" />
```

- [ ] **Step 6: Rodar testes existentes e verificar que passam**

```bash
npm test -- --testPathPattern=OllieAvatar
```

Saída esperada: todos os testes passam (nenhum verifica cores — só comportamento e presença de elementos).

- [ ] **Step 7: Verificar visualmente no browser**

```bash
npm run dev
```

Abrir `http://localhost:3000` e confirmar que o chapéu do Ollie aparece em azul-marinho com faixa dourada e borla dourada, claramente distinto do corpo âmbar.

- [ ] **Step 8: Commit**

```bash
git add src/components/OllieAvatar/OllieAvatar.tsx
git commit -m "feat(avatar): chapéu de formatura marinho com borla dourada no OllieAvatar"
```
