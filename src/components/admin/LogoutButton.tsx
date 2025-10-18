// src/components/admin/LogoutButton.tsx
'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogout() {
    if (!confirm('Voulez-vous vous déconnecter ?')) return

    setIsLoading(true)
    try {
      // ✅ Appel à l'API qui gère la déconnexion côté serveur
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      // ✅ FIX : Rediriger vers la homepage au lieu de /auth/login
      if (response.redirected) {
        // Si l'API a défini une redirection, l'ignorer
        window.location.href = '/'
      } else {
        // Sinon, rediriger manuellement vers la homepage
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout error:', error)
      // ✅ En cas d'erreur, rediriger quand même vers la homepage
      window.location.href = '/'
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Déconnexion"
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="hidden sm:inline">Déconnexion...</span>
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </>
      )}
    </button>
  )
}
