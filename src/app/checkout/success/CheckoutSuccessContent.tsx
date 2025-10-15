// src/app/checkout/success/CheckoutSuccessContent.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import { CheckCircle, Loader2 } from 'lucide-react'
import type { Order, OrderItem } from '@/lib/types'

interface OrderData {
  order: Order
  items: OrderItem[]
}

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCartStore()

  const [isLoading, setIsLoading] = useState(true)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!sessionId) {
        router.push('/checkout')
        return
      }

      try {
        const response = await fetch(`/api/orders/by-session/${sessionId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch order')
        }

        const data: OrderData = await response.json()
        setOrderData(data)
        clearCart()
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching order:', error)
        setError('Unable to load order details')
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [sessionId, clearCart, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-grey-medium" />
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-white">
        <HeaderMinimal />
        <main className="pt-32 pb-24 px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-section mb-6">.error</h1>
            <p className="text-body text-grey-medium mb-12">
              {error || 'Unable to load order details'}
            </p>
            <Link href="/">
              <Button
                variant="outline"
                className="py-3 px-8 text-[13px] tracking-[0.05em] font-semibold lowercase border-black hover:bg-black hover:text-white transition-colors"
              >
                continue shopping
              </Button>
            </Link>
          </div>
        </main>
        <FooterMinimal />
      </div>
    )
  }

  const { order, items } = orderData

  return (
    <div className="min-h-screen bg-white">
      <HeaderMinimal />

      <main className="pt-32 pb-24 px-8">
        <div className="max-w-3xl mx-auto">
          {/* En-tête centré */}
          <div className="text-center mb-12">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <h1 className="text-section mb-6">.order confirmed</h1>

            <p className="text-body text-grey-medium mb-4">
              Thank you for your purchase! Your payment has been processed
              successfully.
            </p>

            <p className="text-[13px] tracking-[0.05em] font-semibold lowercase mb-8">
              order number:{' '}
              <span className="text-black">{order.order_number}</span>
            </p>
          </div>

          {/* Liste des produits commandés */}
          {items.length > 0 && (
            <div className="mb-12 border-t border-b border-grey-light py-8">
              <h2 className="text-product mb-6">YOUR ORDER</h2>
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {/* Image produit */}
                    <div className="w-24 h-32 flex-shrink-0 bg-grey-lightest">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-grey-medium text-xs">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Détails produit */}
                    <div className="flex-1">
                      <h3 className="text-product mb-1">
                        {item.product_name || 'Product'}
                      </h3>
                      {item.variant_name && (
                        <p className="text-[11px] tracking-[0.05em] lowercase text-grey-medium mb-2">
                          {item.variant_name}
                        </p>
                      )}
                      <p className="text-[11px] tracking-[0.05em] lowercase text-grey-medium">
                        quantity: {item.quantity}
                      </p>
                    </div>

                    {/* Prix */}
                    <div className="text-right">
                      <p className="text-[13px] tracking-[0.05em] font-semibold">
                        €{Number(item.total_price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-6 border-t border-grey-light flex justify-between items-center">
                <span className="text-product">TOTAL</span>
                <span className="text-[15px] tracking-[0.05em] font-bold">
                  €{Number(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Informations */}
          <div className="bg-grey-lightest p-8 mb-12">
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
          <div className="flex justify-center">
            <Link href="/">
              <Button
                variant="outline"
                className="py-3 px-8 text-[13px] tracking-[0.05em] font-semibold lowercase border-black hover:bg-black hover:text-white transition-colors"
              >
                continue shopping
              </Button>
            </Link>
          </div>

          {/* Note de support */}
          <p className="text-[11px] tracking-[0.05em] lowercase text-grey-medium mt-12 text-center">
            need help? contact us at{' '}
            <a
              href="mailto:contact@blancherenaudin.com"
              className="underline hover:text-black transition-colors"
            >
              contact@blancherenaudin.com
            </a>
          </p>
        </div>
      </main>

      <FooterMinimal />
    </div>
  )
}
