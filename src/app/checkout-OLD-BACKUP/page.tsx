// src/app/checkout/page.tsx - ULTRA-SIMPLE ENGLISH VERSION
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/useCartStore'
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import { Heart } from 'lucide-react'

export default function CheckoutPage() {
  const { items, totalPrice } = useCartStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('🔘 Form submitted!')

    if (isLoading) {
      console.log('⚠️ Already loading')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      console.log('📡 Sending to API...')

      const response = await fetch(
        `${window.location.origin}/api/launch-notifications`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            cartItems: items.map((item) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            cartTotal: totalPrice,
            timestamp: new Date().toISOString(),
          }),
        }
      )

      console.log('📬 Response status:', response.status)

      if (!response.ok) {
        throw new Error('API error')
      }

      const data = await response.json()
      console.log('✅ Success!', data)

      setIsSubmitted(true)
    } catch (error: any) {
      console.error('❌ Error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-sm">loading...</div>
      </div>
    )
  }

  // Thank you page
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <HeaderMinimal />
        <main className="pt-32 pb-24 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-violet/10 flex items-center justify-center">
                <Heart className="w-10 h-10 text-violet" />
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-6 lowercase">.thank you</h1>

            <p className="text-base text-gray-600 mb-8">
              Your interest means everything to us.
              <br />
              We'll notify you by email as soon as payment becomes available.
            </p>

            <p className="text-sm font-semibold lowercase mb-12">
              expected launch: within few days
            </p>

            <Link
              href="/"
              className="inline-block py-3 px-8 text-sm font-semibold lowercase bg-black text-white hover:bg-gray-800 transition-colors"
            >
              back to home
            </Link>

            <p className="text-xs text-gray-500 mt-12">
              Questions? Contact us at{' '}
              <a
                href="mailto:contact@blancherenaudin.com"
                className="underline hover:text-black"
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

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <HeaderMinimal />
        <main className="pt-32 pb-24 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6 lowercase">.empty cart</h1>
            <p className="text-base text-gray-600 mb-12">
              Your cart is empty. Please add items before proceeding.
            </p>
            <Link
              href="/products"
              className="inline-block py-3 px-8 text-sm font-semibold lowercase border border-black hover:bg-black hover:text-white transition-colors"
            >
              view collections
            </Link>
          </div>
        </main>
        <FooterMinimal />
      </div>
    )
  }

  // Main page - ULTRA SIMPLE
  return (
    <div className="min-h-screen bg-white">
      <HeaderMinimal />

      {/* Banner */}
      <div className="bg-violet text-white py-3 px-4 text-center">
        <span className="text-xs font-semibold lowercase">
          official launch coming soon — be the first to know
        </span>
      </div>

      <main className="pt-8 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <h1 className="text-3xl font-bold mb-6 text-center lowercase">
            .launching soon
          </h1>

          {/* Message */}
          <div className="mb-8 text-sm text-gray-600 space-y-4">
            <p>
              We're in the final stages of preparing a seamless payment
              experience for you.
            </p>
            <p className="font-bold text-black">
              Payment will be available within few days.
            </p>
            <p>
              Leave your details below and we'll notify you the moment we launch
              — your items will be waiting for you.
            </p>
          </div>

          {/* Cart summary - SIMPLIFIED */}
          <div className="border border-gray-200 p-4 mb-8">
            <h2 className="font-bold mb-4 lowercase">your selection</h2>

            {items.map((item) => (
              <div key={item.id} className="flex justify-between py-2 text-sm">
                <span className="lowercase">
                  {item.name} x{item.quantity}
                </span>
                <span className="font-semibold">
                  €{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between font-bold">
              <span className="lowercase">total</span>
              <span>€{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* ULTRA-SIMPLE FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First name */}
            <div>
              <label className="block text-xs font-semibold mb-2 lowercase">
                first name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
                disabled={isLoading}
                autoComplete="given-name"
                className="w-full border-b-2 border-gray-300 focus:border-black outline-none py-2 px-0 text-base bg-transparent lowercase"
                placeholder="jane"
              />
            </div>

            {/* Last name */}
            <div>
              <label className="block text-xs font-semibold mb-2 lowercase">
                last name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
                disabled={isLoading}
                autoComplete="family-name"
                className="w-full border-b-2 border-gray-300 focus:border-black outline-none py-2 px-0 text-base bg-transparent lowercase"
                placeholder="doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-2 lowercase">
                email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isLoading}
                autoComplete="email"
                className="w-full border-b-2 border-gray-300 focus:border-black outline-none py-2 px-0 text-base bg-transparent lowercase"
                placeholder="jane@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold mb-2 lowercase">
                phone (optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={isLoading}
                autoComplete="tel"
                className="w-full border-b-2 border-gray-300 focus:border-black outline-none py-2 px-0 text-base bg-transparent lowercase"
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-sm lowercase">
                {error}
              </div>
            )}

            {/* NATIVE HTML BUTTON - GUARANTEED TO WORK */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'lowercase',
                backgroundColor: isLoading ? '#666' : '#000',
                color: '#fff',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {isLoading ? 'submitting...' : 'notify me at launch'}
            </button>

            <p className="text-xs text-gray-500 text-center lowercase">
              we respect your privacy. no spam, just launch notifications.
            </p>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-black transition-colors lowercase"
            >
              continue shopping
            </Link>
          </div>
        </div>
      </main>

      <FooterMinimal />
    </div>
  )
}
