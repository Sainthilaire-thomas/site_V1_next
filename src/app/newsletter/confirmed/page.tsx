// src/app/newsletter/confirmed/page.tsx
'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function NewsletterConfirmedPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  // Si erreur, afficher un message d'erreur
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="max-w-md text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-4 text-red-600">Erreur</h1>

          <p className="text-gray-600 mb-8">
            {error === 'expired' && 'Le lien de confirmation a expiré.'}
            {error === 'invalid_token' &&
              'Le lien de confirmation est invalide.'}
            {error === 'missing_token' &&
              'Le lien de confirmation est incomplet.'}
            {error === 'database' &&
              'Une erreur est survenue. Réessayez plus tard.'}
            {![
              'expired',
              'invalid_token',
              'missing_token',
              'database',
            ].includes(error) && 'Une erreur inconnue est survenue.'}
          </p>

          <Link
            href="/"
            className="inline-block px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  // Succès
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4">Merci !</h1>

        <p className="text-gray-600 mb-8">
          Votre inscription à la newsletter est confirmée.
          <br />
          Vous recevrez bientôt nos actualités et offres exclusives.
        </p>

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
