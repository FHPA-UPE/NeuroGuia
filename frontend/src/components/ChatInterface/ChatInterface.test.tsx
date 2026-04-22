import { render, screen } from '@testing-library/react'
import ChatInterface from './ChatInterface'

jest.mock('@/hooks/useChat', () => ({
  useChat: jest.fn(() => ({
    messages: [],
    isLoading: false,
    avatarState: 'neutral',
    movement: 'idle',
    sendMessage: jest.fn(),
  })),
}))

describe('ChatInterface', () => {
  it('renderiza a OLLIE (SVG) e o campo de input', () => {
    const { container } = render(<ChatInterface />)
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('exibe mensagens do histórico', () => {
    const { useChat } = require('@/hooks/useChat')
    useChat.mockReturnValueOnce({
      messages: [
        { id: '1', role: 'assistant', content: 'Olá! Como posso ajudar?' },
      ],
      isLoading: false,
      avatarState: 'happy',
      movement: 'talking',
      sendMessage: jest.fn(),
    })
    render(<ChatInterface />)
    expect(screen.getByText('Olá! Como posso ajudar?')).toBeInTheDocument()
  })
})
