import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { OwlAvatar } from '../index'

test('renderiza com aria-label descrevendo o estado', () => {
  render(<OwlAvatar state="happy" movement="idle" beakOpen={false} />)
  expect(screen.getByRole('img')).toHaveAccessibleName(/happy/i)
})

test('aplica classe de movimento correto', () => {
  const { container } = render(<OwlAvatar state="neutral" movement="talking" beakOpen={false} />)
  expect(container.firstChild).toHaveClass('owl-talking')
})

test('aplica classe beak-open quando beakOpen=true', () => {
  const { container } = render(<OwlAvatar state="neutral" movement="idle" beakOpen={true} />)
  const beak = container.querySelector('.ollie-beak-bottom')
  expect(beak).toHaveClass('owl-talk')
})

test('renderiza chapéu com borla', () => {
  const { container } = render(<OwlAvatar state="neutral" movement="idle" beakOpen={false} />)
  expect(container.querySelector('#owl-hat')).toBeTruthy()
  expect(container.querySelector('#owl-hat-tassel')).toBeTruthy()
})
