import { render, screen } from '@testing-library/react'
import ChatBubble from './ChatBubble'

describe('ChatBubble', () => {
  it('renderiza mensagem do assistente', () => {
    render(<ChatBubble role="assistant" content="Olá! Como posso ajudar?" />)
    expect(screen.getByText('Olá! Como posso ajudar?')).toBeInTheDocument()
  })

  it('renderiza mensagem do usuário', () => {
    render(<ChatBubble role="user" content="Quais são meus direitos?" />)
    expect(screen.getByText('Quais são meus direitos?')).toBeInTheDocument()
  })

  it('tem role="log" para leitores de tela', () => {
    const { container } = render(<ChatBubble role="assistant" content="teste" />)
    expect(container.firstChild).toHaveAttribute('role', 'log')
  })
})
