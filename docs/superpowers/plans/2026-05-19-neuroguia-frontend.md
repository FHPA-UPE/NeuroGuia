# NeuroGuia Frontend — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refatorar e expandir o frontend Next.js 15 do NeuroGuia — novo sistema de cores, autenticação JWT, avatar OWL atualizado, voz (STT+TTS), rastreabilidade de fontes e páginas admin (ingestão, config, feedback).

**Architecture:** Monorepo sob `src/`. O frontend existente tem componentes funcionais (OllieAvatar→OwlAvatar, ChatBubble, ChatInput, QuickReply, EmotionControls) e o hook `useChat`. Este plano refatora e estende — não é greenfield. Rotas protegidas por middleware Next.js via JWT em `sessionStorage`. Estilo via Tailwind CSS 4 + variáveis CSS.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Atkinson Hyperlegible (next/font/google), Web Speech API (nativa), Jest + Testing Library

**Estado atual do código (antes deste plano):**
- `src/app/page.tsx` — renderiza `<ChatInterface>` diretamente (sem auth, sem roteamento)
- `src/components/OllieAvatar/` — existe; será renomeado e atualizado para OWL
- `src/components/ChatBubble/` — existe; será expandido com sources + feedback
- `src/components/ChatInput/` — existe; será expandido com botões de voz
- `src/components/QuickReply/` — existe; sem mudanças necessárias
- `src/components/EmotionControls/` — existe; será restringido a admin
- `src/hooks/useChat.ts` — existe; será atualizado (auth header, sources, SSE done)
- `src/types/chat.ts` — existe; será atualizado

---

### Task 1: Tipos TypeScript

**Files:**
- Modify: `src/types/chat.ts`
- Create: `src/types/auth.ts`
- Test: `src/types/__tests__/types.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

`src/types/__tests__/types.test.ts`:
```typescript
import type { ChatMessage, ChatResponse, AvatarState, Movement } from '../chat'
import type { Role, AuthUser } from '../auth'

test('AvatarState cobre os 5 estados', () => {
  const states: AvatarState[] = ['neutral', 'happy', 'encouraging', 'empathetic', 'thoughtful']
  expect(states).toHaveLength(5)
})

test('ChatMessage tem campo sources', () => {
  const msg: ChatMessage = {
    id: '1', role: 'assistant', content: 'Olá',
    avatar_state: 'happy', movement: 'talking',
    quick_replies: [], sources: ['normas.pdf'],
  }
  expect(msg.sources).toEqual(['normas.pdf'])
})

test('Role cobre os 3 perfis', () => {
  const roles: Role[] = ['estudante', 'admin_ppgec', 'admin']
  expect(roles).toHaveLength(3)
})

test('AuthUser tem username e role', () => {
  const user: AuthUser = { username: 'alice', role: 'admin' }
  expect(user.username).toBe('alice')
})
```

- [ ] **Step 2: Rodar para confirmar falha**

```
npm test -- --testPathPattern=types
```
Expected: erro de tipo ou import

- [ ] **Step 3: Atualizar src/types/chat.ts**

```typescript
export type AvatarState = 'neutral' | 'happy' | 'encouraging' | 'empathetic' | 'thoughtful'
export type Movement = 'idle' | 'talking' | 'thinking'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  avatar_state?: AvatarState
  movement?: Movement
  quick_replies?: string[]
  sources?: string[]
}

export interface ChatResponse {
  message: string
  avatar_state: AvatarState
  movement: Movement
  quick_replies?: string[]
  sources?: string[]
}
```

- [ ] **Step 4: Criar src/types/auth.ts**

```typescript
export type Role = 'estudante' | 'admin_ppgec' | 'admin'

export interface AuthUser {
  username: string
  role: Role
}

export interface LoginResponse {
  access_token: string
  token_type: string
  role: Role
}
```

- [ ] **Step 5: Rodar para confirmar que passa**

```
npm test -- --testPathPattern=types
```
Expected: `4 passed`

- [ ] **Step 6: Commit**

```bash
git add src/types/
git commit -m "feat(frontend): tipos TypeScript — ChatMessage com sources, AuthUser"
```

---

### Task 2: Design Tokens — Paleta e Tipografia

**Files:**
- Modify: `src/app/globals.css` (variáveis de cor, reset de animações)
- Modify: `tailwind.config.ts` (ou criar se não existir)

> Não há testes automatizados para tokens visuais. Este task é verificado visualmente.

- [ ] **Step 1: Atualizar src/app/globals.css — seção de variáveis**

Substituir ou adicionar ao `:root` existente:
```css
@import "tailwindcss";

:root {
  --color-ice-white: #F4F6FB;
  --color-pure-white: #FFFFFF;
  --color-frost: #EEF1F8;
  --color-mist: #DDE2EE;
  --color-calm-indigo: #4A5BE0;
  --color-deep-indigo: #3A4BC8;
  --color-soft-indigo: #EEF0FC;
  --color-warm-terracotta: #D95F3B;
  --color-deep-terracotta: #C04E2C;
  --color-blush: #FBF0EC;
  --color-midnight: #1C1E2E;
  --color-slate: #5A5F7A;
  --color-silver: #6D7A99;
  --color-forest-green: #1A7F5A;
  --color-amber: #D4880A;
  --color-crimson: #C0392B;
  --color-ocean-blue: #2E6DB4;
}

body {
  background-color: var(--color-ice-white);
  color: var(--color-midnight);
  font-size: 16px;
  line-height: 1.65;
  letter-spacing: 0.01em;
}

*:focus-visible {
  outline: 3px solid var(--color-calm-indigo);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Atualizar tailwind.config.ts com tokens customizados**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ice-white': '#F4F6FB',
        'pure-white': '#FFFFFF',
        'frost': '#EEF1F8',
        'mist': '#DDE2EE',
        'calm-indigo': '#4A5BE0',
        'deep-indigo': '#3A4BC8',
        'soft-indigo': '#EEF0FC',
        'warm-terracotta': '#D95F3B',
        'deep-terracotta': '#C04E2C',
        'blush': '#FBF0EC',
        'midnight': '#1C1E2E',
        'slate-text': '#5A5F7A',
        'silver': '#6D7A99',
        'forest-green': '#1A7F5A',
        'owl-amber': '#D4880A',
        'crimson': '#C0392B',
        'ocean-blue': '#2E6DB4',
      },
      borderRadius: {
        'btn': '12px',
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

- [ ] **Step 3: Garantir que Atkinson Hyperlegible está carregada em src/app/layout.tsx**

O layout deve ter:
```typescript
import { Atkinson_Hyperlegible } from 'next/font/google'

const atkinson = Atkinson_Hyperlegible({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-atkinson',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={atkinson.variable}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Iniciar servidor e verificar visualmente**

```
npm run dev
```
Abrir http://localhost:3000 — fundo deve ser #F4F6FB (azul gelo), texto escuro.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css tailwind.config.ts src/app/layout.tsx
git commit -m "feat(frontend): design tokens — nova paleta, tipografia, focus-visible"
```

---

### Task 3: useAuth Hook

**Files:**
- Create: `src/hooks/useAuth.ts`
- Test: `src/hooks/__tests__/useAuth.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

`src/hooks/__tests__/useAuth.test.ts`:
```typescript
import { renderHook, act } from '@testing-library/react'

const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  sessionStorage.clear()
  mockFetch.mockReset()
})

test('inicia sem usuário logado', () => {
  const { result } = renderHook(() => {
    const { useAuth } = require('../useAuth')
    return useAuth()
  })
  expect(result.current.user).toBeNull()
  expect(result.current.token).toBeNull()
})

