import { useState, useEffect } from 'react'

export function useSidebarState(key: string, defaultCollapsed = true) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      setCollapsed(stored === 'true')
    }
    setMounted(true)
  }, [key])

  const toggle = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem(key, String(newState))
  }

  return { collapsed, toggle, mounted }
}
