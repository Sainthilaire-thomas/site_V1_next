'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-6" />

        <h1 className="text-3xl font-bold mb-4">Paiement annulé</h1>

        <p className="text-gray-600 mb-8">
          Votre commande n'a pas été finalisée. Vous pouvez reprendre votre
          paiement à tout moment depuis votre panier.
        </p>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/cart">Retour au panier</Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/">Continuer mes achats</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
