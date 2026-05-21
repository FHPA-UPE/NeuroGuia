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
              className="rounded-2xl border border-mist px-5 py-3.5 text-base bg-cream min-h-[48px] focus-visible:border-owl-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-orange-dark"
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
              className="rounded-2xl border border-mist px-5 py-3.5 text-base bg-cream min-h-[48px] focus-visible:border-owl-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-orange-dark"
            />
          </label>

          {error && (
            <p role="alert" className="flex items-center gap-2 text-sm text-ink bg-error/10 rounded-xl px-4 py-2.5 border border-error/30">
              <span aria-hidden="true">⚠️</span> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-owl-orange hover:bg-owl-orange-dark text-ink rounded-2xl py-3.5 px-5 font-semibold disabled:opacity-60 transition-colors min-h-[48px] flex items-center justify-center gap-2"
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
        <OwlAvatar state="neutral" movement="idle" beakOpen={false} aria-label="OWL assistente decorativo" />
      </div>
    </main>
  )
}
