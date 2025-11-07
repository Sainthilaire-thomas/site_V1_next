'use client'

// src/components/checkout/PayPalButtons.tsx
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'

interface PayPalButtonsWrapperProps {
  items: any[]
  shippingAddress: any
  billingAddress: any
  customerEmail?: string
  customerName?: string
  shippingCost?: number
  onSuccess?: () => void
}

export function PayPalButtonsWrapper({
  items,
  shippingAddress,
  billingAddress,
  customerEmail,
  customerName,
  shippingCost,
  onSuccess,
}: PayPalButtonsWrapperProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: 'EUR',
    intent: 'capture',
    locale: 'fr_FR',
  }

  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-sm text-red-600">
          ⚠️ Configuration PayPal manquante. Veuillez configurer
          NEXT_PUBLIC_PAYPAL_CLIENT_ID
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {isProcessing && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600">
            ⏳ Traitement du paiement en cours...
          </p>
        </div>
      )}

      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'black',
            shape: 'rect',
            label: 'pay',
            height: 48,
          }}
          disabled={isProcessing}
          createOrder={async () => {
            try {
              setIsProcessing(true)
              console.log('🔵 Creating PayPal order...')

              const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  items,
                  shippingAddress,
                  billingAddress,
                  customerEmail,
                  customerName,
                  shippingCost,
                }),
              })

              const data = await response.json()

              if (!response.ok) {
                throw new Error(data.error || 'Failed to create order')
              }

              console.log('✅ Order created:', data.orderNumber)
              return data.orderID
            } catch (error: any) {
              console.error('❌ Error creating order:', error)
              toast.error('Erreur lors de la création de la commande')
              setIsProcessing(false)
              throw error
            }
          }}
          onApprove={async (data) => {
            try {
              console.log('🔵 Payment approved, capturing...')

              const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderID: data.orderID }),
              })

              const captureData = await response.json()

              if (!response.ok) {
                throw new Error(captureData.error || 'Failed to capture order')
              }

              console.log('✅ Payment captured:', captureData.orderNumber)

              toast.success('Paiement réussi ! Commande confirmée.')

              // ✅ CORRECTION : Rediriger IMMÉDIATEMENT
              router.push(
                '/checkout-test/success?order=' + captureData.orderNumber
              )

              // ✅ Vider le panier APRÈS un court délai
              setTimeout(() => {
                if (onSuccess) {
                  onSuccess()
                }
              }, 500)
            } catch (error: any) {
              console.error('❌ Error capturing order:', error)
              toast.error('Erreur lors de la validation du paiement')
              setIsProcessing(false)
            }
          }}
          onError={(error) => {
            console.error('❌ PayPal error:', error)
            toast.error('Une erreur est survenue avec PayPal')
            setIsProcessing(false)
          }}
          onCancel={() => {
            console.log('⚠️ Payment cancelled by user')
            toast.info('Paiement annulé')
            setIsProcessing(false)
          }}
        />
      </PayPalScriptProvider>
    </div>
  )
}
