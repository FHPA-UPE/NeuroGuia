'use client'

const QUESTIONS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    text: 'O que é o NAI e como pode me ajudar?',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    text: 'Como solicitar adaptações nas atividades acadêmicas?',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    text: 'Quais são meus direitos como estudante neurodivergente?',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    text: 'Como o PPGEC apoia estudantes com dificuldades acadêmicas?',
  },
]

interface StarterQuestionsProps {
  onSelect: (question: string) => void
}

export function StarterQuestions({ onSelect }: StarterQuestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 px-4">
      <p className="text-slate-text text-sm mb-6">Escolha uma pergunta para começar ou escreva a sua:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q.text)}
            className="flex items-start gap-3 text-left bg-cream-card hover:bg-owl-orange/5 border border-mist hover:border-owl-orange/40 rounded-2xl px-4 py-3.5 transition-colors group min-h-[44px]"
          >
            <span className="text-owl-orange mt-0.5 shrink-0 group-hover:scale-110 transition-transform">
              {q.icon}
            </span>
            <span className="text-sm text-ink leading-snug">{q.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
