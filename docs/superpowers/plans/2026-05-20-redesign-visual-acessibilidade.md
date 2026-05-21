# Redesign Visual & Acessibilidade — NeuroGuia

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar todas as 5 telas do NeuroGuia com paleta OWL orange/violet, header global, e conformidade WCAG 2.1 AA + extras neurodivergentes.

**Architecture:** Os novos tokens de cor são declarados em `tailwind.config.ts` e mirrored em `:root` no `globals.css`. Um novo componente `AppHeader` é compartilhado por chat, ingest, feedback e config — com navegação contextual. A tela de login permanece sem header. Cada page component é reescrito para usar os novos tokens; a lógica e os hooks não mudam.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4 (com `tailwind.config.ts`), Atkinson Hyperlegible, Jest + React Testing Library, `next/image`, `next/navigation`

**Spec:** `docs/superpowers/specs/2026-05-20-redesign-visual-acessibilidade-design.md`

---

### Task 1: Paleta de cores e tipografia

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Substituir tokens de cor no `tailwind.config.ts`**

Reescrever completamente o arquivo:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'owl-orange':      '#F5820D',
        'owl-orange-dark': '#D96A00',
        'owl-orange-soft': '#FEF0E0',
        'violet':          '#7C5CBF',
        'violet-dark':     '#614A99',
        'violet-soft':     '#EDE8F8',
        'cream':           '#FFFBF4',
        'cream-card':      '#FFFFFF',
        'ink':             '#1C1A2E',
        'slate-text':      '#5A567A',
        'mist':            '#E4E0F0',
        'error':           '#C0392B',
        'success':         '#1A7F5A',
      },
      borderRadius: {
        'btn':  '12px',
        'card': '16px',
      },
      fontFamily: {
        sans: ['var(--font-atkinson)', 'system-ui', 'sans-serif'],
      },
    },
  },
}

export default config
```

- [ ] **Step 2: Atualizar `:root` e tipografia no `globals.css`**

Substituir o conteúdo do arquivo mantendo apenas as animações OWL:

```css
@import "tailwindcss";

:root {
  --color-owl-orange:      #F5820D;
  --color-owl-orange-dark: #D96A00;
  --color-owl-orange-soft: #FEF0E0;
  --color-violet:          #7C5CBF;
  --color-violet-dark:     #614A99;
  --color-violet-soft:     #EDE8F8;
  --color-cream:           #FFFBF4;
  --color-cream-card:      #FFFFFF;
  --color-ink:             #1C1A2E;
  --color-slate-text:      #5A567A;
  --color-mist:            #E4E0F0;
  --color-error:           #C0392B;
  --color-success:         #1A7F5A;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-atkinson), 'Atkinson Hyperlegible', sans-serif;
  background-color: var(--color-cream);
  color: var(--color-ink);
  font-size: 17px;
  line-height: 1.75;
  letter-spacing: 0.02em;
}

*:focus-visible {
  outline: 3px solid var(--color-owl-orange);
  outline-offset: 3px;
}

::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: rgba(245, 130, 13, 0.25);
  border-radius: 2px;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .owl-idle, .owl-talking, .owl-thinking, .owl-talk,
  .owl-state-happy #owl-hat, .owl-state-happy #owl-hat-tassel,
  .owl-state-thoughtful #owl-hat-tassel { animation: none; }
}

@keyframes owl-idle-bob {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}
@keyframes owl-talk-bob {
  0%, 100% { transform: translateY(0px) scale(1); }
  25% { transform: translateY(-2px) scale(1.01); }
  75% { transform: translateY(2px) scale(0.99); }
}
@keyframes owl-think-spin {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-3deg); }
  75% { transform: rotate(3deg); }
}
@keyframes owl-talk-beak {
  0%, 100% { d: path('M33,47 Q40,50 47,47'); }
  50% { d: path('M33,47 Q40,56 47,47'); }
}
@keyframes owl-hat-happy-bounce {
  0% { transform: translateY(0) rotate(0deg); }
  30% { transform: translateY(-6px) rotate(-3deg); }
  60% { transform: translateY(2px) rotate(2deg); }
  100% { transform: translateY(0) rotate(0deg); }
}
@keyframes owl-tassel-sway {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(20deg); }
}
@keyframes owl-tassel-pendulum {
  0%, 100% { transform: rotate(-25deg); }
  50% { transform: rotate(25deg); }
}

.owl-idle    { animation: owl-idle-bob   3s ease-in-out infinite; }
.owl-talking { animation: owl-talk-bob   0.4s ease-in-out infinite; }
.owl-thinking{ animation: owl-think-spin 3s ease-in-out infinite; }
.owl-talk    { animation: owl-talk-beak  0.24s ease-in-out; }

.owl-state-happy    #owl-hat        { animation: owl-hat-happy-bounce 0.5s ease-out forwards; }
.owl-state-happy    #owl-hat-tassel { animation: owl-tassel-sway 0.6s ease-in-out 0.1s; }
.owl-state-thoughtful #owl-hat-tassel { animation: owl-tassel-pendulum 1.5s ease-in-out infinite; }
```

- [ ] **Step 3: Executar lint e testes para verificar que nada quebrou**

```bash
npm run lint
npm test
```

Esperado: todos os testes passam. Avisos de lint sobre tokens inexistentes serão resolvidos nas próximas tasks.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat(design): nova paleta owl-orange/violet e tipografia 17px/1.75"
```

---

### Task 2: Componente AppHeader

**Files:**
- Create: `src/components/AppHeader/index.tsx`
- Create: `src/components/AppHeader/__tests__/AppHeader.test.tsx`

