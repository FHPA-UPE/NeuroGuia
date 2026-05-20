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
