# Design: Refatoração do Avatar Ollie + Lip Sync TTS

**Data:** 2026-05-20  
**Status:** Aprovado  
**Referência visual:** `C:\Users\FHPA\Downloads\Ollie - Base.png`

---

## Contexto

O avatar atual (`OllieAvatar.tsx`) usa SVG inline mas apresenta dois problemas:

1. **Visual:** proporções fazem o personagem parecer um coco/blob — cabeça e corpo muito sobrepostos, detalhes insuficientes.
2. **Lip sync:** animação do bico é um CSS loop contínuo sem sincronização com fala real.

Este design cobre a reescrita completa para alta fidelidade visual + sincronização real com Web Speech API (TTS).

---

## Objetivos

- Recriar o estilo 3D cartoonizado da imagem de referência (Ollie): gradientes radiais, sombras, penas detalhadas, chapéu de formatura, olhos expressivos.
- Lip sync real: bico se abre a cada fronteira de palavra durante a leitura TTS automática de respostas do assistente.
- Manter as 5 expressões e 3 estados de movimento existentes.
- Não introduzir dependências externas — apenas SVG, React, e Web Speech API nativa.

---

## Arquitetura

### Arquivos modificados

| Arquivo | Tipo de mudança |
|---|---|
| `src/components/OllieAvatar/OllieAvatar.tsx` | Reescrita completa |
| `src/components/OllieAvatar/OllieAvatar.test.tsx` | Atualização de testes |
| `src/components/ChatInterface/ChatInterface.tsx` | Integração do hook useTTS |
| `src/app/globals.css` | Remoção da animação `ollie-talk` CSS |

### Arquivos novos

| Arquivo | Descrição |
|---|---|
| `src/hooks/useTTS.ts` | Hook Web Speech API |
| `src/hooks/useTTS.test.ts` | Testes do hook |

---

## Seção 1 — SVG de Alta Fidelidade

### ViewBox e proporções

- ViewBox: `0 0 200 240`
- **Cabeça:** `circle cx=100 cy=80 r=54` — gradiente radial dourado 3D, highlight em 40%/30%
- **Corpo:** `ellipse cx=100 cy=168 rx=72 ry=60` — mais largo e compacto que o atual (rx=62, ry=68), cria silhueta de coruja em vez de blob
- **Sobreposição natural:** corpo começa em y≈108, cabeça termina em y≈134 — 26px de overlap orgânico (penas)
- **Barriga:** `ellipse cx=100 cy=175 rx=44 ry=52` — branca/creme proeminente, alta no tronco

### Grupos SVG (ordem de renderização)

```
1. <defs>  — gradientes radiais, clipPaths
2. Sombra no chão  — ellipse sutil, opacidade 0.2
3. Asas  — 2 ellipses grandes rotacionadas (~rx=26 ry=50), gradiente próprio
4. Corpo  — gradiente radial bodyGrad
5. Barriga  — gradiente radial bellyGrad (branco → creme)
6. Marcas de penas  — arcos escalonados em 3 fileiras sobre a barriga
7. <g data-testid="ollie-head-group" transform="rotate(headTilt, 100, 80)">
   a. Cabeça — circle, headGrad
   b. Disco facial — ellipse gradiente creme translúcido
   c. Tufos/orelhas — polígonos pontiagudos (2-3 polígonos por lado para textura)
   d. Chapéu mortarboard — aba larga (path), topo escuro, faixa branca, borla com cordão
   e. Olhos brancos + pupilas + reflexo
   f. Sobrancelhas — paths espessos, marrom escuro
   g. Bico superior — polígono proeminente, dourado-laranja (#E8B923)
   h. Interior da boca — ellipse vermelha (#CC3300), visível só quando beakOpen=true
   i. Bico inferior — path, 2 estados via prop beakOpen
8. Pés — elipses com dedos definidos
```

### Gradientes radiais planejados

| ID | Uso | Highlight | Cores |
|---|---|---|---|
| `headGrad` | Cabeça | cx=40% cy=32% | #F0A020 → #C8760A → #8A4A00 |
| `bodyGrad` | Corpo | cx=45% cy=28% | #E89C18 → #C8760A → #8A4A00 |
| `bellyGrad` | Barriga | cx=50% cy=35% | #FFFFFF → #F0EAE0 → #E0D8CC |
| `wingGrad` | Asas | cx=50% cy=30% | #B87808 → #6A3800 |
| `faceDiscGrad` | Disco facial | cx=50% cy=50% | #F0D490 op=0.55 → op=0 |

### Bico — dois estados