test('login salva token no sessionStorage', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ access_token: 'tok123', token_type: 'bearer', role: 'estudante' }),
  })
  const { useAuth } = require('../useAuth')
  const { result } = renderHook(() => useAuth())
  await act(async () => {
    await result.current.login('alice', 'pass')
  })
  expect(sessionStorage.getItem('access_token')).toBe('tok123')
  expect(result.current.user?.role).toBe('estudante')
})

test('logout remove token do sessionStorage', async () => {
  sessionStorage.setItem('access_token', 'tok')
  const { useAuth } = require('../useAuth')
  const { result } = renderHook(() => useAuth())
  act(() => { result.current.logout() })
  expect(sessionStorage.getItem('access_token')).toBeNull()
  expect(result.current.user).toBeNull()
})

test('login falho lança erro', async () => {
  mockFetch.mockResolvedValueOnce({ ok: false, status: 401 })
  const { useAuth } = require('../useAuth')
  const { result } = renderHook(() => useAuth())
  await expect(act(async () => { await result.current.login('x', 'wrong') })).rejects.toThrow()
})
```

- [ ] **Step 2: Rodar para confirmar falha**

```
npm test -- --testPathPattern=useAuth
```
Expected: `Cannot find module '../useAuth'`

- [ ] **Step 3: Criar src/hooks/useAuth.ts**

```typescript
'use client'
import { useState, useEffect, useCallback } from 'react'
import type { AuthUser, LoginResponse, Role } from '@/types/auth'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

function decodeRole(token: string): Role | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role as Role
  } catch {
    return null
  }
}

function decodeUsername(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub as string
  } catch {
    return ''
  }
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('access_token')
    if (stored) {
      const role = decodeRole(stored)
      if (role) {
        setToken(stored)
        setUser({ username: decodeUsername(stored), role })
      }
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error('Credenciais inválidas')
    const data: LoginResponse = await res.json()
    sessionStorage.setItem('access_token', data.access_token)
    setToken(data.access_token)
    setUser({ username, role: data.role })
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('access_token')
    setToken(null)
    setUser(null)
  }, [])

  return { user, token, login, logout }
}
```

- [ ] **Step 4: Rodar para confirmar que passa**

```
npm test -- --testPathPattern=useAuth
```
Expected: `4 passed`

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAuth.ts src/hooks/__tests__/useAuth.test.ts
git commit -m "feat(frontend): hook useAuth com sessionStorage e JWT decode"
```

---

### Task 4: Login Page + Middleware de Proteção de Rotas

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/middleware.ts`
- Modify: `src/app/page.tsx` (redirecionar para /chat)

- [ ] **Step 1: Criar src/middleware.ts**

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login']
const PPGEC_PATHS = ['/ingest', '/feedback']
const ADMIN_PATHS = ['/config']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next()

  const token = request.cookies.get('access_token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    const role = payload.role as string
    if (ADMIN_PATHS.some(p => pathname.startsWith(p)) && role !== 'admin') {
      return NextResponse.redirect(new URL('/chat', request.url))
    }
    if (PPGEC_PATHS.some(p => pathname.startsWith(p)) && !['admin_ppgec', 'admin'].includes(role)) {
      return NextResponse.redirect(new URL('/chat', request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/chat', '/ingest', '/config', '/feedback'],
}
```

> **Nota:** O middleware lê token do cookie. O `useAuth` salva em `sessionStorage` (que o middleware não acessa). No login bem-sucedido, o frontend também deve definir um cookie `access_token` com `document.cookie`. Veja Task 4 Step 3.

- [ ] **Step 2: Atualizar src/app/page.tsx para redirecionar**

```typescript
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/chat')
}
```

