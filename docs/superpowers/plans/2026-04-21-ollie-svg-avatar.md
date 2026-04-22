# OLLIE SVG Avatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a dependência `rive-react` por um componente `OllieAvatar` com SVG inline + CSS animations, totalmente integrado ao sistema existente (avatarState + movement reativos ao backend).

**Architecture:** O componente `OllieAvatar` renderiza um SVG inline da coruja OLLIE. Lookup tables mapeiam cada `AvatarState` para posições de pupilas e caminhos de sobrancelhas (alterados via props React). Animações de movimento (`idle`, `talking`, `thinking`) são CSS keyframes aplicadas via classes no container. A interface de props permanece idêntica — nenhum outro arquivo do projeto precisa mudar.

**Tech Stack:** React 19, TypeScript, CSS keyframes, SVG inline, Jest + @testing-library/react

---

## Mapa de Arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `frontend/src/components/OllieAvatar/OllieAvatar.tsx` | Reescrever | SVG inline + lookup tables de expressão + classes de movimento |
| `frontend/src/components/OllieAvatar/OllieAvatar.test.tsx` | Reescrever | Testes sem mock Rive — verificar aria-label, classes CSS, SVG presente |
| `frontend/src/app/globals.css` | Modificar | Adicionar keyframes: `ollie-bob`, `ollie-talk`, `ollie-think` |
| `frontend/package.json` | Modificar | Remover `rive-react` das dependencies |

**Arquivos que NÃO mudam:**
- `src/types/chat.ts` — props AvatarState e Movement permanecem iguais
- `src/components/ChatInterface/ChatInterface.tsx` — já passa avatarState e movement corretamente
- `src/hooks/useChat.ts` — sem alteração
- `backend/` — sem alteração

---

## Task 1: Adicionar Keyframes CSS em globals.css

**Files:**
- Modify: `frontend/src/app/globals.css`

- [ ] **Step 1: Abrir o arquivo atual**

Ler `C:\Users\FHPA\Desktop\NeuroGuia\frontend\src\app\globals.css` para verificar o conteúdo atual antes de editar.

- [ ] **Step 2: Adicionar keyframes no final do arquivo**

Append ao final de `frontend/src/app/globals.css`:

```css
/* OLLIE Avatar Animations */
@keyframes ollie-bob {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}

@keyframes ollie-talk {
  0%, 100% { transform: scaleY(1); transform-origin: top center; }
  50%       { transform: scaleY(1.6); transform-origin: top center; }
}

@keyframes ollie-think {
  0%, 100% { transform: rotate(0deg); transform-origin: bottom center; }
  40%       { transform: rotate(-10deg); transform-origin: bottom center; }
  60%       { transform: rotate(10deg); transform-origin: bottom center; }
}

.ollie-idle    { animation: ollie-bob   3s ease-in-out infinite; }
.ollie-talking { animation: ollie-bob   3s ease-in-out infinite; }
.ollie-thinking { animation: ollie-think 2s ease-in-out infinite; }

.ollie-talking .ollie-beak-bottom {
  animation: ollie-talk 0.35s ease-in-out infinite;
}
```

> **Nota:** Remover também o seletor `.ollie-avatar canvas` do bloco `prefers-reduced-motion` existente (passa a ser dead code — o SVG já é coberto pela regra `*` acima). Substituir por `.ollie-avatar svg { animation: none !important; }` ou remover a linha.

- [ ] **Step 3: Verificar que o arquivo de globals não quebrou**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npm run build 2>&1 | tail -10
```
Expected: Build OK (nenhum erro de CSS).

- [ ] **Step 4: Commit**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia
git add frontend/src/app/globals.css
git commit -m "feat: keyframes CSS para animações da OLLIE (bob, talk, think)"
```

---

## Task 2: Reescrever OllieAvatar.test.tsx (TDD — escrever testes primeiro)

**Files:**
- Rewrite: `frontend/src/components/OllieAvatar/OllieAvatar.test.tsx`

- [ ] **Step 1: Sobrescrever o arquivo de testes**

Substituir completamente `C:\Users\FHPA\Desktop\NeuroGuia\frontend\src\components\OllieAvatar\OllieAvatar.test.tsx` por:

