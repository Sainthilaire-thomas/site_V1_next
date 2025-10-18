// src/app/auth/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const redirectTo = searchParams.get('redirect') || '/account'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (isLogin) {
        // Connexion
        const { error: signInError } =
          await supabaseBrowser.auth.signInWithPassword({
            email,
            password,
          })

        if (signInError) {
          setError(signInError.message)
          setIsLoading(false)
          return
        }

        router.push(redirectTo)
        router.refresh()
      } else {
        // Inscription
        if (password !== confirmPassword) {
          setError('Les mots de passe ne correspondent pas')
          setIsLoading(false)
          return
        }

        const { error: signUpError } = await supabaseBrowser.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          setIsLoading(false)
          return
        }

        // Créer le profil après l'inscription
        await fetch('/api/auth/ensure-profile', { method: 'POST' })

        router.push('/account')
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-[32px] font-light tracking-tight text-black">
            .blancherenaudin
          </h1>
          <p className="text-[13px] text-grey-medium mt-2">
            Connexion à votre compte
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-grey-light">
          <button
            onClick={() => {
              setIsLogin(true)
              setError(null)
            }}
            className={`flex-1 py-3 text-[13px] tracking-[0.05em] lowercase transition-colors ${
              isLogin
                ? 'border-b-2 border-black text-black font-semibold'
                : 'text-grey-medium hover:text-black'
            }`}
          >
            Se connecter
          </button>
          <button
            onClick={() => {
              setIsLogin(false)
              setError(null)
            }}
            className={`flex-1 py-3 text-[13px] tracking-[0.05em] lowercase transition-colors ${
              !isLogin
                ? 'border-b-2 border-black text-black font-semibold'
                : 'text-grey-medium hover:text-black'
            }`}
          >
            S'inscrire
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-[11px] tracking-[0.1em] uppercase text-grey-medium mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-grey-light bg-white text-black text-[15px] focus:border-black focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[11px] tracking-[0.1em] uppercase text-grey-medium mb-2"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-grey-light bg-white text-black text-[15px] focus:border-black focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {!isLogin && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[11px] tracking-[0.1em] uppercase text-grey-medium mb-2"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-grey-light bg-white text-black text-[15px] focus:border-black focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                required
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-[13px]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-violet text-white text-[13px] tracking-[0.05em] font-semibold lowercase hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
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
                {isLogin ? 'Connexion...' : 'Inscription...'}
              </span>
            ) : isLogin ? (
              'Se connecter'
            ) : (
              "S'inscrire"
            )}
          </button>
        </form>

        {/* ✅ LIEN ADMIN RETIRÉ */}
        {/* Plus de lien vers /admin/login pour des raisons de sécurité */}
      </div>
    </div>
  )
}
