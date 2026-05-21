# Redesign Visual & Acessibilidade — NeuroGuia

**Data:** 2026-05-20  
**Status:** Aprovado  
**Escopo:** Todas as telas — login, chat, ingest, feedback, config

---

## 1. Contexto e objetivos

O NeuroGuia é um assistente educacional com avatar OWL destinado a estudantes neurodivergentes do PPGEC/UPE. A interface atual usa um esquema de cores índigo genérico, sem cabeçalho global consistente e com espaçamentos abaixo do ideal para o público-alvo.

**Objetivos:**
- Identidade visual "Playful & Friendly" com OWL como protagonista
- Paleta nova centrada em laranja-mel e violeta suave
- Header global com navegação contextual e logo PPGEC UPE
- WCAG 2.1 AA + extras neurodivergentes (fonte maior, espaçamento generoso, sem flicker, foco claro)

---

## 2. Paleta de cores

| Token CSS | Hex | Uso |
|---|---|---|
| `--color-owl-orange` | `#F5820D` | Primária — botões, ícones, bordas de foco, texto ≥18px bold |
| `--color-owl-orange-dark` | `#D96A00` | Hover da primária |
| `--color-owl-orange-soft` | `#FEF0E0` | Fundo de bubbles OWL, zona de palco |
| `--color-violet` | `#7C5CBF` | Secundária — badges, chips, acentos admin |
| `--color-violet-dark` | `#614A99` | Hover secundária |
| `--color-violet-soft` | `#EDE8F8` | Fundo de bubbles usuário, card chaves API |
| `--color-cream` | `#FFFBF4` | Fundo geral da aplicação |
| `--color-cream-card` | `#FFFFFF` | Cards, header, input |
| `--color-ink` | `#1C1A2E` | Texto principal (contraste ≥7:1 sobre cream) |
| `--color-slate` | `#5A567A` | Texto secundário |
| `--color-mist` | `#E4E0F0` | Bordas e divisores |
| `--color-error` | `#C0392B` | Erros e alertas |
| `--color-success` | `#1A7F5A` | Confirmações |

Tokens existentes não listados acima são removidos do `globals.css`. Os novos tokens são registrados no Tailwind CSS 4 via `@theme` no topo do `globals.css` (ex: `--color-owl-orange: #F5820D` dentro do bloco `@theme { }`), tornando-os disponíveis como classes utilitárias `bg-owl-orange`, `text-owl-orange`, `border-owl-orange`, etc.

---

## 3. Tipografia

- **Font:** Atkinson Hyperlegible (mantida)
- **Base:** 17px (era 16px)
- **Line-height:** 1.75 (era 1.65)
- **Letter-spacing:** 0.02em
- **H1:** 1.5rem / bold — H2: 1.25rem / bold — H3: 1.1rem / semibold
- **Focus ring:** 3px sólido `owl-orange`, offset 3px (troca do índigo atual)
- **Alvos de toque mínimos:** 44×44px em todos os botões interativos

---

## 4. Header global (`AppHeader`)

Novo componente `src/components/AppHeader/index.tsx` compartilhado por todas as telas exceto login.

**Estrutura:**
```
[ Logo PPGEC horizontal (36px altura) ]  [ "NeuroGuia" bold ]   …espaço…   [ nav contextual ]  [ avatar inicial ]
```

- Altura: 64px fixo, `sticky top-0 z-50`
- Fundo: `cream-card` + `shadow-sm` + `border-b mist`
- Logo: `public/ppgec-logo.png` (versão horizontal), `height: 36px`

**Navegação contextual:**

| Tela | Links |
|---|---|
| `/chat` | Base de Conhecimento · Feedback · Configurações (admin) · Sair |
| `/ingest`, `/feedback`, `/config` | ← Voltar ao Chat · Sair |
| `/login` | *(sem header)* |

- "← Voltar ao Chat": botão, cor `owl-orange`, semibold, ícone seta SVG
- Links admin: cor `violet`, hover underline
- "Sair": cor `slate`, hover `ink`
- Avatar do usuário: círculo 32px, inicial do username, fundo `violet-soft`, texto `violet`
- Mobile `<640px`: links colapsam em menu hamburguer `aria-expanded` / `aria-controls`

---

## 5. Tela de Login (`/login`)

- Fundo: gradiente diagonal `cream` → `violet-soft`
- Logo PPGEC circular centralizado, 80px
- Card: `bg-cream-card`, `rounded-3xl`, `shadow-xl`, `px-8 py-10`, max-width 400px
- OWL em estado `neutral` / `idle` a 80px "espiando" pela borda inferior da tela
- Campos: `px-5 py-3.5`, min-height 48px, borda foco `owl-orange` 2px
- Erro: `role="alert"`, ícone ⚠️, fundo `error/10`
- Botão "Entrar": largura total, `owl-orange`, `rounded-2xl`, `py-3.5`

---

## 6. Tela de Chat (`/chat`)

### Zona de palco do OWL
- Fundo: `owl-orange-soft`, largura total, `py-5`
- Avatar centrado, 120px, `drop-shadow`
- Chips de estado emocional (só admin): fundo `violet-soft`, texto `violet`, `rounded-full`
- Transição suave de cor ao mudar `avatarState`: CSS `transition: background-color 0.4s ease` no wrapper da zona de palco

