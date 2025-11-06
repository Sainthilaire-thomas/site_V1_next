// src/app/checkout/success/page.tsx
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string }
}) {
  const orderNumber = searchParams.order

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icône de succès */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold mb-4 font-['Archivo_Black'] uppercase tracking-[0.05em]">
          Paiement réussi
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-2 font-['Archivo_Narrow']">
          Votre commande a été confirmée avec succès.
        </p>

        {orderNumber && (
          <p className="text-sm text-gray-500 mb-8">
            Numéro de commande :{' '}
            <span className="font-semibold">{orderNumber}</span>
          </p>
        )}

        {/* Informations */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left">
          <h2 className="font-semibold mb-3 text-sm uppercase tracking-wider">
            Prochaines étapes
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">✉️</span>
              <span>Un email de confirmation a été envoyé</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📦</span>
              <span>Nous préparons votre commande</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🚚</span>
              <span>Vous recevrez un email de suivi d'expédition</span>
            </li>
          </ul>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-[hsl(271,74%,37%)] hover:bg-[hsl(271,74%,30%)] text-white"
          >
            <Link href="/account/orders">Voir ma commande</Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
