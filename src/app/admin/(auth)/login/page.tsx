'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    // ✅ Empêcher double-clic
    if (isLoading) return

    setError(null)
    setIsLoading(true)

    try {
      // 1. Connexion Supabase Auth
      const { error: authError } =
        await supabaseBrowser.auth.signInWithPassword({
          email,
          password,
        })

      if (authError) {
        setError(authError.message)
        return
      }

      // 2. Vérifier le rôle admin
      const { data: profile } = await supabaseBrowser
        .from('profiles')
        .select('role')
        .single()

      if (profile?.role !== 'admin') {
        // Déconnecter l'utilisateur non-admin
        await supabaseBrowser.auth.signOut()
        setError(
          '❌ Accès refusé : vous devez être administrateur pour accéder à cette section.'
        )
        return
      }

      // 3. Redirection admin
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      console.error('Admin login error:', err)
      setError(err?.message || 'Une erreur est survenue lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-slate-900 rounded-lg shadow-lg border-2 border-violet/20">
        {/* Header avec badge admin */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet/10 text-violet rounded-full text-sm font-medium">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Accès Administrateur
          </div>

          <h1 className="text-3xl font-light tracking-tight text-black dark:text-white">
            .blancherenaudin
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connexion réservée aux administrateurs
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100"
            >
              Email administrateur
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@blancherenaudin.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
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
              autoComplete="current-password"
              className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-violet focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              required
            />
          </div>

          {/* ✅ Affichage des erreurs */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* ✅ Bouton avec spinner */}
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
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span>Se connecter</span>
              </>
            )}
          </button>
        </form>

        {/* Lien client */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vous n'êtes pas administrateur ?{' '}
            <Link
              href="/auth/login"
              className="text-violet hover:underline font-medium"
            >
              Connexion client
            </Link>
          </p>
        </div>

        {/* Instructions pour le premier admin */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <details className="text-xs text-blue-800 dark:text-blue-200">
            <summary className="cursor-pointer font-medium mb-2">
              💡 Comment créer le premier compte admin ?
            </summary>
            <ol className="list-decimal list-inside space-y-1 mt-2 text-blue-700 dark:text-blue-300">
              <li>
                Créer un compte via la{' '}
                <Link href="/auth/login" className="underline">
                  page client
                </Link>
              </li>
              <li>Aller dans Supabase Dashboard → Table "profiles"</li>
              <li>
                Modifier le champ "role" :{' '}
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                  customer
                </code>{' '}
                →{' '}
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                  admin
                </code>
              </li>
              <li>Se déconnecter et reconnecter ici</li>
            </ol>
          </details>
        </div>
      </div>
    </div>
  )
}
