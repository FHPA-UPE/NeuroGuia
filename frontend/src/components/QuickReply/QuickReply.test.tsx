import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuickReply from './QuickReply'

describe('QuickReply', () => {
  it('renderiza todas as opções', () => {
    render(<QuickReply options={['Direitos', 'Onboard', 'Ajuda']} onSelect={jest.fn()} />)
    expect(screen.getByText('Direitos')).toBeInTheDocument()
    expect(screen.getByText('Onboard')).toBeInTheDocument()
    expect(screen.getByText('Ajuda')).toBeInTheDocument()
  })

  it('chama onSelect com o texto correto ao clicar', async () => {
    const onSelect = jest.fn()
    render(<QuickReply options={['Direitos']} onSelect={onSelect} />)
    await userEvent.click(screen.getByText('Direitos'))
    expect(onSelect).toHaveBeenCalledWith('Direitos')
  })

  it('não renderiza nada quando options está vazio', () => {
    const { container } = render(<QuickReply options={[]} onSelect={jest.fn()} />)
    expect(container.firstChild).toBeNull()
  })
})
