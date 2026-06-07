import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatBubble } from '../ChatBubble'

const baseMsg = {
  id: '1',
  role: 'assistant' as const,
  content: 'Olá!',
  avatar_state: 'happy' as const,
  movement: 'idle' as const,
}

test('renderiza conteúdo da mensagem', () => {
  render(<ChatBubble message={{ ...baseMsg, sources: [] }} onFeedback={() => {}} />)
  expect(screen.getByText('Olá!')).toBeInTheDocument()
})

test('mostra botão de sources quando há sources', () => {
  render(<ChatBubble message={{ ...baseMsg, sources: ['normas.pdf'] }} onFeedback={() => {}} />)
  expect(screen.getByText(/1 fonte/i)).toBeInTheDocument()
})

test('expande sources ao clicar', () => {
  render(<ChatBubble message={{ ...baseMsg, sources: ['normas.pdf', 'decreto.pdf'] }} onFeedback={() => {}} />)
  fireEvent.click(screen.getByText(/2 fontes/i))
  expect(screen.getByText(/normas\.pdf.*decreto\.pdf/)).toBeInTheDocument()
})

test('não mostra fontes para mensagem do usuário', () => {
  render(<ChatBubble message={{ ...baseMsg, role: 'user', sources: ['normas.pdf'] }} onFeedback={() => {}} />)
  expect(screen.queryByText(/fonte/i)).toBeNull()
})

test('chama onFeedback com up ao clicar 👍', () => {
  const onFeedback = jest.fn()
  render(<ChatBubble message={{ ...baseMsg, sources: [] }} onFeedback={onFeedback} />)
  fireEvent.click(screen.getByLabelText('Resposta útil'))
  expect(onFeedback).toHaveBeenCalledWith('1', 'up')
})

test('chama onFeedback com down ao clicar 👎', () => {
  const onFeedback = jest.fn()
  render(<ChatBubble message={{ ...baseMsg, sources: [] }} onFeedback={onFeedback} />)
  fireEvent.click(screen.getByLabelText('Resposta não útil'))
  expect(onFeedback).toHaveBeenCalledWith('1', 'down')
})

test('bot message renders OwlAvatarThumb using message.avatar_state', () => {
  render(<ChatBubble message={{ ...baseMsg, avatar_state: 'happy' }} onFeedback={() => {}} />)
  expect(screen.getByRole('img', { name: /OWL está feliz/i })).toBeInTheDocument()
})

test('bot message uses currentOwlState as fallback when message.avatar_state is undefined', () => {
  const msg = { ...baseMsg, avatar_state: undefined }
  render(<ChatBubble message={msg} onFeedback={() => {}} currentOwlState="encouraging" />)
  expect(screen.getByRole('img', { name: /OWL está encorajador/i })).toBeInTheDocument()
})

test('bot message falls back to neutral when both avatar states are undefined', () => {
  const msg = { ...baseMsg, avatar_state: undefined }
  render(<ChatBubble message={msg} onFeedback={() => {}} />)
  expect(screen.getByRole('img', { name: /OWL está neutro/i })).toBeInTheDocument()
})

test('user message renders UserAvatarThumb', () => {
  render(<ChatBubble message={{ ...baseMsg, role: 'user' }} onFeedback={() => {}} />)
  expect(screen.getByTestId('user-avatar-thumb')).toBeInTheDocument()
})

test('user message does not render OwlAvatarThumb', () => {
  render(<ChatBubble message={{ ...baseMsg, role: 'user' }} onFeedback={() => {}} />)
  expect(screen.queryByRole('img', { name: /OWL está/i })).toBeNull()
})

test('renderiza marcação simples do assistente com listas e negrito', () => {
  const content = 'Para solicitar as adaptações pedagógicas, você precisa seguir alguns passos:\n\n* **Prepare a documentação:** Se possível, tenha um laudo médico.\n* **Vá ao setor de escolaridade:** Dirija-se à secretaria do seu Campus/Unidade, onde seu curso está vinculado.'
  const { container } = render(<ChatBubble message={{ ...baseMsg, content, sources: [] }} onFeedback={() => {}} />)
  expect(screen.getByText('Prepare a documentação:')).toBeInTheDocument()
  expect(container.querySelector('ul')).toBeInTheDocument()
  expect(container.querySelector('strong')).toBeInTheDocument()
})

test('bot message does not render UserAvatarThumb', () => {
  render(<ChatBubble message={baseMsg} onFeedback={() => {}} />)
  expect(screen.queryByTestId('user-avatar-thumb')).toBeNull()
})
