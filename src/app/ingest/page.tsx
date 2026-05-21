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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDocs()
  }, [])

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

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover "${name}" da base de conhecimento?`)) return
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
            <p role="alert" className="flex items-center gap-2 text-sm text-ink bg-error/10 rounded-xl px-4 py-2.5 mt-2 border border-error/30">
              <span aria-hidden="true">⚠️</span> {error}
            </p>
          )}
          {uploading && <p className="text-slate-text text-sm mt-2">Enviando…</p>}
          <button
            onClick={handleIngest}
            disabled={ingesting}
            className="mt-4 bg-owl-orange hover:bg-owl-orange-dark text-ink rounded-2xl py-2.5 px-5 font-semibold disabled:opacity-60 transition-colors flex items-center gap-2 min-h-[44px]"
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
                      onClick={() => handleDelete(doc.source_id, doc.source)}
                      aria-label={`Remover ${doc.source}`}
                      className="text-error hover:text-error font-bold text-lg leading-none min-w-[44px] min-h-[44px] flex items-center justify-center hover:opacity-80"
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