### Área de mensagens
- Fundo: `cream`, `px-4 py-4`, gap 16px entre bubbles
- **Bubble OWL:** fundo `owl-orange-soft`, borda esquerda 3px `owl-orange`, `rounded-2xl rounded-tl-sm`, `px-5 py-4`
- **Bubble usuário:** fundo `violet-soft`, borda direita 3px `violet`, `rounded-2xl rounded-tr-sm`, `px-5 py-4`
- Loading: 3 pontos animados cor `owl-orange`

### Quick replies
- Chips com scroll horizontal, fundo `cream-card`, borda `owl-orange` 1.5px, texto `owl-orange`, `rounded-full`
- Hover: fundo `owl-orange`, texto branco

### ChatInput
- Wrapper: `bg-cream-card`, `px-4 py-4`, `border-t mist`, `shadow-[0_-4px_12px_rgba(0,0,0,0.06)]`
- Campo: `px-5 py-3.5`, `rounded-2xl`, min-height 48px, borda foco `owl-orange`
- Botões microfone/speaker: SVG 20px, wrapper 44×44px `rounded-xl`, ativo `owl-orange`
- Botão enviar: círculo 44px, fundo `owl-orange`, ícone seta SVG branco

---

## 7. Tela de Base de Conhecimento (`/ingest`)

- Layout base admin: `max-w-3xl mx-auto px-6 py-6`
- Título com barra esquerda 4px `owl-orange`
- Zona de drop: borda tracejada 2px, hover `owl-orange`, ícone upload SVG 32px, `rounded-2xl`
- Progresso: ícone ✓ verde ou spinner por item (substitui lista de texto plano)
- Lista de docs: min-height 52px por item, ícone 📄, botão × com `aria-label`
- Botão "Processar na base": `owl-orange`, ícone ▶

---

## 8. Tela de Feedback (`/feedback`)

- Cards de satisfação: emojis com fundo colorido (`success/10`, `amber/10`, `error/10`), número grande centralizado
- Respostas negativas: card com `border-l-4 border-error`, pergunta bold, resposta regular
- Lacunas RAG: badge `owl-orange` com contagem à direita
- Botão "Exportar CSV": outline `owl-orange`, fundo transparente

---

## 9. Tela de Configurações (`/config`)

- System Prompt: `textarea` mono, `rounded-2xl`, borda foco `owl-orange`
- Grid provedor/modelo: campos `min-height 48px`, `rounded-xl`
- Card chaves de API: fundo `violet-soft`, borda `violet`, ícone 🔒
- Feedback de salvar: banner `role="status"` com fundo `success/10` + ✓
- Botão "Salvar": `owl-orange`, `rounded-2xl`, min-height 44px

---

## 10. Acessibilidade (WCAG 2.1 AA + extras)

- Contraste de texto ≥ 4.5:1 (normal) e ≥ 3:1 (grande/componentes) — verificar `owl-orange` sobre `cream` e `violet` sobre `cream`
- `owl-orange #F5820D` sobre `cream #FFFBF4`: ratio ≈ 3.1:1 — **usar apenas para texto grande (≥18px bold) ou ícones; para texto normal usar `owl-orange-dark #D96A00`** (ratio ≈ 4.6:1)
- Todos os erros comunicados por ícone + texto, não só cor (WCAG 1.4.1)
- `prefers-reduced-motion` mantido em `globals.css`
- Skip link "Ir para o conteúdo" reestilizado para `owl-orange`
- Menu hamburguer com `aria-expanded`, `aria-controls`, foco gerenciado
- Fonte base 17px, `letter-spacing` 0.02em, `line-height` 1.75
- Alvos de toque mínimos 44×44px

---

## 11. Assets necessários

- `public/ppgec-logo.png` — versão horizontal (PPGEC.png fornecida pelo usuário)
- `public/ppgec-logo-circular.png` — versão circular (ppgec_upe_logo.jpeg fornecida)
- Ícones SVG inline (seta, microfone, speaker, upload, enviar) — sem dependência de biblioteca de ícones externa

---

## 12. Componentes novos / modificados

| Componente | Ação |
|---|---|
| `src/components/AppHeader/index.tsx` | Novo — header global |
| `src/app/globals.css` | Modificar — nova paleta, tipografia, animações |
| `src/app/layout.tsx` | Não modificar — `AppHeader` é incluído individualmente em cada page (exceto login) para evitar complexidade de detecção de rota no layout raiz |
| `src/app/login/page.tsx` | Modificar — novo layout |
| `src/app/chat/page.tsx` | Modificar — zona de palco, bubbles, input |
| `src/components/ChatBubble/ChatBubble.tsx` | Modificar — novos estilos |
| `src/components/ChatInput/index.tsx` | Modificar — novos estilos e botões |
| `src/components/QuickReply/QuickReply.tsx` | Modificar — novos estilos |
| `src/components/EmotionControls/EmotionControls.tsx` | Modificar — novos estilos chips |
| `src/app/ingest/page.tsx` | Modificar — novo layout admin |
| `src/app/feedback/page.tsx` | Modificar — novo layout admin |
| `src/app/config/page.tsx` | Modificar — novo layout admin |