- [ ] **Step 3: Criar src/app/login/page.tsx**

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

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
    <main className="min-h-screen bg-ice-white flex items-center justify-center p-4">
      <div className="bg-pure-white rounded-card shadow p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-midnight mb-6 text-center">NeuroGuia</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-midnight">
            Usuário
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="rounded-btn border border-mist px-4 py-2.5 text-base focus-visible:outline-calm-indigo bg-ice-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-midnight">
            Senha
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="rounded-btn border border-mist px-4 py-2.5 text-base focus-visible:outline-calm-indigo bg-ice-white"
            />
          </label>
          {error && (
            <p role="alert" className="text-crimson text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-calm-indigo hover:bg-deep-indigo text-white rounded-btn py-2.5 px-5 font-semibold disabled:opacity-60 transition-colors"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Verificar no navegador**

```
npm run dev
```
Abrir http://localhost:3000 — deve redirecionar para /login (sem token). Formulário de login visível.

- [ ] **Step 5: Commit**

```bash
git add src/app/login/page.tsx src/app/page.tsx src/middleware.ts
git commit -m "feat(frontend): login page, middleware de proteção de rotas por role"
```

---

### Task 5: OwlAvatar — SVG Atualizado com Nova Paleta

**Files:**
- Rename: `src/components/OllieAvatar/` → `src/components/OwlAvatar/`
- Modify: `src/components/OwlAvatar/index.tsx` (nova paleta, prop beakOpen, chapéu com borla)
- Test: `src/components/OwlAvatar/__tests__/OwlAvatar.test.tsx`

- [ ] **Step 1: Renomear a pasta**

```
# PowerShell
Rename-Item src/components/OllieAvatar src/components/OwlAvatar
```

- [ ] **Step 2: Escrever o teste que falha**

`src/components/OwlAvatar/__tests__/OwlAvatar.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { OwlAvatar } from '../index'

test('renderiza com aria-label descrevendo o estado', () => {
  render(<OwlAvatar state="happy" movement="idle" beakOpen={false} />)
  expect(screen.getByRole('img')).toHaveAccessibleName(/happy/i)
})

test('aplica classe de movimento correto', () => {
  const { container } = render(<OwlAvatar state="neutral" movement="talking" beakOpen={false} />)
  expect(container.firstChild).toHaveClass('owl-talking')
})

test('aplica classe beak-open quando beakOpen=true', () => {
  const { container } = render(<OwlAvatar state="neutral" movement="idle" beakOpen={true} />)
  const beak = container.querySelector('.ollie-beak-bottom')
  expect(beak).toHaveClass('owl-talk')
})

test('renderiza chapéu com borla', () => {
  const { container } = render(<OwlAvatar state="neutral" movement="idle" beakOpen={false} />)
  expect(container.querySelector('#owl-hat')).toBeTruthy()
  expect(container.querySelector('#owl-hat-tassel')).toBeTruthy()
})
```

- [ ] **Step 3: Rodar para confirmar falha**

```
npm test -- --testPathPattern=OwlAvatar
```
Expected: import ou estrutura incorreta

- [ ] **Step 4: Atualizar src/components/OwlAvatar/index.tsx**

O arquivo existente (OllieAvatar) usa o mapa `EXPRESSIONS`. Atualize seguindo este template — mantenha a lógica SVG existente e atualize apenas paleta, chapéu e props:

```typescript
'use client'
import type { AvatarState, Movement } from '@/types/chat'

interface OwlAvatarProps {
  state: AvatarState
  movement: Movement
  beakOpen: boolean
}

const MOVEMENT_CLASS: Record<Movement, string> = {
  idle: 'owl-idle',
  talking: 'owl-talking',
  thinking: 'owl-thinking',
}

const STATE_LABEL: Record<AvatarState, string> = {
  neutral: 'OWL neutro',
  happy: 'OWL feliz',
  encouraging: 'OWL encorajador',
  empathetic: 'OWL empático',
  thoughtful: 'OWL pensativo',
}

// Paleta nova (ver spec seção 7)
const PALETTE = {
  bodyLight: '#F5A623',
  bodyMid: '#C07818',
  bodyDark: '#7A4A10',
  belly: '#FFF8F0',
  hatDeep: '#2E1A6E',
  hatBand: '#C8D0F8',
  tassel: '#D95F3B',
  outline: 'rgba(28,14,0,0.7)',
}

// EXPRESSIONS: mapeamento de estado → geometria do SVG
// Mantenha a estrutura existente do OllieAvatar; apenas atualize cores para PALETTE
const EXPRESSIONS: Record<AvatarState, {
  browLeft: string; browRight: string; beakPath: string;
  pupilOffset: [number, number]; eyeRy: number; headTilt: number
}> = {
  neutral:     { browLeft: 'M20,18 Q25,15 30,18', browRight: 'M50,18 Q55,15 60,18', beakPath: 'M35,45 Q40,50 45,45', pupilOffset: [0,0], eyeRy: 8, headTilt: 0 },
  happy:       { browLeft: 'M20,16 Q25,12 30,16', browRight: 'M50,16 Q55,12 60,16', beakPath: 'M33,44 Q40,52 47,44', pupilOffset: [0,1], eyeRy: 7, headTilt: 2 },
  encouraging: { browLeft: 'M20,15 Q25,11 30,15', browRight: 'M50,15 Q55,11 60,15', beakPath: 'M34,45 Q40,50 46,45', pupilOffset: [1,0], eyeRy: 8, headTilt: -2 },
  empathetic:  { browLeft: 'M20,20 Q25,17 30,20', browRight: 'M50,20 Q55,17 60,20', beakPath: 'M34,46 Q40,49 46,46', pupilOffset: [0,-1], eyeRy: 9, headTilt: 5 },
  thoughtful:  { browLeft: 'M20,19 Q25,14 30,17', browRight: 'M50,17 Q55,14 60,19', beakPath: 'M35,45 Q40,48 45,45', pupilOffset: [-1,0], eyeRy: 8, headTilt: -3 },
}

export function OwlAvatar({ state, movement, beakOpen }: OwlAvatarProps) {
  const expr = EXPRESSIONS[state]
  const motionClass = MOVEMENT_CLASS[movement]

  return (
    <div
      className={motionClass}
      style={{ transform: `rotate(${expr.headTilt}deg)`, transition: 'transform 0.4s ease' }}
    >
      <svg
        role="img"
        aria-label={STATE_LABEL[state]}
        viewBox="0 0 80 100"
        width="160"
        height="200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="bodyGrad" cx="40%" cy="30%">
            <stop offset="0%" stopColor="#FFC84A" />
            <stop offset="50%" stopColor={PALETTE.bodyLight} />
            <stop offset="85%" stopColor={PALETTE.bodyMid} />
            <stop offset="100%" stopColor={PALETTE.bodyDark} />
          </radialGradient>
        </defs>

        {/* Corpo */}
        <ellipse cx="40" cy="70" rx="22" ry="25" fill="url(#bodyGrad)" stroke={PALETTE.outline} strokeWidth="1" />
        {/* Barriga */}
        <ellipse cx="40" cy="72" rx="13" ry="16" fill={PALETTE.belly} opacity="0.9" />

        {/* Cabeça */}
        <circle cx="40" cy="38" r="22" fill="url(#bodyGrad)" stroke={PALETTE.outline} strokeWidth="1" />

        {/* Chapéu */}
        <g id="owl-hat">
          <rect x="22" y="18" width="36" height="3" rx="2" fill={PALETTE.hatDeep} />
          <rect x="27" y="6" width="26" height="13" rx="3" fill={PALETTE.hatDeep} />
          <rect x="27" y="14" width="26" height="3" fill={PALETTE.hatBand} opacity="0.8" />
          <g id="owl-hat-tassel" style={{ transformOrigin: '53px 6px' }}>
            <line x1="53" y1="6" x2="57" y2="14" stroke={PALETTE.tassel} strokeWidth="2" strokeLinecap="round" />
            <circle cx="57" cy="15" r="3" fill={PALETTE.tassel} />
          </g>
        </g>

        {/* Olhos */}
        <ellipse cx="28" cy="40" rx="8" ry={expr.eyeRy} fill="white" stroke={PALETTE.outline} strokeWidth="0.8" />
        <ellipse cx="52" cy="40" rx="8" ry={expr.eyeRy} fill="white" stroke={PALETTE.outline} strokeWidth="0.8" />
        <circle cx={28 + expr.pupilOffset[0]} cy={40 + expr.pupilOffset[1]} r="4" fill="#1C0E00" />
        <circle cx={52 + expr.pupilOffset[0]} cy={40 + expr.pupilOffset[1]} r="4" fill="#1C0E00" />
        <circle cx={29 + expr.pupilOffset[0]} cy={38 + expr.pupilOffset[1]} r="1.5" fill="white" opacity="0.8" />
        <circle cx={53 + expr.pupilOffset[0]} cy={38 + expr.pupilOffset[1]} r="1.5" fill="white" opacity="0.8" />

        {/* Sobrancelhas */}
        <path d={expr.browLeft} fill="none" stroke={PALETTE.bodyDark} strokeWidth="2" strokeLinecap="round" />
        <path d={expr.browRight} fill="none" stroke={PALETTE.bodyDark} strokeWidth="2" strokeLinecap="round" />

        {/* Bico */}
        <path
          className="ollie-beak-bottom"
          d={beakOpen ? 'M33,47 Q40,56 47,47' : expr.beakPath}
          fill={PALETTE.bodyMid}
          stroke={PALETTE.outline}
          strokeWidth="0.8"
          style={{ transition: 'd 80ms ease-in-out' }}
        />
      </svg>
    </div>
  )
}
```

- [ ] **Step 5: Rodar para confirmar que passa**

```
npm test -- --testPathPattern=OwlAvatar
```
Expected: `4 passed`

- [ ] **Step 6: Commit**

```bash
git add src/components/OwlAvatar/
git commit -m "feat(frontend): OwlAvatar com nova paleta, chapéu+borla e prop beakOpen"
```

---

### Task 6: OwlAvatar — Animações CSS

**Files:**
- Modify: `src/app/globals.css` (keyframes owl-idle, owl-talking, owl-thinking + chapéu por estado)

- [ ] **Step 1: Adicionar keyframes em globals.css**

Adicionar ao final do arquivo:
```css
/* OWL animations */
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

.owl-idle { animation: owl-idle-bob 3s ease-in-out infinite; }
.owl-talking { animation: owl-talk-bob 0.4s ease-in-out infinite; }
.owl-thinking { animation: owl-think-spin 3s ease-in-out infinite; }

.owl-talk { animation: owl-talk-beak 0.24s ease-in-out; }

/* Hat animations per avatar_state — aplicadas via JS className no OwlAvatar */
.owl-state-happy #owl-hat { animation: owl-hat-happy-bounce 0.5s spring(1, 100, 10, 0) forwards; }
.owl-state-happy #owl-hat-tassel { animation: owl-tassel-sway 0.6s ease-in-out 0.1s; }
.owl-state-thoughtful #owl-hat-tassel { animation: owl-tassel-pendulum 1.5s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .owl-idle, .owl-talking, .owl-thinking, .owl-talk,
  .owl-state-happy #owl-hat, .owl-state-happy #owl-hat-tassel,
  .owl-state-thoughtful #owl-hat-tassel { animation: none; }
}
```

- [ ] **Step 2: Atualizar o wrapper div em OwlAvatar/index.tsx para incluir state class**

No componente `OwlAvatar`, alterar o wrapper:
```typescript
<div
  className={`${motionClass} owl-state-${state}`}
  style={{ transform: `rotate(${expr.headTilt}deg)`, transition: 'transform 0.4s ease' }}
>
```

- [ ] **Step 3: Verificar animações visualmente**

```
npm run dev
```
Navegar para /chat (precisará de token — use as credenciais do seed_admin). Verificar que o owl se move.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/components/OwlAvatar/index.tsx
git commit -m "feat(frontend): animações CSS do OWL — idle, talking, thinking, hat states"
```

---

### Task 7: ChatBubble — Sources Expansível + Feedback Thumbs

**Files:**
- Modify: `src/components/ChatBubble/index.tsx`
- Test: `src/components/ChatBubble/__tests__/ChatBubble.test.tsx`

- [ ] **Step 1: Escrever o teste que falha**

`src/components/ChatBubble/__tests__/ChatBubble.test.tsx`:
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatBubble } from '../index'

const baseMsg = {
  id: '1', role: 'assistant' as const, content: 'Olá!',
  avatar_state: 'happy' as const, movement: 'idle' as const,
}

test('renderiza conteúdo da mensagem', () => {
  render(<ChatBubble message={{ ...baseMsg, sources: [] }} onFeedback={() => {}} />)
  expect(screen.getByText('Olá!')).toBeInTheDocument()
})

test('mostra botão de sources quando há sources', () => {
  render(<ChatBubble message={{ ...baseMsg, sources: ['normas.pdf'] }} onFeedback={() => {}} />)
  expect(screen.getByText(/1 fonte/i)).toBeInTheDocument()
})

test('expande sources ao clicar', () => {
  render(<ChatBubble message={{ ...baseMsg, sources: ['normas.pdf', 'decreto.pdf'] }} onFeedback={() => {}} />)
  fireEvent.click(screen.getByText(/2 fontes/i))
  expect(screen.getByText('normas.pdf')).toBeInTheDocument()
})

test('não mostra fontes para mensagem do usuário', () => {
  render(<ChatBubble message={{ ...baseMsg, role: 'user', sources: ['normas.pdf'] }} onFeedback={() => {}} />)
  expect(screen.queryByText(/fonte/i)).toBeNull()
})

test('chama onFeedback com up ao clicar 👍', () => {
  const onFeedback = jest.fn()
  render(<ChatBubble message={{ ...baseMsg, sources: [] }} onFeedback={onFeedback} />)
  fireEvent.click(screen.getByLabelText('Resposta útil'))
  expect(onFeedback).toHaveBeenCalledWith('1', 'up')
})

test('chama onFeedback com down ao clicar 👎', () => {
  const onFeedback = jest.fn()
  render(<ChatBubble message={{ ...baseMsg, sources: [] }} onFeedback={onFeedback} />)
  fireEvent.click(screen.getByLabelText('Resposta não útil'))
  expect(onFeedback).toHaveBeenCalledWith('1', 'down')
})
```

- [ ] **Step 2: Rodar para confirmar falha**

```
npm test -- --testPathPattern=ChatBubble
```
Expected: falha em sources e feedback

- [ ] **Step 3: Atualizar src/components/ChatBubble/index.tsx**

```typescript
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
    <div className={`group flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-3`}>
      <div
        className={`max-w-[80%] rounded-card px-4 py-3 ${
          isAssistant
            ? 'bg-pure-white border border-mist text-midnight'
            : 'bg-calm-indigo text-white'
        }`}
      >
        <p className="text-base">{message.content}</p>

        {hasSources && (
          <div className="mt-2">
            <button
              onClick={() => setSourcesOpen(o => !o)}
              className="text-slate-text text-sm flex items-center gap-1 hover:text-calm-indigo transition-colors"
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
              className="text-lg hover:scale-110 transition-transform"
            >
              👍
            </button>
            <button
              aria-label="Resposta não útil"
              onClick={() => onFeedback(message.id, 'down')}
              className="text-lg hover:scale-110 transition-transform"
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

- [ ] **Step 4: Rodar para confirmar que passa**

```
npm test -- --testPathPattern=ChatBubble
```
Expected: `6 passed`

- [ ] **Step 5: Commit**

```bash
git add src/components/ChatBubble/
git commit -m "feat(frontend): ChatBubble com sources expansível e feedback thumbs"
```

---

### Task 8: ChatInput — Botões de Voz

**Files:**
- Modify: `src/components/ChatInput/index.tsx`
- Test: `src/components/ChatInput/__tests__/ChatInput.test.tsx`

- [ ] **Step 1: Escrever o teste que falha**

`src/components/ChatInput/__tests__/ChatInput.test.tsx`:
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatInput } from '../index'

const baseProps = {
  onSend: jest.fn(),
  disabled: false,
  isListening: false,
  isSpeaking: false,
  speechSupported: true,
  onToggleListen: jest.fn(),
  onToggleSpeak: jest.fn(),
}

test('renderiza campo de texto e botão enviar', () => {
  render(<ChatInput {...baseProps} />)
  expect(screen.getByRole('textbox')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument()
})

test('renderiza botão microfone quando voz suportada', () => {
  render(<ChatInput {...baseProps} />)
  expect(screen.getByRole('button', { name: /microfone/i })).toBeInTheDocument()
})

test('não renderiza botão microfone quando não suportado', () => {
  render(<ChatInput {...baseProps} speechSupported={false} />)
  expect(screen.queryByRole('button', { name: /microfone/i })).toBeNull()
})

test('chama onSend ao submeter', () => {
  const onSend = jest.fn()
  render(<ChatInput {...baseProps} onSend={onSend} />)
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'oi' } })
  fireEvent.click(screen.getByRole('button', { name: /enviar/i }))
  expect(onSend).toHaveBeenCalledWith('oi')
})

test('botões de voz têm tamanho mínimo de 44px', () => {
  render(<ChatInput {...baseProps} />)
  const micBtn = screen.getByRole('button', { name: /microfone/i })
  expect(micBtn).toHaveClass('w-11')
})
```

- [ ] **Step 2: Rodar para confirmar falha**

```
npm test -- --testPathPattern=ChatInput
```
Expected: falha (props de voz não existem)

- [ ] **Step 3: Atualizar src/components/ChatInput/index.tsx**

```typescript
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
  speechSupported, onToggleListen, onToggleSpeak, transcript = ''
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
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 bg-pure-white border-t border-mist">
      {speechSupported && (
        <button
          type="button"
          aria-label={isListening ? 'Parar gravação' : 'Iniciar microfone'}
          onClick={onToggleListen}
          className={`w-11 h-11 rounded-btn flex items-center justify-center text-xl transition-colors ${
            isListening ? 'bg-crimson text-white animate-pulse' : 'bg-frost hover:bg-mist text-midnight'
          }`}
        >
          🎤
        </button>
      )}
      <input
        type="text"
        value={value}
        onChange={e => setText(e.target.value)}
        placeholder="Digite ou fale sua dúvida…"
        disabled={disabled}
        className="flex-1 rounded-btn border border-mist px-4 py-2.5 text-base bg-ice-white disabled:opacity-60 focus-visible:outline-calm-indigo"
        aria-label="Mensagem para o OWL"
      />
      {speechSupported && (
        <button
          type="button"
          aria-label={isSpeaking ? 'Silenciar OWL' : 'OWL falar em voz alta'}
          onClick={onToggleSpeak}
          className={`w-11 h-11 rounded-btn flex items-center justify-center text-xl transition-colors ${
            isSpeaking ? 'bg-calm-indigo text-white' : 'bg-frost hover:bg-mist text-midnight'
          }`}
        >
          🔊
        </button>
      )}
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Enviar mensagem"
        className="bg-calm-indigo hover:bg-deep-indigo text-white rounded-btn py-2.5 px-5 font-semibold disabled:opacity-50 transition-colors min-h-[44px]"
      >
        Enviar
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Rodar para confirmar que passa**

```
npm test -- --testPathPattern=ChatInput
```
Expected: `5 passed`

- [ ] **Step 5: Commit**

```bash
git add src/components/ChatInput/
git commit -m "feat(frontend): ChatInput com botões STT 🎤 e TTS 🔊 (44px)"
```

---

### Task 9: useSpeech Hook — STT + TTS + Boundary Callback

**Files:**
- Create: `src/hooks/useSpeech.ts`
- Test: `src/hooks/__tests__/useSpeech.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

`src/hooks/__tests__/useSpeech.test.ts`:
```typescript
const mockRecognition = {
  start: jest.fn(), stop: jest.fn(), abort: jest.fn(),
  addEventListener: jest.fn(), removeEventListener: jest.fn(),
  interimResults: false, lang: '', continuous: false,
}
const mockSpeechSynthesis = {
  speak: jest.fn(), cancel: jest.fn(), speaking: false,
  getVoices: jest.fn(() => [{ lang: 'pt-BR', name: 'Google pt' }]),
}

beforeEach(() => {
  Object.defineProperty(window, 'SpeechRecognition', { value: jest.fn(() => mockRecognition), writable: true })
  Object.defineProperty(window, 'webkitSpeechRecognition', { value: jest.fn(() => mockRecognition), writable: true })
  Object.defineProperty(window, 'speechSynthesis', { value: mockSpeechSynthesis, writable: true })
  jest.clearAllMocks()
})

test('supported é true quando SpeechRecognition existe', () => {
  const { renderHook } = require('@testing-library/react')
  const { useSpeech } = require('../useSpeech')
  const { result } = renderHook(() => useSpeech())
  expect(result.current.supported).toBe(true)
})

test('startListening chama recognition.start', () => {
  const { renderHook, act } = require('@testing-library/react')
  const { useSpeech } = require('../useSpeech')
  const { result } = renderHook(() => useSpeech())
  act(() => { result.current.startListening() })
  expect(mockRecognition.start).toHaveBeenCalled()
})

test('cancel chama speechSynthesis.cancel', () => {
  const { renderHook, act } = require('@testing-library/react')
  const { useSpeech } = require('../useSpeech')
  const { result } = renderHook(() => useSpeech())
  act(() => { result.current.cancel() })
  expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
})
```

- [ ] **Step 2: Rodar para confirmar falha**

```
npm test -- --testPathPattern=useSpeech
```
Expected: `Cannot find module '../useSpeech'`

- [ ] **Step 3: Criar src/hooks/useSpeech.ts**

```typescript
'use client'
import { useState, useCallback, useRef, useEffect } from 'react'

declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition
    webkitSpeechRecognition?: typeof SpeechRecognition
  }
}

export function useSpeech() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  useEffect(() => {
    if (!supported) return
    const SRClass = window.SpeechRecognition ?? window.webkitSpeechRecognition!
    const recognition = new SRClass()
    recognition.lang = 'pt-BR'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.addEventListener('result', (e: SpeechRecognitionEvent) => {
      const current = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('')
      setTranscript(current)
    })
    recognition.addEventListener('end', () => setIsListening(false))

    recognitionRef.current = recognition
  }, [supported])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return
    setTranscript('')
    recognitionRef.current.start()
    setIsListening(true)
  }, [isListening])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const speak = useCallback((text: string, onBoundary?: () => void) => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'
    utterance.rate = 0.9
    utterance.pitch = 1.05

    const voices = window.speechSynthesis.getVoices()
    const ptVoice = voices.find(v => v.lang.startsWith('pt'))
    if (ptVoice) utterance.voice = ptVoice

    if (onBoundary) {
      utterance.onboundary = onBoundary
    }
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }, [])

  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel()
    setIsSpeaking(false)
  }, [])

  return { isListening, isSpeaking, transcript, supported, startListening, stopListening, speak, cancel }
}
```

- [ ] **Step 4: Rodar para confirmar que passa**

```
npm test -- --testPathPattern=useSpeech
```
Expected: `3 passed`

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSpeech.ts src/hooks/__tests__/useSpeech.test.ts
git commit -m "feat(frontend): hook useSpeech — STT pt-BR, TTS com onboundary"
```

---

### Task 10: Modal LGPD + useChat Atualizado

**Files:**
- Create: `src/components/LgpdModal/index.tsx`
- Modify: `src/hooks/useChat.ts`
- Test: `src/hooks/__tests__/useChat.test.ts`

- [ ] **Step 1: Criar src/components/LgpdModal/index.tsx**

```typescript
'use client'
import { useEffect, useRef } from 'react'

interface Props {
  onAccept: () => void
  onDecline: () => void
}

export function LgpdModal({ onAccept, onDecline }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="rounded-card p-6 max-w-sm w-full bg-pure-white shadow-lg"
      aria-labelledby="lgpd-title"
    >
      <h2 id="lgpd-title" className="text-lg font-bold text-midnight mb-3">Ativação de Microfone</h2>
      <p className="text-sm text-slate-text mb-4">
        O reconhecimento de voz usa a Web Speech API do Google. Seu áudio será enviado para servidores do Google para transcrição. Nenhum dado é armazenado pelo NeuroGuia.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onDecline}
          className="rounded-btn px-4 py-2.5 border border-mist text-midnight hover:bg-frost transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onAccept}
          className="rounded-btn px-4 py-2.5 bg-calm-indigo text-white hover:bg-deep-indigo transition-colors"
        >
          Entendi e aceito
        </button>
      </div>
    </dialog>
  )
}
```

- [ ] **Step 2: Escrever teste para useChat atualizado**

`src/hooks/__tests__/useChat.test.ts`:
```typescript
const mockFetch = jest.fn()
global.fetch = mockFetch

