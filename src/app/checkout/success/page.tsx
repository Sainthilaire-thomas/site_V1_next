// src/app/checkout/success/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCartStore()

  const [isLoading, setIsLoading] = useState(true)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Vider le panier après succès
    if (sessionId) {
      clearCart()
      // Simuler une récupération du numéro de commande
      // En production, tu pourrais faire un appel API pour récupérer les détails
      setOrderNumber(`BR-${Date.now().toString().slice(-8)}`)
      setIsLoading(false)
    } else {
      // Pas de session_id = accès direct non autorisé
      router.push('/checkout')
    }
  }, [sessionId, clearCart, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-grey-medium" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <HeaderMinimal />

      <main className="pt-32 pb-24 px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icône de succès */}
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Message de succès */}
          <h1 className="text-section mb-6">.order confirmed</h1>

          <p className="text-body text-grey-medium mb-4">
            Thank you for your purchase! Your payment has been processed
            successfully.
          </p>

          {orderNumber && (
            <p className="text-[13px] tracking-[0.05em] font-semibold lowercase mb-12">
              order number: <span className="text-black">{orderNumber}</span>
            </p>
          )}

          {/* Informations */}
          <div className="bg-grey-lightest p-8 mb-12 text-left">
            <h2 className="text-product mb-6">WHAT'S NEXT?</h2>
            <ul className="space-y-4 text-[13px] tracking-[0.05em] lowercase text-grey-medium">
              <li className="flex items-start gap-3">
                <span className="text-black font-semibold">1.</span>
                <span>
                  You will receive a confirmation email shortly with your order
                  details
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-black font-semibold">2.</span>
                <span>We will prepare your order for shipment</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-black font-semibold">3.</span>
                <span>
                  You'll receive tracking information once your order ships
                </span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/collections">
              <Button
                variant="outline"
                className="w-full sm:w-auto py-3 px-8 text-[13px] tracking-[0.05em] font-semibold lowercase border-black hover:bg-black hover:text-white transition-colors"
              >
                continue shopping
              </Button>
            </Link>
            <Link href="/account/orders">
              <Button className="w-full sm:w-auto py-3 px-8 text-[13px] tracking-[0.05em] font-semibold lowercase bg-black text-white hover:bg-gray-800 transition-colors">
                view order
              </Button>
            </Link>
          </div>

          {/* Note de support */}
          <p className="text-[11px] tracking-[0.05em] lowercase text-grey-medium mt-12">
            need help? contact us at{' '}
            <a
              href="mailto:support@blanche.com"
              className="underline hover:text-black transition-colors"
            >
              support@blanche.com
            </a>
          </p>
        </div>
      </main>

      <FooterMinimal />
    </div>
  )
}
