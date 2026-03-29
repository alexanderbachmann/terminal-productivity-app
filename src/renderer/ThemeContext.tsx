import React, { createContext, useContext, useState, useEffect } from 'react'
import { THEMES, DEFAULT_THEME_ID, getThemeById } from './themes'
import type { ThemeDefinition } from './themes'

interface ThemeContextValue {
  themeId: string
  theme: ThemeDefinition
  setThemeId: (id: string) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: DEFAULT_THEME_ID,
  theme: THEMES[0],
  setThemeId: () => {}
})

function applyThemeToDOM(theme: ThemeDefinition): void {
  const root = document.documentElement
  root.style.setProperty('--bg-primary', theme.ui.bgPrimary)
  root.style.setProperty('--bg-secondary', theme.ui.bgSecondary)
  root.style.setProperty('--bg-tertiary', theme.ui.bgTertiary)
  root.style.setProperty('--accent', theme.ui.accent)
  root.style.setProperty('--text-primary', theme.ui.textPrimary)
  root.style.setProperty('--text-secondary', theme.ui.textSecondary)
  root.style.setProperty('--border', theme.ui.border)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState(() => {
    return localStorage.getItem('terminal-app-theme') || DEFAULT_THEME_ID
  })

  const theme = getThemeById(themeId)

  const setThemeId = (id: string) => {
    localStorage.setItem('terminal-app-theme', id)
    setThemeIdState(id)
  }

  useEffect(() => {
    applyThemeToDOM(theme)
  }, [themeId])

  return (
    <ThemeContext.Provider value={{ themeId, theme, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