- [ ] **Step 1: Escrever os testes (falharão porque o componente não existe)**

Criar `src/components/AppHeader/__tests__/AppHeader.test.tsx`:

```tsx
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}))
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AppHeader } from '../index'

const mockPathname = usePathname as jest.Mock
const mockAuth = useAuth as jest.Mock

beforeEach(() => {
  mockAuth.mockReturnValue({ user: { username: 'admin', role: 'admin' }, logout: jest.fn() })
})

test('exibe logo PPGEC e título NeuroGuia', () => {
  mockPathname.mockReturnValue('/chat')
  render(<AppHeader />)
  expect(screen.getByAltText('PPGEC UPE')).toBeInTheDocument()
  expect(screen.getByText('NeuroGuia')).toBeInTheDocument()
})

test('no /chat mostra links admin e botão Sair, sem Voltar', () => {
  mockPathname.mockReturnValue('/chat')
  render(<AppHeader />)
  expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
  expect(screen.getByText('Sair')).toBeInTheDocument()
  expect(screen.queryByText(/Voltar ao Chat/)).toBeNull()
})

test('fora do /chat mostra ← Voltar ao Chat', () => {
  mockPathname.mockReturnValue('/ingest')
  render(<AppHeader />)
  expect(screen.getByText(/Voltar ao Chat/)).toBeInTheDocument()
  expect(screen.queryByText('Base de Conhecimento')).toBeNull()
})

test('skip link está presente e acessível', () => {
  mockPathname.mockReturnValue('/chat')
  render(<AppHeader />)
  expect(screen.getByText('Ir para o conteúdo')).toBeInTheDocument()
})

test('avatar do usuário exibe inicial do username', () => {
  mockPathname.mockReturnValue('/chat')
  render(<AppHeader />)
  expect(screen.getByLabelText('Usuário: admin')).toBeInTheDocument()
})

test('Configurações visível apenas para role admin', () => {
  mockPathname.mockReturnValue('/chat')
  mockAuth.mockReturnValue({ user: { username: 'aluno', role: 'student' }, logout: jest.fn() })
  render(<AppHeader />)
  expect(screen.queryByText('Configurações')).toBeNull()
})
```

- [ ] **Step 2: Rodar testes para confirmar falha**

```bash
npm test -- --testPathPattern="AppHeader" --no-coverage
```

Esperado: FAIL — `Cannot find module '../index'`

- [ ] **Step 3: Implementar `AppHeader`**

Criar `src/components/AppHeader/index.tsx`:

```tsx
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AppHeaderProps {
  onLogout?: () => void
}

export function AppHeader({ onLogout }: AppHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const isChatPage = pathname === '/chat'
  const isAdmin = user?.role && ['admin', 'admin_ppgec'].includes(user.role)

  function handleLogout() {
    if (onLogout) { onLogout(); return }
    document.cookie = 'access_token=; path=/; max-age=0'
    logout()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 h-16 bg-cream-card border-b border-mist shadow-sm flex items-center px-4 gap-3">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-owl-orange text-white px-4 py-2 rounded-btn z-50"
      >
        Ir para o conteúdo
      </a>

      <Image
        src="/ppgec-logo.png"
        alt="PPGEC UPE"
        height={36}
        width={120}
        className="object-contain"
        priority
      />
      <span className="font-bold text-ink text-lg">NeuroGuia</span>

      <nav className="ml-auto flex items-center gap-3 text-sm" aria-label="Navegação principal">
        {isChatPage ? (
          <>
            {isAdmin && (
              <>
                <Link href="/ingest" className="text-violet hover:underline">
                  Base de Conhecimento
                </Link>
                <Link href="/feedback" className="text-violet hover:underline">
                  Feedback
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link href="/config" className="text-violet hover:underline">
                Configurações
              </Link>
            )}
          </>
        ) : (
          <Link
            href="/chat"
            className="flex items-center gap-1 text-owl-orange font-semibold hover:text-owl-orange-dark"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Voltar ao Chat
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="text-slate-text hover:text-ink min-h-[44px] px-2"
        >
          Sair
        </button>
        {user && (
          <div
            aria-label={`Usuário: ${user.username}`}
            className="w-8 h-8 rounded-full bg-violet-soft text-violet flex items-center justify-center text-sm font-bold select-none"
          >
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
      </nav>
    </header>
  )
}
```

- [ ] **Step 4: Rodar testes para confirmar que passam**

```bash
npm test -- --testPathPattern="AppHeader" --no-coverage
```

Esperado: PASS — 6 testes

- [ ] **Step 5: Commit**

```bash
git add src/components/AppHeader/
git commit -m "feat(design): componente AppHeader global com navegação contextual"
```

> **Nota — mobile hamburger (follow-up):** A spec prevê que em telas `<640px` os links colapsem em menu hamburguer com `aria-expanded`/`aria-controls`. Essa feature não está neste plano para manter o escopo gerenciável. Implementar como task separada após a conclusão deste plano.

---

### Task 3: Tela de Login

**Files:**
- Modify: `src/app/login/page.tsx`

- [ ] **Step 1: Reescrever `src/app/login/page.tsx`**

```tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { OwlAvatar } from '@/components/OwlAvatar'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      const token = sessionStorage.getItem('access_token') ?? ''
      document.cookie = `access_token=${token}; path=/; SameSite=Strict`
      router.push('/chat')
    } catch {
      setError('Usuário ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #FFFBF4 0%, #EDE8F8 100%)' }}
    >
      <div className="bg-cream-card rounded-3xl shadow-xl px-8 py-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/ppgec-logo-circular.jpg"
            alt="PPGEC UPE"
            width={80}
            height={80}
            className="rounded-full mb-3"
            priority
          />
          <h1 className="text-2xl font-bold text-ink text-center">NeuroGuia</h1>
          <p className="text-sm text-slate-text text-center mt-1">
            Assistente para estudantes do PPGEC · UPE
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Usuário
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="rounded-2xl border border-mist px-5 py-3.5 text-base bg-cream min-h-[48px] focus-visible:border-owl-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-orange/30"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Senha
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="rounded-2xl border border-mist px-5 py-3.5 text-base bg-cream min-h-[48px] focus-visible:border-owl-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-orange/30"
            />
          </label>

          {error && (
            <p role="alert" className="flex items-center gap-2 text-sm text-error bg-error/10 rounded-xl px-4 py-2.5">
              <span aria-hidden="true">⚠️</span> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-owl-orange hover:bg-owl-orange-dark text-white rounded-2xl py-3.5 px-5 font-semibold disabled:opacity-60 transition-colors min-h-[48px] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                Entrando…
              </>
            ) : 'Entrar →'}
          </button>
        </form>
      </div>

      <div className="mt-4 pointer-events-none" aria-hidden="true">
        <OwlAvatar state="neutral" movement="idle" beakOpen={false} />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Rodar testes existentes**

```bash
npm test -- --no-coverage
```

Esperado: todos passam (login não tem testes unitários, mas os outros componentes não devem ser afetados).

- [ ] **Step 3: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "feat(design): redesign tela de login com card, logo PPGEC e OWL"
```

---

### Task 4: Tela de Chat — integração AppHeader e zona de palco

**Files:**
- Modify: `src/app/chat/page.tsx`

- [ ] **Step 1: Reescrever `src/app/chat/page.tsx`**

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useChat } from '@/hooks/useChat'
import { useSpeech } from '@/hooks/useSpeech'
import { AppHeader } from '@/components/AppHeader'
import { OwlAvatar } from '@/components/OwlAvatar'
import { ChatBubble } from '@/components/ChatBubble'
import { ChatInput } from '@/components/ChatInput'
import { EmotionControls } from '@/components/EmotionControls'
import { LgpdModal } from '@/components/LgpdModal'
import QuickReply from '@/components/QuickReply/QuickReply'
import { SessionRatingToast } from '@/components/SessionRatingToast'
import type { AvatarState } from '@/types/chat'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

const STAGE_COLORS: Record<AvatarState, string> = {
  neutral:     '#FEF0E0',
  happy:       '#FEF0E0',
  encouraging: '#EDE8F8',
  empathetic:  '#EDE8F8',
  thoughtful:  '#E4E0F0',
}

