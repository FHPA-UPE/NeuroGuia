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

  const fieldClass = 'rounded-xl border border-mist px-4 py-3 bg-cream min-h-[48px] focus-visible:border-owl-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-orange-dark'

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
                className="rounded-2xl border border-mist px-5 py-3.5 text-sm bg-cream font-mono focus-visible:border-owl-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-orange-dark"
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
            <p className="text-xs text-slate-text mt-1">Para alterar chaves, edite o arquivo backend/.env</p>
          </div>

          {error && (
            <p role="alert" className="flex items-center gap-2 text-sm text-ink bg-error/10 rounded-xl px-4 py-2.5 border border-error/30">
              <span aria-hidden="true">⚠️</span> {error}
            </p>
          )}
          {saved && (
            <p role="status" className="flex items-center gap-2 text-sm text-success bg-success/10 rounded-xl px-4 py-2.5">
              <span aria-hidden="true">✓</span> Configurações salvas com sucesso.
            </p>
          )}

          <button type="submit"
            className="bg-owl-orange hover:bg-owl-orange-dark text-ink rounded-2xl py-2.5 px-5 font-semibold self-start transition-colors min-h-[44px]">
            Salvar
          </button>
        </form>
      </main>
    </>
  )
}
