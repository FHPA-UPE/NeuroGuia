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