```
beakOpen=false (fechado):
  path: 'M 88,113 L 112,113 L 111,119 L 89,119 Z'  (achatado)

beakOpen=true (aberto):
  path: 'M 84,112 Q 100,132 116,112 L 114,119 Q 100,138 86,119 Z'  (arco para baixo)
  + ellipse vermelha visível (cx=100, cy=114, rx=15, ry=8)
```

### Tufos/orelhas melhorados

Cada tufo usa 3 polígonos sobrepostos com leve variação de opacidade para dar textura de pena:

```svg
<!-- Tufo esquerdo -->
<polygon points="70,33 58,8 80,26"  fill="url(#headGrad)" />
<polygon points="65,33 56,12 74,28" fill="url(#headGrad)" opacity="0.8" />
<polygon points="75,33 62,9 83,27"  fill="url(#headGrad)" opacity="0.7" />
```

---

## Seção 2 — Hook `useTTS`

### Interface

```ts
function useTTS(text: string | null): {
  isSpeaking: boolean
  beakOpen:   boolean
}
```

### Comportamento

- `text` muda para valor não-nulo → cancela fala anterior → `speechSynthesis.speak(utterance)`
- `text` muda para `null` → `speechSynthesis.cancel()`
- Unmount → `speechSynthesis.cancel()`
- Guard SSR: `typeof window === 'undefined'` → retorna `{ isSpeaking: false, beakOpen: false }`

### Mapeamento de eventos

| Evento | Condição | Ação |
|---|---|---|
| `onstart` | — | `setIsSpeaking(true)`, iniciar fallback interval |
| `onboundary` | `event.name === 'word'` | `setBeakOpen(true)` → `setTimeout(() => setBeakOpen(false), 180)`, resetar fallback interval |
| `onend` | — | `setIsSpeaking(false)`, `setBeakOpen(false)`, limpar interval |
| `onerror` | — | idem `onend` |

### Fallback para ausência de `onboundary` (ex: Firefox)

Se `onboundary` não disparar dentro de 600ms após `onstart`, o hook ativa um `setInterval` de 350ms que alterna `beakOpen` true/false enquanto `isSpeaking=true`. Isso garante animação de boca em qualquer browser.

### Configuração da voz

```ts
utterance.lang  = 'pt-BR'
utterance.rate  = 0.95
utterance.pitch = 1.1
```

---

## Seção 3 — Integração no `ChatInterface`

### Nova prop em `OllieAvatar`

```ts
interface OllieAvatarProps {
  avatarState: AvatarState
  movement:    Movement
  beakOpen:    boolean   // adicionado
}
```

### Mudanças em `ChatInterface.tsx`

```ts
const lastAssistantText =
  messages.filter(m => m.role === 'assistant').at(-1)?.content ?? null

const { isSpeaking, beakOpen } = useTTS(lastAssistantText)

const effectiveMovement: Movement = isSpeaking ? 'talking' : movement

// render:
<OllieAvatar
  avatarState={avatarState}
  movement={effectiveMovement}
  beakOpen={beakOpen}
/>
```

### Mudanças em `globals.css`

Remover:
```css
.ollie-talking .ollie-beak-bottom {
  animation: ollie-talk 0.35s ease-in-out infinite;
}
@keyframes ollie-talk { ... }
```

Manter: `ollie-bob`, `ollie-think`, `prefers-reduced-motion`.

---

## Seção 4 — Testes

### `OllieAvatar.test.tsx`

- Renderiza sem erros com `beakOpen=false` (estado padrão)
- Quando `beakOpen=true`: bico inferior usa path de boca aberta
- Quando `beakOpen=false`: bico inferior usa path de boca fechada
- Interior da boca (ellipse vermelha) é visível apenas quando `beakOpen=true`
- Cada expressão renderiza `data-testid="ollie-head-group"` com `transform` correto

### `useTTS.test.ts`

- Mock de `window.speechSynthesis` e `SpeechSynthesisUtterance`
- `isSpeaking` começa `false`, vai para `true` em `onstart`, volta em `onend`
- `beakOpen` vai para `true` em `onboundary` e para `false` após 180ms
- Quando `text=null`: não chama `speak()`
- Quando `text` muda: chama `cancel()` antes de novo `speak()`
- Guard SSR: sem `window`, retorna `{ isSpeaking: false, beakOpen: false }`

---

## Notas de implementação

- O agente de desenvolvimento **deve abrir** `C:\Users\FHPA\Downloads\Ollie - Base.png` antes de escrever o SVG e usar como referência visual direta para proporções, cores e detalhes.
- O SVG deve ter `aria-label` atualizado para refletir o estado atual incluindo se está falando.
- Reduzir a separação cabeça/corpo é a principal correção de proporção — body `ry` menor e `rx` maior resolve a silhueta de coco.
- `prefers-reduced-motion` já presente no CSS deve continuar desativando todas as animações.
