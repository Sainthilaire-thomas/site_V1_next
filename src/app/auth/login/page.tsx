'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (mode === 'signup') {
      const { error } = await supabaseBrowser.auth.signUp({ email, password })
      if (error) return setError(error.message)
    } else {
      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      })
      if (error) return setError(error.message)
    }

    // crée le profil si absent (voir route ci-dessous)
    await fetch('/api/auth/ensure-profile', { method: 'POST' }).catch(() => {})
    router.push('/admin/products')
    router.refresh()
  }

  return (
    <div className="max-w-sm mx-auto mt-16 space-y-4">
      <h1 className="text-2xl font-semibold">
        {mode === 'signin' ? 'Connexion' : 'Créer un compte'}
      </h1>

      <form onSubmit={onSubmit} className="grid gap-3">
        <input
          className="border p-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="border rounded px-4 py-2">
          {mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
        </button>
      </form>

      <button
        className="text-sm underline"
        onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
      >
        {mode === 'signin'
          ? "Pas de compte ? S'inscrire"
          : 'Déjà un compte ? Se connecter'}
      </button>
    </div>
  )
}