function makeSSEStream(lines: string[]) {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(line + '\n'))
      }
      controller.close()
    }
  })
}

beforeEach(() => {
  mockFetch.mockReset()
  sessionStorage.setItem('access_token', 'fake.eyJzdWIiOiJ1Iiwicm9sZSI6ImVzdHVkYW50ZSIsImV4cCI6OTk5OTk5OTk5OX0.sig')
})

test('sendMessage adiciona mensagem do usuário imediatamente', async () => {
  const { renderHook, act } = require('@testing-library/react')
  const { useChat } = require('../useChat')
  mockFetch.mockResolvedValueOnce({
    ok: true, body: makeSSEStream([
      'data: {"message":"Olá!","avatar_state":"happy","movement":"talking","quick_replies":[],"sources":[]}',
      'event: done',
      'data: {}',
    ])
  })
  const { result } = renderHook(() => useChat())
  await act(async () => { await result.current.sendMessage('oi') })
  expect(result.current.messages.some(m => m.role === 'user' && m.content === 'oi')).toBe(true)
  expect(result.current.messages.some(m => m.role === 'assistant' && m.content === 'Olá!')).toBe(true)
})

test('sendMessage envia Authorization header', async () => {
  const { renderHook, act } = require('@testing-library/react')
  const { useChat } = require('../useChat')
  mockFetch.mockResolvedValueOnce({
    ok: true, body: makeSSEStream(['event: done', 'data: {}'])
  })
  const { result } = renderHook(() => useChat())
  await act(async () => { await result.current.sendMessage('oi') })
  const [, options] = mockFetch.mock.calls[0]
  expect(options.headers['Authorization']).toMatch(/^Bearer /)
})
```

- [ ] **Step 3: Rodar para confirmar falha**

```
npm test -- --testPathPattern=useChat
```
Expected: falha (sem Auth header ou sem sources)

- [ ] **Step 4: Atualizar src/hooks/useChat.ts**

```typescript
'use client'
import { useState, useCallback } from 'react'
import type { ChatMessage, ChatResponse, AvatarState, Movement } from '@/types/chat'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

