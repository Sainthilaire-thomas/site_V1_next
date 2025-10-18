'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    // ✅ Empêcher les double-clics
    if (isLoading) return

    setError(null)
    setIsLoading(true)

    try {
      if (mode === 'signup') {
        // === INSCRIPTION ===
        const { error } = await supabaseBrowser.auth.signUp({
          email,
          password,
        })

        if (error) {
          setError(error.message)
          return
        }

        // Créer le profil
        await fetch('/api/auth/ensure-profile', { method: 'POST' }).catch(
          () => {}
        )

        // ✅ Redirection client après inscription
        router.push('/account')
        router.refresh()
        return
      }

      // === CONNEXION ===
      const { error: signInError } =
        await supabaseBrowser.auth.signInWithPassword({
          email,
          password,
        })

      if (signInError) {
        setError(signInError.message)
        return
      }

      // Créer le profil si absent
      await fetch('/api/auth/ensure-profile', { method: 'POST' }).catch(
        () => {}
      )

      // ✅ Vérifier le rôle avant redirection
      const { data: profile } = await supabaseBrowser
        .from('profiles')
        .select('role')
        .single()

      // ✅ Redirection intelligente selon le rôle
      if (profile?.role === 'admin') {
        router.push('/admin/products')
      } else {
        router.push('/account')
      }

      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-light tracking-tight text-black dark:text-white">
            .blancherenaudin
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {mode === 'signin' ? 'Connexion à votre compte' : 'Créer un compte'}
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-violet focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-violet focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              required
            />
          </div>

          {/* ✅ Affichage des erreurs */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
              ❌ {error}
            </div>
          )}

          {/* ✅ Bouton avec état de chargement */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-violet text-white py-3 rounded-lg hover:bg-violet/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
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
                <span>
                  {mode === 'signin' ? 'Connexion...' : 'Inscription...'}
                </span>
              </>
            ) : (
              <span>{mode === 'signin' ? 'Se connecter' : "S'inscrire"}</span>
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="text-center">
          <button
            type="button"
            onClick={() =>
              setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
            }
            disabled={isLoading}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet transition-colors disabled:opacity-50"
          >
            {mode === 'signin'
              ? "Pas encore de compte ? S'inscrire"
              : 'Déjà un compte ? Se connecter'}
          </button>
        </div>

        {/* Lien admin */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-slate-700">
          <a
            href="/admin/login"
            className="text-xs text-gray-500 dark:text-gray-500 hover:text-violet transition-colors"
          >
            Accès administrateur →
          </a>
        </div>
      </div>
    </div>
  )
}
