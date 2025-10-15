// src/app/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import { Sparkles, Mail, User, Phone, Heart } from 'lucide-react'
import { ProductImage } from '@/components/products/ProductImage'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice } = useCartStore()

  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

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
    setIsLoading(true)

    try {
      // Envoyer les données à votre API
      const response = await fetch('/api/launch-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      })

      if (!response.ok) {
        throw new Error('Failed to submit notification request')
      }

      setIsSubmitted(true)
      toast.success('Thank you! We will notify you soon.')
    } catch (error: any) {
      console.error('Notification error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium">
          loading...
        </div>
      </div>
    )
  }

  // Page de confirmation après soumission
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <HeaderMinimal />
        <main className="pt-32 pb-24 px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-violet/10 flex items-center justify-center">
                <Heart className="w-10 h-10 text-violet" />
              </div>
            </div>

            <h1 className="text-section mb-6">.thank you</h1>

            <p className="text-body text-grey-medium mb-8 leading-relaxed">
              Your interest means everything to us.
              <br />
              We'll notify you by email as soon as payment becomes available.
            </p>

            <p className="text-[13px] tracking-[0.05em] font-semibold lowercase text-black mb-12">
              Expected launch: within few days
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button
                  variant="outline"
                  className="py-3 px-8 text-[13px] tracking-[0.05em] font-semibold lowercase border-black hover:bg-black hover:text-white transition-colors"
                >
                  back to home
                </Button>
              </Link>
            </div>

            <p className="text-[11px] tracking-[0.05em] lowercase text-grey-medium mt-12">
              Questions? Contact us at{' '}
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

  // Si le panier est vide
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <HeaderMinimal />
        <main className="pt-32 pb-24 px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-section mb-6">.empty cart</h1>
            <p className="text-body text-grey-medium mb-12">
              Your cart is empty. Please add items before proceeding.
            </p>
            <Link
              href="/collections"
              className="inline-block py-3 px-8 text-[13px] tracking-[0.05em] font-semibold lowercase bg-white text-black border border-black hover:bg-black hover:text-white transition-colors"
            >
              view collections
            </Link>
          </div>
        </main>
        <FooterMinimal />
      </div>
    )
  }

  // Page principale "Coming Soon"
  return (
    <div className="min-h-screen bg-white">
      <HeaderMinimal />

      {/* Bandeau de lancement */}
      <div className="bg-violet text-white py-3 px-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-[13px] tracking-[0.05em] font-semibold lowercase">
            official launch coming soon — be the first to know
          </span>
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <main className="pt-16 pb-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Colonne gauche - Message */}
            <div className="flex flex-col justify-center">
              <h1 className="text-section mb-8">.launching soon</h1>

              <div className="space-y-6 text-[15px] leading-relaxed text-grey-medium mb-12">
                <p>
                  We're in the final stages of preparing a seamless payment
                  experience for you.
                </p>

                <p>
                  <strong className="text-black">
                    Payment will be available within few days.
                  </strong>
                </p>

                <p>
                  Leave your details below and we'll notify you the moment we
                  launch — your items will be waiting for you.
                </p>
              </div>

              {/* Formulaire de notification */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-3 block">
                      first name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-medium" />
                      <Input
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        required
                        className="pl-6 border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent w-full"
                        placeholder="jane"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-3 block">
                      last name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-medium" />
                      <Input
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        required
                        className="pl-6 border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent w-full"
                        placeholder="doe"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-3 block">
                    email *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-medium" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="pl-6 border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent w-full"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-3 block">
                    phone (optional)
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-medium" />
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="pl-6 border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent w-full"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-4 text-[13px] tracking-[0.05em] font-semibold lowercase bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'submitting...' : 'notify me at launch'}
                </Button>

                <p className="text-[11px] tracking-[0.05em] lowercase text-grey-medium text-center">
                  We respect your privacy. No spam, just launch notifications.
                </p>
              </form>
            </div>

            {/* Colonne droite - Récapitulatif panier */}
            <div>
              <div className="border border-grey-light p-8 sticky top-32">
                <h2 className="text-product mb-8">your selection</h2>

                <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-24 flex-shrink-0 bg-gray-100 overflow-hidden">
                        {item.imageId && item.productId ? (
                          <ProductImage
                            productId={item.productId}
                            imageId={item.imageId}
                            alt={item.name}
                            size="sm"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] tracking-[0.05em] font-semibold lowercase mb-1">
                          {item.name}
                        </div>
                        <div className="text-[11px] tracking-[0.05em] lowercase text-grey-medium">
                          {item.size && <span>size: {item.size}</span>}
                          {item.size && item.color && <span> • </span>}
                          {item.color && <span>{item.color}</span>}
                        </div>
                        <div className="text-[11px] tracking-[0.05em] lowercase text-grey-medium mt-1">
                          qty: {item.quantity}
                        </div>
                      </div>
                      <div className="text-[13px] tracking-[0.05em] font-semibold lowercase">
                        €{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-grey-light pt-6">
                  <div className="flex justify-between text-[15px] tracking-[0.02em] font-semibold text-black mb-6">
                    <span className="lowercase">total</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="bg-violet/5 border border-violet/20 p-4 rounded">
                    <p className="text-[11px] tracking-[0.05em] lowercase text-grey-medium text-center">
                      This selection will be reserved for you when payment
                      launches
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  continue shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterMinimal />
    </div>
  )
}