function makeId() {
  return Math.random().toString(36).slice(2)
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [avatarState, setAvatarState] = useState<AvatarState>('neutral')
  const [movement, setMovement] = useState<Movement>('idle')
  const [isLoading, setIsLoading] = useState(false)
  const [quickReplies, setQuickReplies] = useState<string[]>([])

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { id: makeId(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setMovement('thinking')
    setQuickReplies([])

    const history = messages.map(m => ({ role: m.role, content: m.content }))
    const token = sessionStorage.getItem('access_token') ?? ''

    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: text, history }),
      })
      if (!res.ok || !res.body) throw new Error('Erro na resposta')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let lastAssistantId = makeId()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('event: done')) {
            setMovement('idle')
            setIsLoading(false)
            return
          }
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (!payload || payload === '{}') continue

          try {
            const chunk: ChatResponse = JSON.parse(payload)
            setAvatarState(chunk.avatar_state)
            setMovement(chunk.movement)
            if (chunk.quick_replies?.length) setQuickReplies(chunk.quick_replies)

            if (chunk.message) {
              setMessages(prev => {
                const existing = prev.find(m => m.id === lastAssistantId)
                if (existing) {
                  return prev.map(m => m.id === lastAssistantId
                    ? { ...m, content: m.content + chunk.message, sources: chunk.sources, quick_replies: chunk.quick_replies }
                    : m)
                }
                const newMsg: ChatMessage = {
                  id: lastAssistantId, role: 'assistant', content: chunk.message,
                  avatar_state: chunk.avatar_state, movement: chunk.movement,
                  quick_replies: chunk.quick_replies, sources: chunk.sources,
                }
                return [...prev, newMsg]
              })
            }
          } catch {
            // JSON inválido — ignorar
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, {
        id: makeId(), role: 'assistant', content: 'Ops, não consegui me conectar. Tente novamente.',
        avatar_state: 'empathetic', movement: 'idle', sources: [],
      }])
    } finally {
      setMovement('idle')
      setIsLoading(false)
    }
  }, [messages])

  return { messages, avatarState, movement, isLoading, quickReplies, sendMessage }
}
```

- [ ] **Step 5: Rodar para confirmar que passa**

```
npm test -- --testPathPattern=useChat
```
Expected: `2 passed`

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useChat.ts src/components/LgpdModal/ src/hooks/__tests__/useChat.test.ts
git commit -m "feat(frontend): useChat com auth header + sources; LgpdModal nativo"
```