```typescript
import { render, screen } from '@testing-library/react'
import OllieAvatar from './OllieAvatar'

describe('OllieAvatar', () => {
  it('renderiza o SVG da OLLIE', () => {
    const { container } = render(<OllieAvatar avatarState="neutral" movement="idle" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('tem aria-label descrevendo o estado atual', () => {
    render(<OllieAvatar avatarState="empathetic" movement="talking" />)
    expect(screen.getByLabelText(/ollie está empathetic/i)).toBeInTheDocument()
  })

  it('aplica classe de movimento correta no container', () => {
    const { container } = render(<OllieAvatar avatarState="neutral" movement="thinking" />)
    expect(container.firstChild).toHaveClass('ollie-thinking')
  })

  it('aplica classe de estado correta no container', () => {
    const { container } = render(<OllieAvatar avatarState="happy" movement="idle" />)
    expect(container.firstChild).toHaveClass('ollie-happy')
  })

  it('atualiza aria-label quando avatarState muda', () => {
    const { rerender } = render(<OllieAvatar avatarState="neutral" movement="idle" />)
    expect(screen.getByLabelText(/ollie está neutral/i)).toBeInTheDocument()
    rerender(<OllieAvatar avatarState="happy" movement="idle" />)
    expect(screen.getByLabelText(/ollie está happy/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar testes — confirmar FAIL**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npx jest src/components/OllieAvatar/OllieAvatar.test.tsx --no-coverage 2>&1 | tail -15
```
Expected: FAIL — os testes buscam classes CSS que o componente Rive atual não tem.

---

## Task 3: Reescrever OllieAvatar.tsx com SVG Inline

**Files:**
- Rewrite: `frontend/src/components/OllieAvatar/OllieAvatar.tsx`

- [ ] **Step 1: Substituir completamente o arquivo**

Criar `C:\Users\FHPA\Desktop\NeuroGuia\frontend\src\components\OllieAvatar\OllieAvatar.tsx` com o conteúdo abaixo:

```typescript
import type { AvatarState, Movement } from '@/types/chat'

interface OllieAvatarProps {
  avatarState: AvatarState
  movement: Movement
}

interface ExpressionConfig {
  leftPupil: { cx: number; cy: number }
  rightPupil: { cx: number; cy: number }
  leftBrow: string
  rightBrow: string
}

const EXPRESSIONS: Record<AvatarState, ExpressionConfig> = {
  neutral: {
    leftPupil:  { cx: 78,  cy: 80 },
    rightPupil: { cx: 122, cy: 80 },
    leftBrow:  'M 62 62 Q 78 56 94 62',
    rightBrow: 'M 106 62 Q 122 56 138 62',
  },
  happy: {
    leftPupil:  { cx: 78,  cy: 76 },
    rightPupil: { cx: 122, cy: 76 },
    leftBrow:  'M 62 57 Q 78 49 94 57',
    rightBrow: 'M 106 57 Q 122 49 138 57',
  },
  encouraging: {
    leftPupil:  { cx: 80,  cy: 76 },
    rightPupil: { cx: 124, cy: 76 },
    leftBrow:  'M 62 59 Q 78 51 94 59',
    rightBrow: 'M 106 57 Q 122 49 138 57',
  },
  empathetic: {
    leftPupil:  { cx: 78,  cy: 84 },
    rightPupil: { cx: 122, cy: 84 },
    leftBrow:  'M 62 66 Q 78 61 94 66',
    rightBrow: 'M 106 66 Q 122 61 138 66',
  },
  thoughtful: {
    leftPupil:  { cx: 74,  cy: 76 },
    rightPupil: { cx: 118, cy: 76 },
    leftBrow:  'M 62 62 Q 78 56 94 62',
    rightBrow: 'M 106 59 Q 122 53 138 59',
  },
}

export default function OllieAvatar({ avatarState, movement }: OllieAvatarProps) {
  const expr = EXPRESSIONS[avatarState]

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
        {/* Asas (atrás do corpo) */}
        <ellipse cx="42"  cy="148" rx="22" ry="46" fill="#A06808" transform="rotate(-10 42 148)" />
        <ellipse cx="158" cy="148" rx="22" ry="46" fill="#A06808" transform="rotate(10 158 148)" />

        {/* Corpo */}
        <ellipse cx="100" cy="150" rx="62" ry="68" fill="#C8860A" />

        {/* Barriga */}
        <ellipse cx="100" cy="160" rx="38" ry="48" fill="#F5F0E8" />

        {/* Cabeça */}
        <circle cx="100" cy="78" r="52" fill="#C8860A" />

        {/* Tufos das orelhas */}
        <polygon points="72,32 60,10 84,28" fill="#C8860A" />
        <polygon points="128,32 140,10 116,28" fill="#C8860A" />

        {/* Chapéu — aba */}
        <rect x="57" y="29" width="86" height="12" rx="6" fill="#B87A0A" stroke="#FFFFFF" strokeWidth="2.5" />
        {/* Chapéu — topo */}
        <rect x="71" y="7" width="58" height="24" rx="4" fill="#2D5016" />
        {/* Chapéu — pompom/borla */}
        <line x1="129" y1="13" x2="152" y2="19" stroke="#C8860A" strokeWidth="1.5" />
        <circle cx="153" cy="20" r="4" fill="#C8860A" />

        {/* Olhos brancos */}
        <circle cx="78"  cy="80" r="19" fill="white" />
        <circle cx="122" cy="80" r="19" fill="white" />

        {/* Pupilas (reativas ao avatarState) */}
        <circle cx={expr.leftPupil.cx}  cy={expr.leftPupil.cy}  r="11" fill="#1a1a1a" />
        <circle cx={expr.leftPupil.cx  + 4} cy={expr.leftPupil.cy  - 4} r="3.5" fill="white" />

        <circle cx={expr.rightPupil.cx} cy={expr.rightPupil.cy} r="11" fill="#1a1a1a" />
        <circle cx={expr.rightPupil.cx + 4} cy={expr.rightPupil.cy - 4} r="3.5" fill="white" />

        {/* Sobrancelhas (reativas ao avatarState) */}
        <path d={expr.leftBrow}  stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d={expr.rightBrow} stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Bico */}
        <polygon points="100,92 88,106 112,106" fill="#E8B923" />
        {/* Bico inferior (animado no estado talking) */}
        <polygon className="ollie-beak-bottom" points="88,106 112,106 100,112" fill="#C8860A" />

        {/* Pés */}
        <rect x="78"  y="213" width="18" height="7" rx="3.5" fill="#E8B923" />
        <rect x="104" y="213" width="18" height="7" rx="3.5" fill="#E8B923" />
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Rodar testes — confirmar 5 PASS**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npx jest src/components/OllieAvatar/OllieAvatar.test.tsx --no-coverage 2>&1 | tail -15
```
Expected: 5 testes PASS

