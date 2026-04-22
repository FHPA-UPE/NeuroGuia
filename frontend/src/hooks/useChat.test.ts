import { renderHook, act } from '@testing-library/react'
import { useChat } from './useChat'

// Polyfill TextEncoder/TextDecoder for jsdom environment
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder as typeof global.TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder

global.fetch = jest.fn()

describe('useChat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('inicia com histórico vazio e não carregando', () => {
    const { result } = renderHook(() => useChat())
    expect(result.current.messages).toHaveLength(0)
    expect(result.current.isLoading).toBe(false)
  })

  it('adiciona mensagem do usuário ao enviar', async () => {
    const mockResponse = {
      message: 'Olá!',
      avatar_state: 'happy',
      movement: 'talking',
      quick_replies: ['Direitos'],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode(`data: ${JSON.stringify(mockResponse)}\n\n`),
            })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      },
    })

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('Olá')
    })

    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[0].role).toBe('user')
    expect(result.current.messages[0].content).toBe('Olá')
    expect(result.current.messages[1].role).toBe('assistant')
    expect(result.current.messages[1].avatar_state).toBe('happy')
  })
})