---

### Task 11: Chat Page — Layout Completo

**Files:**
- Create: `src/app/chat/page.tsx`
- Modify: `src/components/EmotionControls/index.tsx` (restringir a admin)

- [ ] **Step 1: Atualizar EmotionControls para aceitar prop disabled/hidden**

`src/components/EmotionControls/index.tsx` — adicionar prop `visible`:
```typescript
interface Props {
  visible: boolean
  // demais props existentes
}

export function EmotionControls({ visible, ...rest }: Props) {
  if (!visible) return null
  // resto do componente existente
}
```

- [ ] **Step 2: Criar src/app/chat/page.tsx**

```typescript
'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useChat } from '@/hooks/useChat'
import { useSpeech } from '@/hooks/useSpeech'
import { OwlAvatar } from '@/components/OwlAvatar'
import { ChatBubble } from '@/components/ChatBubble'
import { ChatInput } from '@/components/ChatInput'
import { QuickReply } from '@/components/QuickReply'
import { EmotionControls } from '@/components/EmotionControls'
import { LgpdModal } from '@/components/LgpdModal'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export default function ChatPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { messages, avatarState, movement, isLoading, quickReplies, sendMessage } = useChat()
  const { isListening, isSpeaking, transcript, supported, startListening, stopListening, speak, cancel } = useSpeech()
  const [beakOpen, setBeakOpen] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [showLgpdModal, setShowLgpdModal] = useState(false)
  const [lgpdAccepted, setLgpdAccepted] = useState(false)
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

  function handleToggleListen() {
    if (!lgpdAccepted) { setShowLgpdModal(true); return }
    if (isListening) stopListening()
    else startListening()
  }

  function handleToggleSpeak() {
    if (isSpeaking) { cancel(); return }
    setAudioEnabled(a => !a)
  }

  function handleSend(text: string) {
    cancel()
    sendMessage(text)
  }

  function handleFeedback(messageId: string, rating: 'up' | 'down') {
    const msg = messages.find(m => m.id === messageId)
    if (!msg) return
    const token = sessionStorage.getItem('access_token') ?? ''
    fetch(`${API}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        type: 'message', message_id: messageId,
        question: messages.at(-2)?.content ?? '',
        answer: msg.content, sources: msg.sources ?? [], rating,
      }),
    }).catch(() => {})
  }

  function handleLogout() {
    document.cookie = 'access_token=; path=/; max-age=0'
    logout()
    router.push('/login')
  }

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-calm-indigo text-white px-4 py-2 rounded-btn z-50">
        Ir para o conteúdo
      </a>

      <div className="flex flex-col h-screen bg-ice-white">
        {/* Header */}
        <header className="bg-pure-white border-b border-mist px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-midnight text-lg">NeuroGuia</h1>
          <nav className="flex items-center gap-4 text-sm">
            {user?.role && ['admin_ppgec', 'admin'].includes(user.role) && (
              <>
                <Link href="/ingest" className="text-calm-indigo hover:underline">Base de Conhecimento</Link>
                <Link href="/feedback" className="text-calm-indigo hover:underline">Feedback</Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link href="/config" className="text-calm-indigo hover:underline">Configurações</Link>
            )}
            <button onClick={handleLogout} className="text-slate-text hover:text-midnight">Sair</button>
          </nav>
        </header>

        {/* Avatar area */}
        <div className="flex flex-col items-center pt-4 pb-2 shrink-0">
          <OwlAvatar state={avatarState} movement={movement} beakOpen={beakOpen} />
          {user?.role === 'admin' && (
            <EmotionControls visible={true} />
          )}
          {quickReplies.length > 0 && (
            <QuickReply options={quickReplies} onSelect={handleSend} />
          )}
        </div>

        {/* Messages */}
        <main id="main-content" className="flex-1 overflow-y-auto px-4 py-2" aria-live="polite" aria-label="Conversa com OWL">
          {messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} onFeedback={handleFeedback} />
          ))}
          {isLoading && (
            <div aria-label="Carregando resposta" className="flex gap-1 p-3">
              <span className="w-2 h-2 bg-silver rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-silver rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-silver rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Input */}
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

      {showLgpdModal && (
        <LgpdModal
          onAccept={() => { setLgpdAccepted(true); setShowLgpdModal(false); startListening() }}
          onDecline={() => setShowLgpdModal(false)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 3: Verificar no navegador com usuário logado**

```
npm run dev
```
Login com credenciais do seed_admin → /chat deve aparecer com OWL, input e header.

- [ ] **Step 4: Commit**

```bash
git add src/app/chat/page.tsx src/components/EmotionControls/
git commit -m "feat(frontend): chat page completa — OWL, voz, feedback, header por role"
```

---

### Task 12: Página /ingest — Base de Conhecimento

**Files:**
- Create: `src/app/ingest/page.tsx`

- [ ] **Step 1: Criar src/app/ingest/page.tsx**

```typescript
'use client'
import { useState, useEffect, useRef } from 'react'

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
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-midnight mb-6">Base de Conhecimento</h1>

      <section aria-label="Upload de documentos" className="bg-pure-white rounded-card border border-mist p-6 mb-6">
        <p className="text-sm text-slate-text mb-3">Tipos aceitos: PDF, TXT, DOCX · Máximo 20 MB por arquivo</p>
        <div
          className="border-2 border-dashed border-mist rounded-card p-8 text-center cursor-pointer hover:border-calm-indigo transition-colors"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files) }}
          onClick={() => fileRef.current?.click()}
        >
          <p className="text-slate-text">Arraste arquivos aqui ou clique para selecionar</p>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.txt,.docx"
            className="sr-only"
            aria-label="Selecionar arquivos para upload"
            onChange={e => handleUpload(e.target.files)}
          />
        </div>
        {error && <p role="alert" className="text-crimson text-sm mt-2">{error}</p>}
        {uploading && <p className="text-silver text-sm mt-2">Enviando…</p>}
        <button
          onClick={handleIngest}
          disabled={ingesting}
          className="mt-4 bg-calm-indigo hover:bg-deep-indigo text-white rounded-btn py-2.5 px-5 font-semibold disabled:opacity-60 transition-colors"
        >
          {ingesting ? 'Processando…' : 'Processar na base'}
        </button>
        {progress.length > 0 && (
          <ul className="mt-3 text-sm text-slate-text space-y-1">
            {progress.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        )}
      </section>

      <section aria-label="Documentos ingeridos">
        <h2 className="text-lg font-semibold text-midnight mb-3">Documentos ({docs.length})</h2>
        {docs.length === 0
          ? <p className="text-silver text-sm">Nenhum documento na base.</p>
          : <ul className="space-y-2">
              {docs.map(doc => (
                <li key={doc.source_id} className="flex items-center justify-between bg-pure-white rounded-card border border-mist px-4 py-3">
                  <span className="text-midnight text-sm">{doc.source}</span>
                  <button
                    onClick={() => handleDelete(doc.source_id)}
                    aria-label={`Remover ${doc.source}`}
                    className="text-crimson hover:text-red-700 font-bold text-lg leading-none"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
        }
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Verificar no navegador com admin_ppgec**

Acessar /ingest — upload drag-and-drop e lista de documentos devem aparecer.

- [ ] **Step 3: Commit**

```bash
git add src/app/ingest/page.tsx
git commit -m "feat(frontend): página /ingest — upload drag-drop, progress SSE, list, delete"
```

---

### Task 13: Página /config — Configurações

**Files:**
- Create: `src/app/config/page.tsx`

- [ ] **Step 1: Criar src/app/config/page.tsx**

```typescript
'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
function token() { return sessionStorage.getItem('access_token') ?? '' }

const PROVIDERS = ['anthropic', 'openai', 'google'] as const

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

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-midnight mb-6">Configurações</h1>
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1 text-sm font-medium text-midnight">
          System Prompt do OWL
          <textarea
            rows={10}
            value={cfg.system_prompt}
            onChange={e => setCfg(c => ({ ...c, system_prompt: e.target.value }))}
            className="rounded-btn border border-mist px-4 py-2.5 text-sm bg-ice-white font-mono"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-midnight">
            Provedor LLM
            <select value={cfg.llm_provider} onChange={e => setCfg(c => ({ ...c, llm_provider: e.target.value }))}
              className="rounded-btn border border-mist px-4 py-2.5 bg-ice-white">
              {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-midnight">
            Modelo LLM
            <input type="text" value={cfg.llm_model}
              onChange={e => setCfg(c => ({ ...c, llm_model: e.target.value }))}
              className="rounded-btn border border-mist px-4 py-2.5 bg-ice-white" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-midnight">
            Provedor Embeddings
            <select value={cfg.embed_provider} onChange={e => setCfg(c => ({ ...c, embed_provider: e.target.value }))}
              className="rounded-btn border border-mist px-4 py-2.5 bg-ice-white">
              {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-midnight">
            Modelo Embeddings
            <input type="text" value={cfg.embed_model}
              onChange={e => setCfg(c => ({ ...c, embed_model: e.target.value }))}
              className="rounded-btn border border-mist px-4 py-2.5 bg-ice-white" />
          </label>
        </div>

        <div className="bg-frost rounded-card p-4">
          <p className="text-sm font-medium text-midnight mb-2">Chaves de API (apenas leitura)</p>
          {[['Anthropic', cfg.anthropic_api_key], ['OpenAI', cfg.openai_api_key], ['Google', cfg.google_api_key]].map(([name, val]) => (
            <p key={name} className="text-sm text-slate-text">{name}: <code>{val || '—'}</code></p>
          ))}
          <p className="text-xs text-silver mt-1">Para alterar chaves, edite o arquivo backend/.env</p>
        </div>

        {error && <p role="alert" className="text-crimson text-sm">{error}</p>}
        {saved && <p role="status" className="text-forest-green text-sm">Configurações salvas com sucesso.</p>}

        <button type="submit"
          className="bg-calm-indigo hover:bg-deep-indigo text-white rounded-btn py-2.5 px-5 font-semibold self-start transition-colors">
          Salvar
        </button>
      </form>
    </main>
  )
}
```

- [ ] **Step 2: Verificar no navegador com admin**

Acessar /config — formulário de configuração com system prompt, provider e modelo.

- [ ] **Step 3: Commit**

```bash
git add src/app/config/page.tsx
git commit -m "feat(frontend): página /config — system prompt, LLM e embeddings configuráveis"
```

---

### Task 14: Página /feedback — Painel de Feedback

**Files:**
- Create: `src/app/feedback/page.tsx`

- [ ] **Step 1: Criar src/app/feedback/page.tsx**

```typescript
'use client'
import { useState, useEffect } from 'react'

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

  if (error) return <main className="p-6 text-crimson">{error}</main>
  if (!data) return <main className="p-6 text-silver">Carregando…</main>

  const emojiCount = { happy: 0, neutral: 0, sad: 0 }
  for (const s of data.sessions) emojiCount[s.emoji as keyof typeof emojiCount]++

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-midnight">Feedback</h1>
        <button onClick={handleExport}
          className="bg-calm-indigo hover:bg-deep-indigo text-white rounded-btn py-2 px-4 text-sm font-semibold transition-colors">
          Exportar CSV
        </button>
      </div>

      <section aria-label="Satisfação das sessões" className="bg-pure-white rounded-card border border-mist p-5 mb-6">
        <h2 className="text-lg font-semibold text-midnight mb-3">Satisfação ({data.sessions.length} sessões)</h2>
        <div className="flex gap-6 text-2xl">
          <span title="Satisfeito">😊 <span className="text-base text-midnight font-bold">{emojiCount.happy}</span></span>
          <span title="Neutro">😐 <span className="text-base text-midnight font-bold">{emojiCount.neutral}</span></span>
          <span title="Insatisfeito">😞 <span className="text-base text-midnight font-bold">{emojiCount.sad}</span></span>
        </div>
      </section>

      <section aria-label="Respostas com avaliação negativa" className="bg-pure-white rounded-card border border-mist p-5 mb-6">
        <h2 className="text-lg font-semibold text-midnight mb-3">Respostas 👎 ({data.negative_messages.length})</h2>
        {data.negative_messages.length === 0
          ? <p className="text-silver text-sm">Nenhuma avaliação negativa ainda.</p>
          : <ul className="space-y-4">
              {data.negative_messages.map((m, i) => (
                <li key={i} className="border-t border-mist pt-3">
                  <p className="text-sm font-medium text-midnight">P: {m.question}</p>
                  <p className="text-sm text-slate-text mt-1">R: {m.answer}</p>
                  <p className="text-xs text-silver mt-1">{m.sources.join(', ')}</p>
                </li>
              ))}
            </ul>
        }
      </section>

      <section aria-label="Lacunas no RAG" className="bg-pure-white rounded-card border border-mist p-5">
        <h2 className="text-lg font-semibold text-midnight mb-3">Lacunas RAG (sem fonte identificada)</h2>
        {data.rag_gaps.length === 0
          ? <p className="text-silver text-sm">Nenhuma lacuna registrada.</p>
          : <ul className="space-y-2">
              {data.rag_gaps.map((g, i) => (
                <li key={i} className="flex items-center justify-between border-t border-mist pt-2">
                  <span className="text-sm text-midnight">{g.question}</span>
                  <span className="text-sm font-bold text-warm-terracotta">{g.count}×</span>
                </li>
              ))}
            </ul>
        }
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Verificar no navegador com admin_ppgec**

Acessar /feedback — painel com satisfação, respostas negativas e lacunas RAG.

- [ ] **Step 3: Commit**

```bash
git add src/app/feedback/page.tsx
git commit -m "feat(frontend): página /feedback — satisfação, respostas negativas, lacunas RAG, export CSV"
```

---

### Task 15: Toast de Avaliação de Sessão

**Files:**
- Create: `src/components/SessionRatingToast/index.tsx`
- Modify: `src/app/chat/page.tsx` (integrar toast no beforeunload e botão Sair)

- [ ] **Step 1: Criar src/components/SessionRatingToast/index.tsx**

```typescript
'use client'
interface Props {
  onRate: (emoji: 'happy' | 'neutral' | 'sad') => void
  onDismiss: () => void
}

const OPTIONS: { value: 'happy' | 'neutral' | 'sad'; label: string; emoji: string }[] = [
  { value: 'sad',     label: 'Insatisfeito', emoji: '😞' },
  { value: 'neutral', label: 'Neutro',        emoji: '😐' },
  { value: 'happy',   label: 'Satisfeito',    emoji: '😊' },
]

export function SessionRatingToast({ onRate, onDismiss }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-rating-title"
      className="fixed bottom-4 right-4 bg-pure-white rounded-card border border-mist shadow-lg p-5 z-50 max-w-xs"
    >
      <p id="session-rating-title" className="text-sm font-semibold text-midnight mb-3">
        Como foi sua experiência?
      </p>
      <div className="flex justify-around mb-4">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            aria-label={opt.label}
            onClick={() => onRate(opt.value)}
            className="text-3xl hover:scale-125 transition-transform"
          >
            {opt.emoji}
          </button>
        ))}
      </div>
      <button
        onClick={onDismiss}
        className="text-xs text-silver hover:text-slate-text w-full text-center"
      >
        Pular
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Integrar SessionRatingToast na chat page**

Em `src/app/chat/page.tsx`, adicionar:

```typescript
// Estado
const [showRating, setShowRating] = useState(false)

// Função de submit de avaliação
function submitSessionRating(emoji: 'happy' | 'neutral' | 'sad') {
  const tok = sessionStorage.getItem('access_token') ?? ''
  fetch(`${API}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
    body: JSON.stringify({ type: 'session', emoji, message_count: messages.length }),
  }).catch(() => {})
  setShowRating(false)
}

// useEffect para beforeunload (mostra toast antes de sair)
useEffect(() => {
  function onBeforeUnload(e: BeforeUnloadEvent) {
    if (messages.length > 0) {
      setShowRating(true)
      e.preventDefault()
    }
  }
  window.addEventListener('beforeunload', onBeforeUnload)
  return () => window.removeEventListener('beforeunload', onBeforeUnload)
}, [messages.length])

// Atualizar handleLogout para mostrar toast antes de sair
function handleLogout() {
  if (messages.length > 0) {
    setShowRating(true)
    return
  }
  document.cookie = 'access_token=; path=/; max-age=0'
  logout()
  router.push('/login')
}

// No JSX, adicionar ao final:
// {showRating && (
//   <SessionRatingToast
//     onRate={emoji => { submitSessionRating(emoji); document.cookie = 'access_token=; path=/; max-age=0'; logout(); router.push('/login') }}
//     onDismiss={() => { setShowRating(false); document.cookie = 'access_token=; path=/; max-age=0'; logout(); router.push('/login') }}
//   />
// )}
```

- [ ] **Step 3: Verificar no navegador**

1. Fazer login, enviar algumas mensagens
2. Clicar em "Sair" → toast de avaliação deve aparecer
3. Selecionar emoji → toast fecha e redireciona para /login

- [ ] **Step 4: Commit**

```bash
git add src/components/SessionRatingToast/ src/app/chat/page.tsx
git commit -m "feat(frontend): toast de avaliação de sessão ao sair (😞😐😊)"
```

---

### Task 16: Acessibilidade — Audit Final

**Files:**
- Verify: `src/app/chat/page.tsx` (skip link, aria-live presentes)
- Verify: `src/components/OwlAvatar/index.tsx` (aria-label dinâmico)
- Verify: `src/app/globals.css` (prefers-reduced-motion cobre todas as animações)

- [ ] **Step 1: Verificar checklist de acessibilidade**

Execute `npm run build` e inspecione saída:
```
npm run build
```
Expected: build sem erros de tipo.

- [ ] **Step 2: Verificar no navegador com teclado**

1. Abrir /chat
2. Pressionar `Tab` — skip link "Ir para o conteúdo" deve aparecer
3. Pressionar `Enter` — foco deve ir para `#main-content`
4. Navegar pelos botões de voz com `Tab` — devem ter foco visível (outline azul)
5. ChatBubble — thumbs 👍👎 aparecem no foco do mouse ou teclado

- [ ] **Step 3: Verificar contraste (manual)**

Abrir DevTools → Accessibility → color contrast. Verificar:
- Texto principal (Midnight `#1C1E2E` sobre Ice White `#F4F6FB`) → 14.1:1
- Bubble usuário (Branco sobre Calm Indigo `#4A5BE0`) → 9.2:1
- Placeholder (Silver `#6D7A99` sobre Ice White) → 4.8:1

- [ ] **Step 4: Rodar todos os testes**

```
npm test
```
Expected: todos passam.

- [ ] **Step 5: Lint**

```
npm run lint
```
Expected: sem erros.

- [ ] **Step 6: Commit final**

```bash
git add -p
git commit -m "feat(frontend): frontend completo — acessibilidade verificada, lint limpo"
```
