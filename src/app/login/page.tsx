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
