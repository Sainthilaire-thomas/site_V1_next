// src/app/checkout/cancel/page.tsx
import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icône d'annulation */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-orange-600" />
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold mb-4 font-['Archivo_Black'] uppercase tracking-[0.05em]">
          Paiement annulé
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8 font-['Archivo_Narrow']">
          Vous avez annulé le paiement. Aucun montant n'a été débité.
        </p>

        {/* Informations */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left">
          <h2 className="font-semibold mb-3 text-sm uppercase tracking-wider">
            Que s'est-il passé ?
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Votre commande n'a pas été finalisée. Les articles restent dans
            votre panier.
          </p>
          <p className="text-sm text-gray-600">
            Si vous avez rencontré un problème, n'hésitez pas à nous contacter.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-[hsl(271,74%,37%)] hover:bg-[hsl(271,74%,30%)] text-white"
          >
            <Link href="/cart">Retour au panier</Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/">Continuer mes achats</Link>
          </Button>

          <Button asChild variant="ghost" className="w-full text-sm">
            <Link href="/contact">Contactez-nous</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
