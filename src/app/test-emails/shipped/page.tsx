'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function TestShippedEmail() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const sendTestEmail = async () => {
    if (!email) {
      toast.error('Email requis')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/test/send-shipped', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast.success('Email envoyé !')
      } else {
        toast.error('Erreur')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-16">
      <h1 className="text-2xl font-bold mb-4">Test Email d'Expédition</h1>
      <div className="space-y-4">
        <Input
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={sendTestEmail} disabled={loading} className="w-full">
          {loading ? 'Envoi...' : "Envoyer l'email de test"}
        </Button>
      </div>
    </div>
  )
}
