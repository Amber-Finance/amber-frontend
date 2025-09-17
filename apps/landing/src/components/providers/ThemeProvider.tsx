'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'dark' | 'light'
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'dark',
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

// Helper to safely check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Only try to access localStorage in browser environment
    if (isBrowser) {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme
    }
    return defaultTheme
  })

  // Track the resolved theme (what's actually applied)
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light')

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    let appliedTheme: 'light' | 'dark'

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      appliedTheme = systemTheme
    } else {
      root.classList.add(theme)
      appliedTheme = theme as 'light' | 'dark'
    }

    // Set the resolved theme
    setResolvedTheme(appliedTheme)
  }, [theme])

  // Add listener for system preference changes
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      const root = window.document.documentElement
      const systemTheme = mediaQuery.matches ? 'dark' : 'light'

      root.classList.remove('light', 'dark')
      root.classList.add(systemTheme)
      setResolvedTheme(systemTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      // Only try to use localStorage in browser environment
      if (isBrowser) {
        localStorage.setItem(storageKey, theme)
      }
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
