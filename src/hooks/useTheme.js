import { useEffect, useState } from 'react'

const STORAGE_KEY = 'studio-pilot-theme'

function getStartingTheme() {
  const savedTheme = window.localStorage.getItem(STORAGE_KEY)

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState(getStartingTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme() {
      setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
    },
  }
}
