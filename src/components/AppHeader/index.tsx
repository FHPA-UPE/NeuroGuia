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
          type="button"
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
