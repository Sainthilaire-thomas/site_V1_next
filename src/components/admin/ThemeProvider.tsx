'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Initialisation du thème au montage
  useEffect(() => {
    const stored = localStorage.getItem('admin-theme') as Theme | null
    const initialTheme = stored || 'light'
    setTheme(initialTheme)

    // Applique le thème immédiatement
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    setMounted(true)
  }, [])

  // Fonction de toggle
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light'

      console.log('Theme toggled from', prevTheme, 'to', newTheme) // Debug

      // Mise à jour du localStorage
      localStorage.setItem('admin-theme', newTheme)

      // Mise à jour de la classe sur <html>
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

      return newTheme
    })
  }

  // Évite le flash pendant l'hydratation
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
