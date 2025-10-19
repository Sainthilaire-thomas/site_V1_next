// src/components/newsletter/NewsletterSubscribe.tsx
'use client'

import { useState } from 'react'

export function NewsletterSubscribe() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, first_name: firstName }),
      })

      const data = await res.json()

      if (data.success) {
        setStatus('success')
        setMessage('check your inbox to confirm')
        setEmail('')
        setFirstName('')
      } else {
        setStatus('error')
        setMessage(data.error || 'an error occurred')
      }
    } catch (error) {
      setStatus('error')
      setMessage('an error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <h3 className="text-product mb-3">NEWSLETTER</h3>

      <p className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-4">
        stay informed about our latest drops
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Prénom */}
        <input
          type="text"
          placeholder="first name (optional)"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={loading}
          className="w-full px-0 py-2 border-b border-grey-light bg-transparent text-[13px] tracking-[0.05em] font-semibold lowercase text-black placeholder:text-grey-medium focus:outline-none focus:border-black transition-colors disabled:opacity-50"
        />

        {/* Email + Bouton */}
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="flex-1 px-0 py-2 border-b border-grey-light bg-transparent text-[13px] tracking-[0.05em] font-semibold lowercase text-black placeholder:text-grey-medium focus:outline-none focus:border-black transition-colors disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading}
            className="text-[13px] tracking-[0.05em] font-bold lowercase hover:text-violet transition-colors disabled:opacity-50"
            style={{ color: loading ? 'hsl(0 0% 50%)' : 'hsl(271 74% 37%)' }}
          >
            {loading ? '...' : '→'}
          </button>
        </div>

        {/* Message de statut */}
        {status !== 'idle' && (
          <p
            className={`text-[11px] tracking-[0.05em] font-semibold lowercase ${
              status === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}
      </form>

      {/* Mention RGPD */}
      <p className="text-[10px] tracking-[0.05em] lowercase text-grey-medium mt-3">
        by subscribing, you accept our{' '}
        <a
          href="/privacy"
          className="underline hover:text-black transition-colors"
        >
          privacy policy
        </a>
      </p>
    </div>
  )
}
