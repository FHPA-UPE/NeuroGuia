import { renderHook, act } from '@testing-library/react'
import { useTTS } from './useTTS'

const mockSpeak  = jest.fn()
const mockCancel = jest.fn()

type MockUtterance = {
  lang:        string
  rate:        number
  pitch:       number
  onstart:     (() => void) | null
  onend:       (() => void) | null
  onerror:     (() => void) | null
  onboundary:  ((e: { name: string }) => void) | null
}

let capturedUtterance: MockUtterance | null = null

beforeEach(() => {
  jest.useFakeTimers()
  capturedUtterance = null
  mockSpeak.mockClear()
  mockCancel.mockClear()

  Object.defineProperty(window, 'speechSynthesis', {
    value:        { speak: mockSpeak, cancel: mockCancel },
    writable:     true,
    configurable: true,
  })

  ;(global as typeof globalThis & { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
    jest.fn().mockImplementation(() => {
      capturedUtterance = {
        lang: '', rate: 1, pitch: 1,
        onstart: null, onend: null, onerror: null, onboundary: null,
      }
      return capturedUtterance
    })
})

afterEach(() => {
  jest.useRealTimers()
})

describe('useTTS', () => {
  it('não chama speak quando text é null', () => {
    renderHook(() => useTTS(null))
    expect(mockSpeak).not.toHaveBeenCalled()
  })

  it('chama speak quando text não é null', () => {
    renderHook(() => useTTS('Olá'))
    expect(mockSpeak).toHaveBeenCalledTimes(1)
  })

  it('configura lang=pt-BR, rate=0.95, pitch=1.1', () => {
    renderHook(() => useTTS('Olá'))
    expect(capturedUtterance!.lang).toBe('pt-BR')
    expect(capturedUtterance!.rate).toBe(0.95)
    expect(capturedUtterance!.pitch).toBe(1.1)
  })

  it('isSpeaking começa false', () => {
    const { result } = renderHook(() => useTTS(null))
    expect(result.current.isSpeaking).toBe(false)
  })

  it('isSpeaking vira true em onstart', () => {
    const { result } = renderHook(() => useTTS('Olá'))
    act(() => { capturedUtterance!.onstart?.() })
    expect(result.current.isSpeaking).toBe(true)
  })

  it('isSpeaking vira false em onend', () => {
    const { result } = renderHook(() => useTTS('Olá'))
    act(() => { capturedUtterance!.onstart?.() })
    act(() => { capturedUtterance!.onend?.() })
    expect(result.current.isSpeaking).toBe(false)
  })

  it('isSpeaking vira false em onerror', () => {
    const { result } = renderHook(() => useTTS('Olá'))
    act(() => { capturedUtterance!.onstart?.() })
    act(() => { capturedUtterance!.onerror?.() })
    expect(result.current.isSpeaking).toBe(false)
  })

  it('beakOpen vira true em onboundary do tipo word', () => {
    const { result } = renderHook(() => useTTS('Olá mundo'))
    act(() => { capturedUtterance!.onstart?.() })
    act(() => { capturedUtterance!.onboundary?.({ name: 'word' }) })
    expect(result.current.beakOpen).toBe(true)
  })

  it('beakOpen vira false após 180ms', () => {
    const { result } = renderHook(() => useTTS('Olá mundo'))
    act(() => { capturedUtterance!.onstart?.() })
    act(() => { capturedUtterance!.onboundary?.({ name: 'word' }) })
    act(() => { jest.advanceTimersByTime(180) })
    expect(result.current.beakOpen).toBe(false)
  })

  it('onboundary do tipo sentence não abre o bico', () => {
    const { result } = renderHook(() => useTTS('Frase.'))
    act(() => { capturedUtterance!.onstart?.() })
    act(() => { capturedUtterance!.onboundary?.({ name: 'sentence' }) })
    expect(result.current.beakOpen).toBe(false)
  })

  it('beakOpen vira false em onend mesmo que estivesse true', () => {
    const { result } = renderHook(() => useTTS('Olá'))
    act(() => { capturedUtterance!.onstart?.() })
    act(() => { capturedUtterance!.onboundary?.({ name: 'word' }) })
    act(() => { capturedUtterance!.onend?.() })
    expect(result.current.beakOpen).toBe(false)
  })

  it('ativa fallback interval após 600ms sem onboundary', () => {
    const { result } = renderHook(() => useTTS('Olá'))
    act(() => { capturedUtterance!.onstart?.() })
    act(() => { jest.advanceTimersByTime(600) })
    act(() => { jest.advanceTimersByTime(350) })
    expect(result.current.beakOpen).toBe(true)
    act(() => { jest.advanceTimersByTime(350) })
    expect(result.current.beakOpen).toBe(false)
  })

  it('cancela fala anterior ao receber novo text', () => {
    const { rerender } = renderHook(
      ({ text }: { text: string | null }) => useTTS(text),
      { initialProps: { text: 'Texto 1' as string | null } },
    )
    rerender({ text: 'Texto 2' })
    expect(mockCancel).toHaveBeenCalled()
    expect(mockSpeak).toHaveBeenCalledTimes(2)
  })

  it('cancela fala quando text vira null', () => {
    const { rerender } = renderHook(
      ({ text }: { text: string | null }) => useTTS(text),
      { initialProps: { text: 'Texto 1' as string | null } },
    )
    rerender({ text: null })
    expect(mockCancel).toHaveBeenCalled()
  })

  it('guard: retorna valores padrão quando speechSynthesis indisponível', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: undefined, writable: true, configurable: true,
    })
    const { result } = renderHook(() => useTTS('Olá'))
    expect(result.current.isSpeaking).toBe(false)
    expect(result.current.beakOpen).toBe(false)
  })
})
