'use client'

// src/components/checkout/PayPalButtons.tsx
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { PAYPAL_CONFIG, logPayPalEnvironment } from '@/lib/paypal-config'

interface PayPalButtonsWrapperProps {
  items: any[]
  shippingAddress: any
  billingAddress: any
  customerEmail?: string
  customerName?: string
  onSuccess?: () => void
}

export function PayPalButtonsWrapper({
  items,
  shippingAddress,
  billingAddress,
  customerEmail,
  customerName,
  onSuccess,
}: PayPalButtonsWrapperProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const initialOptions = {
    clientId: PAYPAL_CONFIG.clientId, // ✅ MODIFIÉ
    currency: 'EUR',
    intent: 'capture',
  }

  if (!PAYPAL_CONFIG.clientId) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-sm text-red-600">
          ⚠️ Configuration PayPal manquante. Veuillez configurer
          NEXT_PUBLIC_PAYPAL_CLIENT_ID
        </p>
      </div>
    )
  }

  useEffect(() => {
    logPayPalEnvironment()
  }, [])

  return (
    <div className="w-full">
      {isProcessing && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600">
            ⏳ Traitement du paiement en cours...
          </p>
        </div>
      )}

      {PAYPAL_CONFIG.isSandbox && (
        <div className="mb-4 px-3 py-2 bg-yellow-100 border border-yellow-400 text-yellow-800 text-xs rounded-lg font-medium">
          🧪 Mode Sandbox - Paiements de test uniquement
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

              if (onSuccess) {
                onSuccess()
              }

              // Redirection après 1 seconde
              setTimeout(() => {
                router.push(
                  '/checkout/success?order=' + captureData.orderNumber
                )
              }, 1000)
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
