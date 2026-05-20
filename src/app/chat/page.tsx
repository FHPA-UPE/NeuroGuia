'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useChat } from '@/hooks/useChat'
import { useSpeech } from '@/hooks/useSpeech'
import { OwlAvatar } from '@/components/OwlAvatar'
import { ChatBubble } from '@/components/ChatBubble'
import { ChatInput } from '@/components/ChatInput'
import { EmotionControls } from '@/components/EmotionControls'
import { LgpdModal } from '@/components/LgpdModal'
import QuickReply from '@/components/QuickReply/QuickReply'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export default function ChatPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { messages, avatarState, movement, isLoading, quickReplies, sendMessage, setAvatarState, setMovement } = useChat()
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

  const isAdmin = user?.role && ['admin_ppgec', 'admin'].includes(user.role)

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
            {isAdmin && (
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
          <EmotionControls
            visible={user?.role === 'admin'}
            avatarState={avatarState}
            movement={movement}
            onStateChange={setAvatarState}
            onMovementChange={setMovement}
          />
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
