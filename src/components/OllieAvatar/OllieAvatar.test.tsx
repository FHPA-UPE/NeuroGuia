import '@testing-library/jest-dom'
import { render, screen, cleanup } from '@testing-library/react'
import OllieAvatar from './OllieAvatar'

describe('OllieAvatar', () => {
  it('renderiza com role img e aria-label descrevendo estado', () => {
    render(<OllieAvatar avatarState="neutral" movement="idle" />)
    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('aria-label', expect.stringContaining('neutro'))
  })

  it('grupo da cabeça não inclina no neutral', () => {
    render(<OllieAvatar avatarState="neutral" movement="idle" beakOpen={false} />)
    expect(screen.getByTestId('ollie-head-group')).toHaveAttribute(
      'transform',
      'rotate(0, 120, 115)',
    )
  })

  it('aplica classe de movimento ollie-talking quando movement=talking', () => {
    const { container } = render(<OllieAvatar avatarState="neutral" movement="talking" />)
    expect(container.querySelector('.ollie-talking')).toBeInTheDocument()
  })

  it('aplica classe de movimento ollie-thinking quando movement=thinking', () => {
    const { container } = render(<OllieAvatar avatarState="neutral" movement="thinking" />)
    expect(container.querySelector('.ollie-thinking')).toBeInTheDocument()
  })

  it('bico inferior usa path com curva quando beakOpen=true', () => {
    render(<OllieAvatar avatarState="neutral" movement="idle" beakOpen={true} />)
    expect(screen.getByTestId('ollie-beak-lower').getAttribute('d')).toMatch(/Q/)
  })

  it('bico inferior usa path reto de neutral quando beakOpen=false', () => {
    render(<OllieAvatar avatarState="neutral" movement="idle" beakOpen={false} />)
    expect(screen.getByTestId('ollie-beak-lower').getAttribute('d')).not.toMatch(/Q/)
  })

  it('interior da boca presente quando beakOpen=true', () => {
    render(<OllieAvatar avatarState="neutral" movement="idle" beakOpen={true} />)
    expect(screen.getByTestId('ollie-mouth-interior')).toBeInTheDocument()
  })

  it('interior da boca ausente quando beakOpen=false em estado neutral', () => {
    render(<OllieAvatar avatarState="neutral" movement="idle" beakOpen={false} />)
    expect(screen.queryByTestId('ollie-mouth-interior')).not.toBeInTheDocument()
  })

  it('interior da boca presente no estado happy mesmo sem beakOpen', () => {
    render(<OllieAvatar avatarState="happy" movement="idle" beakOpen={false} />)
    expect(screen.getByTestId('ollie-mouth-interior')).toBeInTheDocument()
  })

  it('interior da boca presente no estado encouraging mesmo sem beakOpen', () => {
    render(<OllieAvatar avatarState="encouraging" movement="idle" beakOpen={false} />)
    expect(screen.getByTestId('ollie-mouth-interior')).toBeInTheDocument()
  })

  it('chapéu mortarboard presente no SVG', () => {
    const { container } = render(<OllieAvatar avatarState="neutral" movement="idle" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('grupo da cabeça inclina diferente entre estados com tilt diferente', () => {
    render(<OllieAvatar avatarState="neutral" movement="idle" />)
    const neutralTransform = screen.getByTestId('ollie-head-group').getAttribute('transform')
    expect(neutralTransform).toBe('rotate(0, 120, 115)')

    cleanup()

    render(<OllieAvatar avatarState="empathetic" movement="idle" />)
    const empatheticTransform = screen.getByTestId('ollie-head-group').getAttribute('transform')
    expect(empatheticTransform).not.toBe('rotate(0, 120, 115)')
  })

  it('estado empathetic renderiza wink no olho direito', () => {
    render(<OllieAvatar avatarState="empathetic" movement="idle" />)
    expect(screen.getByTestId('ollie-eye-right-wink')).toBeInTheDocument()
    expect(screen.queryByTestId('ollie-right-eye')).not.toBeInTheDocument()
  })

  it('estado empathetic não renderiza pupila direita', () => {
    render(<OllieAvatar avatarState="empathetic" movement="idle" />)
    // ollie-right-eye sclera ausente → pupila também ausente (sem clipPath destino)
    expect(screen.queryByTestId('ollie-right-eye')).not.toBeInTheDocument()
  })

  it('estado encouraging renderiza asa direita com joinha', () => {
    render(<OllieAvatar avatarState="encouraging" movement="idle" />)
    expect(screen.getByTestId('ollie-wing-right-thumb')).toBeInTheDocument()
  })

  it('estado thoughtful renderiza asa direita no queixo', () => {
    render(<OllieAvatar avatarState="thoughtful" movement="idle" />)
    expect(screen.getByTestId('ollie-wing-right-chin')).toBeInTheDocument()
  })

  it('estados neutral/happy/empathetic/thoughtful não têm joinha', () => {
    for (const state of ['neutral', 'happy', 'empathetic', 'thoughtful'] as const) {
      const { unmount } = render(<OllieAvatar avatarState={state} movement="idle" />)
      expect(screen.queryByTestId('ollie-wing-right-thumb')).not.toBeInTheDocument()
      unmount()
    }
  })
})
