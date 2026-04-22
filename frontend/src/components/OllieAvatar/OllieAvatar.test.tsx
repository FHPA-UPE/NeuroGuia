import { render, screen } from '@testing-library/react'
import OllieAvatar from './OllieAvatar'

describe('OllieAvatar', () => {
  it('renderiza o SVG da OLLIE', () => {
    const { container } = render(<OllieAvatar avatarState="neutral" movement="idle" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('aplica classe de movimento correta no container', () => {
    const { container } = render(<OllieAvatar avatarState="neutral" movement="thinking" />)
    expect(container.firstChild).toHaveClass('ollie-thinking')
  })

  it('tem aria-label descrevendo o estado atual', () => {
    render(<OllieAvatar avatarState="empathetic" movement="talking" />)
    const container = screen.getByLabelText(/ollie está empathetic/i)
    expect(container).toBeInTheDocument()
  })

  it('olhos totalmente abertos no estado neutral (ry=23)', () => {
    render(<OllieAvatar avatarState="neutral" movement="idle" />)
    expect(screen.getByTestId('ollie-left-eye')).toHaveAttribute('ry', '23')
    expect(screen.getByTestId('ollie-right-eye')).toHaveAttribute('ry', '23')
  })

  it('olhos squint no estado happy (ry=16)', () => {
    render(<OllieAvatar avatarState="happy" movement="idle" />)
    expect(screen.getByTestId('ollie-left-eye')).toHaveAttribute('ry', '16')
    expect(screen.getByTestId('ollie-right-eye')).toHaveAttribute('ry', '16')
  })

  it('bico de happy tem curva aberta (path com Q)', () => {
    render(<OllieAvatar avatarState="happy" movement="idle" />)
    expect(screen.getByTestId('ollie-beak-lower').getAttribute('d')).toMatch(/Q/)
  })

  it('bico de empathetic tem curva suave', () => {
    render(<OllieAvatar avatarState="empathetic" movement="idle" />)
    expect(screen.getByTestId('ollie-beak-lower').getAttribute('d')).toMatch(/Q/)
  })

  it('grupo da cabeça inclina para thoughtful', () => {
    render(<OllieAvatar avatarState="thoughtful" movement="idle" />)
    const t = screen.getByTestId('ollie-head-group').getAttribute('transform') ?? ''
    expect(t).toMatch(/rotate\(-?[1-9]/)
  })

  it('grupo da cabeça não inclina no neutral', () => {
    render(<OllieAvatar avatarState="neutral" movement="idle" />)
    expect(screen.getByTestId('ollie-head-group')).toHaveAttribute(
      'transform',
      'rotate(0, 100, 78)',
    )
  })
})
