'use client'

import { useState, useEffect } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Initialisation - NE RIEN FAIRE avant le montage
  useEffect(() => {
    // Lire le localStorage
    const stored = localStorage.getItem('admin-theme') as
      | 'light'
      | 'dark'
      | null

    // Si rien dans localStorage, rester en light (défaut)
    // Si dark dans localStorage, passer en dark
    const initialTheme = stored || 'light'

    console.log('🎨 Theme initialization:', {
      stored,
      initialTheme,
      willSetDark: initialTheme === 'dark',
    })

    setTheme(initialTheme)

    // Appliquer SEULEMENT si dark
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark')
      console.log('✅ Dark mode activated')
    } else {
      // S'assurer que dark est retiré si on est en light
      document.documentElement.classList.remove('dark')
      console.log('✅ Light mode activated')
    }

    setMounted(true)
  }, [])

  // Toggle
  const toggleTheme = () => {
    console.log('🔄 Toggle clicked! Current theme:', theme)

    const newTheme = theme === 'light' ? 'dark' : 'light'

    console.log('📝 Saving new theme:', newTheme)
    setTheme(newTheme)
    localStorage.setItem('admin-theme', newTheme)

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      console.log('🌙 Switched to dark mode')
    } else {
      document.documentElement.classList.remove('dark')
      console.log('☀️ Switched to light mode')
    }
  }

  if (!mounted) {
    return <div className="w-10 h-10" /> // Placeholder
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
      type="button"
    >
      {theme === 'light' ? (
        // Icône Lune (mode light)
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        // Icône Soleil (mode dark)
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  )
}
