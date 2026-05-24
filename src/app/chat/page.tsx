'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useChat } from '@/hooks/useChat'
import { useSpeech } from '@/hooks/useSpeech'
import { useTTS } from '@/hooks/useTTS'
import { AppHeader } from '@/components/AppHeader'
import OllieAvatar from '@/components/OllieAvatar/OllieAvatar'
import { ChatBubble } from '@/components/ChatBubble'
import { ChatInput } from '@/components/ChatInput'
import { EmotionControls } from '@/components/EmotionControls'
import { LgpdModal } from '@/components/LgpdModal'
import QuickReply from '@/components/QuickReply/QuickReply'
import { SessionRatingToast } from '@/components/SessionRatingToast'
import type { AvatarState } from '@/types/chat'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

const STAGE_COLORS: Record<AvatarState, string> = {
  neutral:     '#FEF0E0',
  happy:       '#FEF0E0',
  encouraging: '#EDE8F8',
  empathetic:  '#EDE8F8',
  thoughtful:  '#E4E0F0',
}

export default function ChatPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const { messages, avatarState, movement, isLoading, quickReplies, sendMessage, setAvatarState, setMovement } = useChat()
  const { isListening, isSpeaking: speechIsSpeaking, transcript, supported, startListening, stopListening } = useSpeech()
  const [audioEnabled, setAudioEnabled] = useState(false)
  const lastAssistantText = !isLoading
    ? messages.filter((m) => m.role === 'assistant').at(-1)?.content ?? null
    : null
  const { isSpeaking: ttsIsSpeaking, beakOpen } = useTTS(audioEnabled ? lastAssistantText : null)
  const effectiveMovement = ttsIsSpeaking ? 'talking' : movement
  const [showLgpdModal, setShowLgpdModal] = useState(false)
  const [lgpdAccepted, setLgpdAccepted] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (messages.length > 0) { setShowRating(true); e.preventDefault() }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [messages.length])

  function handleToggleListen() {
    if (!lgpdAccepted) { setShowLgpdModal(true); return }
    if (isListening) stopListening(); else startListening()
  }

  function handleToggleSpeak() {
    setAudioEnabled(a => !a)
  }

  function handleSend(text: string) { sendMessage(text) }

  function handleFeedback(messageId: string, rating: 'up' | 'down') {
    const msg = messages.find(m => m.id === messageId)
    if (!msg) return
    const tok = sessionStorage.getItem('access_token') ?? ''
    fetch(`${API}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
      body: JSON.stringify({
        type: 'message', message_id: messageId,
        question: messages.at(-2)?.content ?? '',
        answer: msg.content, sources: msg.sources ?? [], rating,
      }),
    }).catch(() => {})
  }

  function submitSessionRating(emoji: 'happy' | 'neutral' | 'sad') {
    const tok = sessionStorage.getItem('access_token') ?? ''
    fetch(`${API}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
      body: JSON.stringify({ type: 'session', emoji, message_count: messages.length }),
    }).catch(() => {})
    setShowRating(false)
  }

  function handleLogout() {
    if (messages.length > 0) { setShowRating(true); return }
    document.cookie = 'access_token=; path=/; max-age=0'
    logout()
    router.push('/login')
  }

  return (
    <>
      <AppHeader onLogout={handleLogout} />

      <div className="flex flex-col h-[calc(100vh-64px)] bg-cream">
        {/* Zona de palco OLLIE */}
        <div
          className="flex flex-col items-center pt-5 pb-3 shrink-0"
          style={{ backgroundColor: STAGE_COLORS[avatarState], transition: 'background-color 0.4s ease' }}
        >
          <OllieAvatar
            avatarState={avatarState}
            movement={effectiveMovement}
            beakOpen={beakOpen}
          />
          <EmotionControls
            visible={mounted && user?.role === 'admin'}
            avatarState={avatarState}
            movement={movement}
            onStateChange={setAvatarState}
            onMovementChange={setMovement}
          />
        </div>

        {/* Mensagens */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-4 py-4"
          aria-live="polite"
          aria-label="Conversa com OLLIE"
        >
          <div className="max-w-3xl mx-auto w-full">
            {messages.map(msg => (
              <ChatBubble key={msg.id} message={msg} onFeedback={handleFeedback} currentOllieState={avatarState} />
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 mb-4">
                <div className="w-10 h-10 shrink-0" />
                <div aria-label="Carregando resposta" className="flex gap-1 p-3">
                  <span className="w-2 h-2 bg-owl-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-owl-orange rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-owl-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Quick replies + Input */}
        <div className="shrink-0">
          <div className="max-w-3xl mx-auto w-full">
            {quickReplies.length > 0 && (
              <QuickReply options={quickReplies} onSelect={handleSend} />
            )}
            <ChatInput
              onSend={handleSend}
              disabled={isLoading}
              isListening={isListening}
              isSpeaking={audioEnabled || speechIsSpeaking || ttsIsSpeaking}
              speechSupported={mounted && supported}
              onToggleListen={handleToggleListen}
              onToggleSpeak={handleToggleSpeak}
              transcript={transcript}
            />
          </div>
        </div>
      </div>

      {showLgpdModal && (
        <LgpdModal
          onAccept={() => { setLgpdAccepted(true); setShowLgpdModal(false); startListening() }}
          onDecline={() => setShowLgpdModal(false)}
        />
      )}
      {showRating && (
        <SessionRatingToast
          onRate={emoji => {
            submitSessionRating(emoji)
            document.cookie = 'access_token=; path=/; max-age=0'
            logout()
            router.push('/login')
          }}
          onDismiss={() => {
            setShowRating(false)
            document.cookie = 'access_token=; path=/; max-age=0'
            logout()
            router.push('/login')
          }}
        />
      )}
    </>
  )
}
