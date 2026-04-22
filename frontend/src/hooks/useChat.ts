import { useState, useCallback } from 'react'
import type { ChatMessage, ChatResponse, AvatarState, Movement } from '@/types/chat'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [avatarState, setAvatarState] = useState<AvatarState>('neutral')
  const [movement, setMovement] = useState<Movement>('idle')

  const sendMessage = useCallback(async (text: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setMovement('thinking')

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history }),
    })

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data: ChatResponse = JSON.parse(line.slice(6))
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message,
          avatar_state: data.avatar_state,
          movement: data.movement,
          quick_replies: data.quick_replies,
        }
        setMessages((prev) => [...prev, assistantMessage])
        setAvatarState(data.avatar_state)
        setMovement(data.movement)
      }
    }

    setIsLoading(false)
    setMovement('idle')
  }, [messages])

  return { messages, isLoading, avatarState, movement, sendMessage }
}
