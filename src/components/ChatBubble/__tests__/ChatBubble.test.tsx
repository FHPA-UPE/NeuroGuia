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
