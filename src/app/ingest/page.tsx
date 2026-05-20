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