Se algum teste falhar por conta de classe CSS não encontrada, verificar se o `className` do container está correto: deve ser `ollie-avatar ollie-${avatarState} ollie-${movement}`.

- [ ] **Step 3: Rodar todos os testes frontend**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npx jest --no-coverage 2>&1 | tail -15
```
Expected: todos os testes passando.

Nota: Os outros testes (ChatInterface.test.tsx) ainda mockam `rive-react`. Após este step, o ChatInterface.test.tsx vai FALHAR porque o OllieAvatar não usa mais rive-react. Isso é esperado — será corrigido na Task 4.

- [ ] **Step 4: Commit parcial**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia
git add frontend/src/components/OllieAvatar/OllieAvatar.tsx frontend/src/components/OllieAvatar/OllieAvatar.test.tsx
git commit -m "feat: OllieAvatar reescrito com SVG inline e CSS animations"
```

---

## Task 4: Atualizar ChatInterface.test.tsx (remover mock rive-react)

**Files:**
- Modify: `frontend/src/components/ChatInterface/ChatInterface.test.tsx`

- [ ] **Step 1: Ler o arquivo atual**

Ler `C:\Users\FHPA\Desktop\NeuroGuia\frontend\src\components\ChatInterface\ChatInterface.test.tsx`.

- [ ] **Step 2: Remover o mock de rive-react e atualizar os testes**

Substituir completamente `ChatInterface.test.tsx` por:

```typescript
import { render, screen } from '@testing-library/react'
import ChatInterface from './ChatInterface'

jest.mock('@/hooks/useChat', () => ({
  useChat: jest.fn(() => ({
    messages: [],
    isLoading: false,
    avatarState: 'neutral',
    movement: 'idle',
    sendMessage: jest.fn(),
  })),
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
      isLoading: false,
      avatarState: 'happy',
      movement: 'talking',
      sendMessage: jest.fn(),
    })
    render(<ChatInterface />)
    expect(screen.getByText('Olá! Como posso ajudar?')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Rodar todos os testes — confirmar todos PASS**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npx jest --no-coverage 2>&1 | tail -15
```
Expected: 19 testes PASS (17 anteriores - 3 OllieAvatar antigos + 5 novos OllieAvatar + 2 ChatInterface atualizados = 19 no total).

Contagem exata:
- OllieAvatar: 5 (novos)
- ChatInterface: 2 (atualizados)
- ChatBubble: 3
- QuickReply: 3
- ChatInput: 4
- useChat: 2
- **Total: 19**