export default function ChatPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { messages, avatarState, movement, isLoading, quickReplies, sendMessage, setAvatarState, setMovement } = useChat()
  const { isListening, isSpeaking, transcript, supported, startListening, stopListening, speak, cancel } = useSpeech()
  const [beakOpen, setBeakOpen] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [showLgpdModal, setShowLgpdModal] = useState(false)
  const [lgpdAccepted, setLgpdAccepted] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const lastMsg = messages.at(-1)
    if (lastMsg?.role === 'assistant' && audioEnabled && lastMsg.content) {
      speak(lastMsg.content, () => {
        setBeakOpen(true)
        setTimeout(() => setBeakOpen(false), 120)
      })
    }
  }, [messages, audioEnabled, speak])

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (messages.length > 0) { setShowRating(true); e.preventDefault() }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [messages.length])

  function handleToggleListen() {
    if (!lgpdAccepted) { setShowLgpdModal(true); return }
    if (isListening) stopListening(); else startListening()
  }

  function handleToggleSpeak() {
    if (isSpeaking) { cancel(); return }
    setAudioEnabled(a => !a)
  }

  function handleSend(text: string) { cancel(); sendMessage(text) }

  function handleFeedback(messageId: string, rating: 'up' | 'down') {
    const msg = messages.find(m => m.id === messageId)
    if (!msg) return
    const tok = sessionStorage.getItem('access_token') ?? ''
    fetch(`${API}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
      body: JSON.stringify({
        type: 'message', message_id: messageId,
        question: messages.at(-2)?.content ?? '',
        answer: msg.content, sources: msg.sources ?? [], rating,
      }),
    }).catch(() => {})
  }

  function submitSessionRating(emoji: 'happy' | 'neutral' | 'sad') {
    const tok = sessionStorage.getItem('access_token') ?? ''
    fetch(`${API}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
      body: JSON.stringify({ type: 'session', emoji, message_count: messages.length }),
    }).catch(() => {})
    setShowRating(false)
  }

  function handleLogout() {
    if (messages.length > 0) { setShowRating(true); return }
    document.cookie = 'access_token=; path=/; max-age=0'
    logout()
    router.push('/login')
  }

  return (
    <>
      <AppHeader onLogout={handleLogout} />

      <div className="flex flex-col h-[calc(100vh-64px)] bg-cream">
        {/* Zona de palco OWL */}
        <div
          className="flex flex-col items-center pt-5 pb-3 shrink-0"
          style={{ backgroundColor: STAGE_COLORS[avatarState], transition: 'background-color 0.4s ease' }}
        >
          <OwlAvatar state={avatarState} movement={movement} beakOpen={beakOpen} />
          <EmotionControls
            visible={user?.role === 'admin'}
            avatarState={avatarState}
            movement={movement}
            onStateChange={setAvatarState}
            onMovementChange={setMovement}
          />
        </div>

        {/* Mensagens */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-4 py-4"
          aria-live="polite"
          aria-label="Conversa com OWL"
        >
          {messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} onFeedback={handleFeedback} />
          ))}
          {isLoading && (
            <div aria-label="Carregando resposta" className="flex gap-1 p-3">
              <span className="w-2 h-2 bg-owl-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-owl-orange rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-owl-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Quick replies + Input */}
        <div className="shrink-0">
          {quickReplies.length > 0 && (
            <QuickReply options={quickReplies} onSelect={handleSend} />
          )}
          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
            isListening={isListening}
            isSpeaking={isSpeaking || audioEnabled}
            speechSupported={supported}
            onToggleListen={handleToggleListen}
            onToggleSpeak={handleToggleSpeak}
            transcript={transcript}
          />
        </div>
      </div>

      {showLgpdModal && (
        <LgpdModal
          onAccept={() => { setLgpdAccepted(true); setShowLgpdModal(false); startListening() }}
          onDecline={() => setShowLgpdModal(false)}
        />
      )}
      {showRating && (
        <SessionRatingToast
          onRate={emoji => {
            submitSessionRating(emoji)
            document.cookie = 'access_token=; path=/; max-age=0'
            logout()
            router.push('/login')
          }}
          onDismiss={() => {
            setShowRating(false)
            document.cookie = 'access_token=; path=/; max-age=0'
            logout()
            router.push('/login')
          }}
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Rodar testes**

```bash
npm test -- --no-coverage
```

Esperado: todos passam.

- [ ] **Step 3: Commit**

```bash
git add src/app/chat/page.tsx
git commit -m "feat(design): chat page com AppHeader, zona de palco OWL e novos tokens"
```

---

### Task 5: ChatBubble

**Files:**
- Modify: `src/components/ChatBubble/ChatBubble.tsx`

- [ ] **Step 1: Rodar testes atuais para ter baseline**

```bash
npm test -- --testPathPattern="ChatBubble" --no-coverage
```

Esperado: PASS — 6 testes

- [ ] **Step 2: Reescrever `src/components/ChatBubble/ChatBubble.tsx`**

```tsx
'use client'
import { useState } from 'react'
import type { ChatMessage } from '@/types/chat'

interface Props {
  message: ChatMessage
  onFeedback: (messageId: string, rating: 'up' | 'down') => void
}

export function ChatBubble({ message, onFeedback }: Props) {
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const isAssistant = message.role === 'assistant'
  const hasSources = isAssistant && message.sources && message.sources.length > 0
  const sourceCount = message.sources?.length ?? 0

  return (
    <div className={`group flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-5 py-4 text-base leading-relaxed ${
          isAssistant
            ? 'bg-owl-orange-soft border-l-4 border-owl-orange rounded-tl-sm'
            : 'bg-violet-soft border-r-4 border-violet rounded-tr-sm'
        }`}
      >
        <p className="text-ink">{message.content}</p>

        {hasSources && (
          <div className="mt-2">
            <button
              onClick={() => setSourcesOpen(o => !o)}
              className="text-slate-text text-sm flex items-center gap-1 hover:text-owl-orange transition-colors"
              aria-expanded={sourcesOpen}
            >
              📄 {sourceCount} {sourceCount === 1 ? 'fonte' : 'fontes'} {sourcesOpen ? '▴' : '▾'}
            </button>
            {sourcesOpen && (
              <p className="text-sm text-slate-text mt-1">
                {message.sources!.join(' · ')}
              </p>
            )}
          </div>
        )}

        {isAssistant && (
          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              aria-label="Resposta útil"
              onClick={() => onFeedback(message.id, 'up')}
              className="text-lg hover:scale-110 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              👍
            </button>
            <button
              aria-label="Resposta não útil"
              onClick={() => onFeedback(message.id, 'down')}
              className="text-lg hover:scale-110 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              👎
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Rodar testes para confirmar que ainda passam**

```bash
npm test -- --testPathPattern="ChatBubble" --no-coverage
```

Esperado: PASS — 6 testes (comportamento não mudou, só estilos)

- [ ] **Step 4: Commit**

```bash
git add src/components/ChatBubble/ChatBubble.tsx
git commit -m "feat(design): ChatBubble com bordas coloridas owl-orange/violet"
```

---

### Task 6: ChatInput

**Files:**
- Modify: `src/components/ChatInput/index.tsx`

- [ ] **Step 1: Rodar testes atuais**

```bash
npm test -- --testPathPattern="ChatInput" --no-coverage
```

Esperado: PASS — 5 testes

- [ ] **Step 2: Reescrever `src/components/ChatInput/index.tsx`**

```tsx
'use client'
import { useState } from 'react'

interface Props {
  onSend: (text: string) => void
  disabled: boolean
  isListening: boolean
  isSpeaking: boolean
  speechSupported: boolean
  onToggleListen: () => void
  onToggleSpeak: () => void
  transcript?: string
}

export function ChatInput({
  onSend, disabled, isListening, isSpeaking,
  speechSupported, onToggleListen, onToggleSpeak, transcript = '',
}: Props) {
  const [text, setText] = useState('')
  const value = transcript || text

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    onSend(value.trim())
    setText('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 px-4 py-4 bg-cream-card border-t border-mist shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
    >
      {speechSupported && (
        <button
          type="button"
          aria-label={isListening ? 'Parar gravação' : 'Iniciar microfone'}
          onClick={onToggleListen}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
            isListening
              ? 'bg-error text-white animate-pulse'
              : 'bg-mist hover:bg-owl-orange-soft text-ink'
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="9" y="2" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
            <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <input
        type="text"
        value={value}
        onChange={e => setText(e.target.value)}
        placeholder="Digite ou fale sua dúvida…"
        disabled={disabled}
        className="flex-1 rounded-2xl border border-mist px-5 py-3.5 text-base bg-cream min-h-[48px] placeholder:text-slate-text/60 disabled:opacity-60 focus-visible:border-owl-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-orange/30"
        aria-label="Mensagem para o OWL"
      />

      {speechSupported && (
        <button
          type="button"
          aria-label={isSpeaking ? 'Silenciar OWL' : 'OWL falar em voz alta'}
          onClick={onToggleSpeak}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
            isSpeaking
              ? 'bg-owl-orange text-white'
              : 'bg-mist hover:bg-owl-orange-soft text-ink'
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Enviar mensagem"
        className="w-11 h-11 rounded-full bg-owl-orange hover:bg-owl-orange-dark text-white flex items-center justify-center disabled:opacity-50 transition-colors flex-shrink-0"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Rodar testes**

```bash
npm test -- --testPathPattern="ChatInput" --no-coverage
```

Esperado: PASS — 5 testes. Nota: o teste `botões de voz têm tamanho mínimo de 44px` continua passando porque os botões mantêm `w-11` (44px).

- [ ] **Step 4: Commit**

```bash
git add src/components/ChatInput/index.tsx
git commit -m "feat(design): ChatInput com ícones SVG, padding generoso e focus owl-orange"
```

---

### Task 7: QuickReply e EmotionControls

**Files:**
- Modify: `src/components/QuickReply/QuickReply.tsx`
- Modify: `src/components/EmotionControls/EmotionControls.tsx`

- [ ] **Step 1: Reescrever `src/components/QuickReply/QuickReply.tsx`**

```tsx
interface QuickReplyProps {
  options: string[]
  onSelect: (option: string) => void
}

export default function QuickReply({ options, onSelect }: QuickReplyProps) {
  if (options.length === 0) return null
  return (
    <div
      className="flex flex-wrap gap-2 px-4 pb-2 pt-1"
      role="group"
      aria-label="Opções rápidas de resposta"
    >
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="rounded-full border-[1.5px] border-owl-orange text-owl-orange bg-cream-card px-4 py-1.5 text-sm hover:bg-owl-orange hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-orange/50 min-h-[36px]"
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Reescrever `src/components/EmotionControls/EmotionControls.tsx`**

```tsx
import type { AvatarState, Movement } from '@/types/chat'

interface EmotionControlsProps {
  visible: boolean
  avatarState: AvatarState
  movement: Movement
  onStateChange: (state: AvatarState) => void
  onMovementChange: (movement: Movement) => void
}

const STATES: { value: AvatarState; label: string }[] = [
  { value: 'neutral',     label: 'Neutro' },
  { value: 'happy',       label: 'Feliz' },
  { value: 'encouraging', label: 'Encorajador' },
  { value: 'empathetic',  label: 'Empático' },
  { value: 'thoughtful',  label: 'Pensativo' },
]

const MOVEMENTS: { value: Movement; label: string }[] = [
  { value: 'idle',    label: 'Repouso' },
  { value: 'talking', label: 'Falando' },
  { value: 'thinking',label: 'Pensando' },
]

export function EmotionControls({ visible, avatarState, movement, onStateChange, onMovementChange }: EmotionControlsProps) {
  if (!visible) return null
  return (
    <div className="flex-shrink-0 border-y border-mist px-4 py-2 flex flex-col gap-1.5 w-full">
      <div className="flex items-center gap-2">
        <span className="flex-shrink-0 text-[10px] font-bold text-slate-text/60 uppercase tracking-widest w-12">
          Emoção
        </span>
        <div className="flex flex-wrap gap-1.5">
          {STATES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onStateChange(value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors min-h-[28px] ${
                avatarState === value
                  ? 'bg-owl-orange text-white border-owl-orange'
                  : 'text-owl-orange/80 border-owl-orange/30 hover:border-owl-orange/60 bg-owl-orange-soft/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex-shrink-0 text-[10px] font-bold text-slate-text/60 uppercase tracking-widest w-12">
          Mov.
        </span>
        <div className="flex flex-wrap gap-1.5">
          {MOVEMENTS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onMovementChange(value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors min-h-[28px] ${
                movement === value
                  ? 'bg-violet text-white border-violet'
                  : 'text-violet/80 border-violet/30 hover:border-violet/60 bg-violet-soft/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Rodar testes**

```bash
npm test -- --no-coverage
```

Esperado: todos passam.

- [ ] **Step 4: Commit**

```bash
git add src/components/QuickReply/QuickReply.tsx src/components/EmotionControls/EmotionControls.tsx
git commit -m "feat(design): QuickReply e EmotionControls com paleta owl-orange/violet"
```

---

### Task 8: SessionRatingToast e LgpdModal

**Files:**
- Modify: `src/components/SessionRatingToast/index.tsx`
- Modify: `src/components/LgpdModal/index.tsx`

- [ ] **Step 1: Reescrever `src/components/SessionRatingToast/index.tsx`**

```tsx
'use client'

interface Props {
  onRate: (emoji: 'happy' | 'neutral' | 'sad') => void
  onDismiss: () => void
}

const OPTIONS: { value: 'happy' | 'neutral' | 'sad'; label: string; emoji: string }[] = [
  { value: 'sad',     label: 'Insatisfeito', emoji: '😞' },
  { value: 'neutral', label: 'Neutro',       emoji: '😐' },
  { value: 'happy',   label: 'Satisfeito',   emoji: '😊' },
]

export function SessionRatingToast({ onRate, onDismiss }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-rating-title"
      className="fixed bottom-4 right-4 bg-cream-card rounded-2xl border border-mist shadow-xl p-5 z-50 max-w-xs"
    >
      <p id="session-rating-title" className="text-sm font-semibold text-ink mb-3">
        Como foi sua experiência?
      </p>
      <div className="flex justify-around mb-4">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            aria-label={opt.label}
            onClick={() => onRate(opt.value)}
            className="text-3xl hover:scale-125 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {opt.emoji}
          </button>
        ))}
      </div>
      <button
        onClick={onDismiss}
        className="text-xs text-slate-text hover:text-ink w-full text-center min-h-[36px]"
      >
        Pular
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Reescrever `src/components/LgpdModal/index.tsx`**

```tsx
'use client'
import { useEffect, useRef } from 'react'

interface Props {
  onAccept: () => void
  onDecline: () => void
}

export function LgpdModal({ onAccept, onDecline }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => { dialogRef.current?.showModal() }, [])

  return (
    <dialog
      ref={dialogRef}
      className="rounded-2xl p-6 max-w-sm w-full bg-cream-card shadow-xl border border-mist"
      aria-labelledby="lgpd-title"
    >
      <h2 id="lgpd-title" className="text-lg font-bold text-ink mb-3">Ativação de Microfone</h2>
      <p className="text-sm text-slate-text mb-4 leading-relaxed">
        O reconhecimento de voz usa a Web Speech API do Google. Seu áudio será enviado para servidores do Google para transcrição. Nenhum dado é armazenado pelo NeuroGuia.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onDecline}
          className="rounded-xl px-4 py-2.5 border border-mist text-ink hover:bg-mist/30 transition-colors min-h-[44px]"
        >
          Cancelar
        </button>
        <button
          onClick={onAccept}
          className="rounded-xl px-4 py-2.5 bg-owl-orange hover:bg-owl-orange-dark text-white transition-colors min-h-[44px] font-semibold"
        >
          Entendi e aceito
        </button>
      </div>
    </dialog>
  )
}
```

- [ ] **Step 3: Rodar testes**

```bash
npm test -- --no-coverage
```

Esperado: todos passam.

- [ ] **Step 4: Commit**

```bash
git add src/components/SessionRatingToast/index.tsx src/components/LgpdModal/index.tsx
git commit -m "feat(design): SessionRatingToast e LgpdModal com nova paleta"
```

---

### Task 9: Tela Ingest (Base de Conhecimento)

**Files:**
- Modify: `src/app/ingest/page.tsx`

- [ ] **Step 1: Reescrever `src/app/ingest/page.tsx`**

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { AppHeader } from '@/components/AppHeader'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
interface Doc { source: string; source_id: string }
function token() { return sessionStorage.getItem('access_token') ?? '' }

export default function IngestPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [uploading, setUploading] = useState(false)
  const [ingesting, setIngesting] = useState(false)
  const [progress, setProgress] = useState<string[]>([])
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function loadDocs() {
    const res = await fetch(`${API}/docs`, { headers: { Authorization: `Bearer ${token()}` } })
    if (res.ok) setDocs(await res.json())
  }

  useEffect(() => { loadDocs() }, [])

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return
    setUploading(true); setError('')
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API}/docs/upload`, {
        method: 'POST', headers: { Authorization: `Bearer ${token()}` }, body: form,
      })
      if (!res.ok) setError(`Erro ao enviar ${file.name}`)
    }
    setUploading(false)
  }

  async function handleIngest() {
    setIngesting(true); setProgress([])
    const res = await fetch(`${API}/docs/ingest`, {
      method: 'POST', headers: { Authorization: `Bearer ${token()}` },
    })
    if (!res.ok || !res.body) { setIngesting(false); return }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n'); buf = lines.pop() ?? ''
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: {}') {
          try { const d = JSON.parse(line.slice(6)); setProgress(p => [...p, `${d.file}: ${d.status}`]) } catch {}
        }
      }
    }
    setIngesting(false); loadDocs()
  }

  async function handleDelete(id: string) {
    await fetch(`${API}/docs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } })
    loadDocs()
  }

  return (
    <>
      <AppHeader />
      <main id="main-content" className="max-w-3xl mx-auto px-6 py-6">
        <h1 className="text-2xl font-bold text-ink mb-6 pl-4 border-l-4 border-owl-orange">
          Base de Conhecimento
        </h1>

        <section aria-label="Upload de documentos" className="bg-cream-card rounded-2xl border border-mist p-6 mb-6 shadow-sm">
          <p className="text-sm text-slate-text mb-3">Tipos aceitos: PDF, TXT, DOCX · Máximo 20 MB por arquivo</p>
          <div
            className="border-2 border-dashed border-mist rounded-2xl p-10 text-center cursor-pointer hover:border-owl-orange transition-colors flex flex-col items-center gap-3"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files) }}
            onClick={() => fileRef.current?.click()}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-slate-text">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-slate-text">Arraste arquivos aqui ou clique para selecionar</p>
            <input
              ref={fileRef} type="file" multiple accept=".pdf,.txt,.docx"
              className="sr-only" aria-label="Selecionar arquivos para upload"
              onChange={e => handleUpload(e.target.files)}
            />
          </div>
          {error && (
            <p role="alert" className="flex items-center gap-2 text-sm text-error bg-error/10 rounded-xl px-4 py-2.5 mt-2">
              <span aria-hidden="true">⚠️</span> {error}
            </p>
          )}
          {uploading && <p className="text-slate-text text-sm mt-2">Enviando…</p>}
          <button
            onClick={handleIngest}
            disabled={ingesting}
            className="mt-4 bg-owl-orange hover:bg-owl-orange-dark text-white rounded-2xl py-2.5 px-5 font-semibold disabled:opacity-60 transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <polygon points="5,3 19,12 5,21" fill="currentColor" />
            </svg>
            {ingesting ? 'Processando…' : 'Processar na base'}
          </button>
          {progress.length > 0 && (
            <ul className="mt-3 text-sm space-y-1" aria-label="Progresso de ingestão">
              {progress.map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-text">
                  <span className="text-success" aria-hidden="true">✓</span> {p}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Documentos ingeridos">
          <h2 className="text-lg font-semibold text-ink mb-3 pl-4 border-l-4 border-owl-orange">
            Documentos ({docs.length})
          </h2>
          {docs.length === 0
            ? <p className="text-slate-text text-sm">Nenhum documento na base.</p>
            : (
              <ul className="space-y-2">
                {docs.map(doc => (
                  <li key={doc.source_id} className="flex items-center justify-between bg-cream-card rounded-2xl border border-mist px-4 min-h-[52px]">
                    <span className="flex items-center gap-2 text-ink text-sm">
                      <span aria-hidden="true">📄</span> {doc.source}
                    </span>
                    <button
                      onClick={() => handleDelete(doc.source_id)}
                      aria-label={`Remover ${doc.source}`}
                      className="text-error hover:text-red-700 font-bold text-lg leading-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )
          }
        </section>
      </main>
    </>
  )
}
```

- [ ] **Step 2: Rodar testes**

```bash
npm test -- --no-coverage
```

Esperado: todos passam.

- [ ] **Step 3: Commit**

```bash
git add src/app/ingest/page.tsx
git commit -m "feat(design): redesign tela Ingest com AppHeader e layout admin"
```

---

### Task 10: Tela Feedback

**Files:**
- Modify: `src/app/feedback/page.tsx`

- [ ] **Step 1: Reescrever `src/app/feedback/page.tsx`**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/AppHeader'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
function token() { return sessionStorage.getItem('access_token') ?? '' }

interface FeedbackData {
  sessions: { emoji: string; message_count: number; timestamp: string }[]
  negative_messages: { question: string; answer: string; sources: string[]; timestamp: string }[]
  rag_gaps: { question: string; count: number }[]
}

export default function FeedbackPage() {
  const [data, setData] = useState<FeedbackData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API}/feedback`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json()).then(setData).catch(() => setError('Erro ao carregar feedback'))
  }, [])

  async function handleExport() {
    const res = await fetch(`${API}/feedback/export`, { headers: { Authorization: `Bearer ${token()}` } })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'feedback.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (error) return <><AppHeader /><main className="p-6 text-error">{error}</main></>
  if (!data) return <><AppHeader /><main className="p-6 text-slate-text">Carregando…</main></>

  const emojiCount = { happy: 0, neutral: 0, sad: 0 }
  for (const s of data.sessions) emojiCount[s.emoji as keyof typeof emojiCount]++

  return (
    <>
      <AppHeader />
      <main id="main-content" className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-ink pl-4 border-l-4 border-owl-orange">Feedback</h1>
          <button
            onClick={handleExport}
            className="border-[1.5px] border-owl-orange text-owl-orange hover:bg-owl-orange hover:text-white rounded-2xl py-2 px-4 text-sm font-semibold transition-colors min-h-[44px]"
          >
            Exportar CSV
          </button>
        </div>

        <section aria-label="Satisfação das sessões" className="bg-cream-card rounded-2xl border border-mist p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink mb-4">Satisfação ({data.sessions.length} sessões)</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji: '😊', label: 'Satisfeito',   count: emojiCount.happy,   bg: 'bg-success/10' },
              { emoji: '😐', label: 'Neutro',        count: emojiCount.neutral, bg: 'bg-owl-orange/10' },
              { emoji: '😞', label: 'Insatisfeito',  count: emojiCount.sad,     bg: 'bg-error/10' },
            ].map(({ emoji, label, count, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-4 flex flex-col items-center gap-1`}>
                <span className="text-3xl" aria-hidden="true">{emoji}</span>
                <span className="text-2xl font-bold text-ink">{count}</span>
                <span className="text-xs text-slate-text">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Respostas com avaliação negativa" className="bg-cream-card rounded-2xl border border-mist p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink mb-3">Respostas 👎 ({data.negative_messages.length})</h2>
          {data.negative_messages.length === 0
            ? <p className="text-slate-text text-sm">Nenhuma avaliação negativa ainda.</p>
            : (
              <ul className="space-y-3">
                {data.negative_messages.map((m, i) => (
                  <li key={i} className="border-l-4 border-error bg-error/5 rounded-r-xl pl-4 pr-3 py-3">
                    <p className="text-sm font-semibold text-ink">P: {m.question}</p>
                    <p className="text-sm text-slate-text mt-1">R: {m.answer}</p>
                    <p className="text-xs text-slate-text/60 mt-1">{m.sources.join(', ')}</p>
                  </li>
                ))}
              </ul>
            )
          }
        </section>

        <section aria-label="Lacunas no RAG" className="bg-cream-card rounded-2xl border border-mist p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink mb-3">Lacunas RAG (sem fonte identificada)</h2>
          {data.rag_gaps.length === 0
            ? <p className="text-slate-text text-sm">Nenhuma lacuna registrada.</p>
            : (
              <ul className="space-y-2">
                {data.rag_gaps.map((g, i) => (
                  <li key={i} className="flex items-center justify-between border-t border-mist pt-2">
                    <span className="text-sm text-ink">{g.question}</span>
                    <span className="text-sm font-bold text-owl-orange-dark bg-owl-orange-soft rounded-full px-2 py-0.5">
                      {g.count}×
                    </span>
                  </li>
                ))}
              </ul>
            )
          }
        </section>
      </main>
    </>
  )
}
```

- [ ] **Step 2: Rodar testes**

```bash
npm test -- --no-coverage
```

Esperado: todos passam.

- [ ] **Step 3: Commit**

```bash
git add src/app/feedback/page.tsx
git commit -m "feat(design): redesign tela Feedback com cards de satisfação coloridos"
```

---

### Task 11: Tela Config

**Files:**
- Modify: `src/app/config/page.tsx`

- [ ] **Step 1: Reescrever `src/app/config/page.tsx`**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/AppHeader'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const PROVIDERS = ['anthropic', 'openai', 'google'] as const
function token() { return sessionStorage.getItem('access_token') ?? '' }

export default function ConfigPage() {
  const [cfg, setCfg] = useState({
    system_prompt: '', llm_provider: 'anthropic', llm_model: '',
    embed_provider: 'openai', embed_model: '',
    anthropic_api_key: '', openai_api_key: '', google_api_key: '',
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API}/config`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json()).then(setCfg).catch(() => setError('Erro ao carregar configurações'))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSaved(false)
    const res = await fetch(`${API}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({
        system_prompt: cfg.system_prompt,
        llm_provider: cfg.llm_provider, llm_model: cfg.llm_model,
        embed_provider: cfg.embed_provider, embed_model: cfg.embed_model,
      }),
    })
    if (res.ok) setSaved(true); else setError('Erro ao salvar')
  }

  const fieldClass = 'rounded-xl border border-mist px-4 py-3 bg-cream min-h-[48px] focus-visible:border-owl-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-orange/30'

  return (
    <>
      <AppHeader />
      <main id="main-content" className="max-w-2xl mx-auto px-6 py-6">
        <h1 className="text-2xl font-bold text-ink mb-6 pl-4 border-l-4 border-owl-orange">Configurações</h1>
        <form onSubmit={handleSave} className="flex flex-col gap-5">

          <div className="bg-cream-card rounded-2xl border border-mist p-6 shadow-sm">
            <label className="flex flex-col gap-1 text-sm font-medium text-ink">
              System Prompt do OWL
              <textarea
                rows={10}
                value={cfg.system_prompt}
                onChange={e => setCfg(c => ({ ...c, system_prompt: e.target.value }))}
                className="rounded-2xl border border-mist px-5 py-3.5 text-sm bg-cream font-mono focus-visible:border-owl-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-orange/30"
              />
            </label>
          </div>

          <div className="bg-cream-card rounded-2xl border border-mist p-6 shadow-sm">
            <h2 className="text-base font-semibold text-ink mb-4">Modelo de Linguagem</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                Provedor LLM
                <select value={cfg.llm_provider}
                  onChange={e => setCfg(c => ({ ...c, llm_provider: e.target.value }))}
                  className={fieldClass}>
                  {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                Modelo LLM
                <input type="text" value={cfg.llm_model}
                  onChange={e => setCfg(c => ({ ...c, llm_model: e.target.value }))}
                  className={fieldClass} />
              </label>
            </div>
          </div>

          <div className="bg-cream-card rounded-2xl border border-mist p-6 shadow-sm">
            <h2 className="text-base font-semibold text-ink mb-4">Embeddings</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                Provedor Embeddings
                <select value={cfg.embed_provider}
                  onChange={e => setCfg(c => ({ ...c, embed_provider: e.target.value }))}
                  className={fieldClass}>
                  {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                Modelo Embeddings
                <input type="text" value={cfg.embed_model}
                  onChange={e => setCfg(c => ({ ...c, embed_model: e.target.value }))}
                  className={fieldClass} />
              </label>
            </div>
          </div>

          <div className="bg-violet-soft rounded-2xl border border-violet/20 p-5">
            <p className="text-sm font-semibold text-ink mb-2 flex items-center gap-2">
              <span aria-hidden="true">🔒</span> Chaves de API (somente leitura)
            </p>
            {[['Anthropic', cfg.anthropic_api_key], ['OpenAI', cfg.openai_api_key], ['Google', cfg.google_api_key]].map(([name, val]) => (
              <p key={name} className="text-sm text-slate-text">{name}: <code className="font-mono text-xs">{val || '—'}</code></p>
            ))}
            <p className="text-xs text-slate-text/60 mt-1">Para alterar chaves, edite o arquivo backend/.env</p>
          </div>

          {error && (
            <p role="alert" className="flex items-center gap-2 text-sm text-error bg-error/10 rounded-xl px-4 py-2.5">
              <span aria-hidden="true">⚠️</span> {error}
            </p>
          )}
          {saved && (
            <p role="status" className="flex items-center gap-2 text-sm text-success bg-success/10 rounded-xl px-4 py-2.5">
              <span aria-hidden="true">✓</span> Configurações salvas com sucesso.
            </p>
          )}

          <button type="submit"
            className="bg-owl-orange hover:bg-owl-orange-dark text-white rounded-2xl py-2.5 px-5 font-semibold self-start transition-colors min-h-[44px]">
            Salvar
          </button>
        </form>
      </main>
    </>
  )
}
```

- [ ] **Step 2: Rodar todos os testes finais**

```bash
npm test -- --no-coverage
npm run lint
npm run build
```

Esperado: todos os testes passam, lint limpo, build sem erros.

- [ ] **Step 3: Commit final**

```bash
git add src/app/config/page.tsx
git commit -m "feat(design): redesign tela Config com AppHeader e cards organizados"
```
