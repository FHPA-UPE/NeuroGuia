import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatInput from './ChatInput'

describe('ChatInput', () => {
  it('renderiza o campo de texto', () => {
    render(<ChatInput onSubmit={jest.fn()} disabled={false} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('envia ao pressionar Enter', async () => {
    const onSubmit = jest.fn()
    render(<ChatInput onSubmit={onSubmit} disabled={false} />)
    await userEvent.type(screen.getByRole('textbox'), 'Olá{Enter}')
    expect(onSubmit).toHaveBeenCalledWith('Olá')
  })

  it('não envia mensagem vazia', async () => {
    const onSubmit = jest.fn()
    render(<ChatInput onSubmit={onSubmit} disabled={false} />)
    await userEvent.type(screen.getByRole('textbox'), '{Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('desabilita input quando disabled=true', () => {
    render(<ChatInput onSubmit={jest.fn()} disabled={true} />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})