- [ ] **Step 4: Commit**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia
git add frontend/src/components/ChatInterface/ChatInterface.test.tsx
git commit -m "test: ChatInterface atualizado para SVG inline (sem mock rive-react)"
```

---

## Task 5: Remover rive-react + Verificação Final

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Desinstalar rive-react**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npm uninstall rive-react
```

- [ ] **Step 2: Verificar que não há mais imports de rive-react**

```bash
grep -r "rive-react" C:/Users/FHPA/Desktop/NeuroGuia/frontend/src/
```
Expected: nenhum resultado (zero imports).

- [ ] **Step 3: Rodar todos os testes novamente**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npx jest --no-coverage 2>&1 | tail -10
```
Expected: 19 testes PASS.

- [ ] **Step 4: Verificar build de produção**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npm run build 2>&1 | tail -15
```
Expected: Build OK — "Compiled successfully" ou similar, sem erros TypeScript.

- [ ] **Step 5: Iniciar servidor de desenvolvimento e verificar visualmente**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npm run dev
```
Abrir `http://localhost:3000` no browser.

Verificar:
- [ ] OLLIE aparece como SVG (coruja âmbar com olhos brancos e chapéu verde)
- [ ] Layout mostra header "NeuroGuia — OLLIE", a OLLIE, e o campo de input
- [ ] Não há erros no console do browser

- [ ] **Step 6: Commit final**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: remove rive-react (substituído por SVG inline)"
```

---

## Task 6: Configurar API Key e Testar Integração Completa

**Files:**
- Modify: `backend/.env` (não comitado)

- [ ] **Step 1: Configurar ANTHROPIC_API_KEY**

Editar `C:\Users\FHPA\Desktop\NeuroGuia\backend\.env`:

```
ANTHROPIC_API_KEY=sk-ant-api03-...  ← sua chave de console.anthropic.com
CHROMA_PERSIST_DIR=./data/chroma
DOCS_DIR=./data/docs
```

> **Atenção:** `backend/app/services/llm_service.py` já usa `claude-haiku-4-5-20251001` (modificação pendente de commit). Nenhuma edição necessária — pular direto para o Step 2.

- [ ] **Step 2: Iniciar backend**

Em um terminal:
```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/backend
PYTHONPATH=. venv/Scripts/uvicorn app.main:app --reload --port 8000
```
Expected: `Application startup complete.`

- [ ] **Step 3: Iniciar frontend**

Em outro terminal:
```bash
cd C:/Users/FHPA/Desktop/NeuroGuia/frontend
npm run dev
```
Expected: `Ready in Xs` na porta 3000.

- [ ] **Step 4: Testar integração E2E no browser**

Abrir `http://localhost:3000`:

1. Digitar "Olá" no campo de texto → pressionar Enter
2. Verificar que OLLIE muda de expressão (avatarState e movement vindos do backend)
3. Verificar que a resposta aparece como ChatBubble
4. Verificar que QuickReply mostra as opções retornadas
5. Clicar numa QuickReply e verificar o fluxo completo

- [ ] **Step 5: Commit se houve alteração no model**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia
git add backend/app/services/llm_service.py
git commit -m "chore: trocar modelo para claude-haiku-4-5 (economia de tokens)"
```

---

## Self-Review do Plano

### Spec Coverage

| Requisito | Task |
|-----------|------|
| SVG inline substitui Rive | Task 3 |
| 5 expressões (avatarState) via lookup table | Task 3 |
| 3 movimentos (movement) via CSS keyframes | Task 1 + Task 3 |
| Testes atualizados sem mock Rive | Task 2 + Task 4 |
| Remoção de rive-react | Task 5 |
| Integração com backend (API key) | Task 6 |
| aria-label acessível | Task 3 |
| prefers-reduced-motion | já em globals.css (mantido) |

### Placeholder Scan
Nenhum TBD, TODO ou "implement later" encontrado.

### Type Consistency
- `AvatarState` e `Movement` importados de `@/types/chat` em todas as tasks
- `EXPRESSIONS` usa `Record<AvatarState, ExpressionConfig>` — type-safe, cobre todos os 5 estados
- Classes CSS: `ollie-${avatarState}` e `ollie-${movement}` batem com os nomes dos keyframes em globals.css

---

## Próximos Passos (Fora do Escopo deste Plano)

1. **Adicionar PDFs** em `backend/data/docs/` (LBI, Decreto 12.686, MEC 3.284, Normas UPE)
2. **Rodar indexação:** `cd backend && PYTHONPATH=. venv/Scripts/python scripts/indexar_docs.py`
3. **Migração futura para Rive:** quando assets Figma estiverem prontos, reverter `OllieAvatar.tsx` para Rive — o restante do sistema não muda
