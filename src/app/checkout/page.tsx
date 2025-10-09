// src/app/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'

// Type pour l'adresse
type AddressInput = {
  first_name: string
  last_name: string
  company?: string
  address_line_1: string
  address_line_2?: string
  city: string
  postal_code: string
  country: string
}

// Tarifs de livraison en dur pour le moment
const SHIPPING_RATES = [
  {
    id: '1',
    name: 'Standard',
    description: 'Livraison en 5-7 jours ouvrés',
    base_rate: 0,
  },
  {
    id: '2',
    name: 'Express',
    description: 'Livraison en 2-3 jours ouvrés',
    base_rate: 15,
  },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCartStore()

  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState('1')

  const [billingAddress, setBillingAddress] = useState<AddressInput>({
    first_name: '',
    last_name: '',
    address_line_1: '',
    city: '',
    postal_code: '',
    country: 'FR',
  })

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Attendre que le composant soit monté côté client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const selectedRate = SHIPPING_RATES.find((r) => r.id === selectedShipping)
  const shippingCost = selectedRate?.base_rate || 0
  const subtotal = totalPrice
  const taxAmount = subtotal * 0.2 // TVA 20%
  const total = subtotal + shippingCost + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simuler un délai de traitement
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success('Commande créée avec succès !')
      clearCart()
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la commande')
    } finally {
      setIsLoading(false)
    }
  }

  // Afficher un loader pendant le chargement initial
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium">
          loading...
        </div>
      </div>
    )
  }

  // Si le panier est vide, afficher un message au lieu de rediriger
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <HeaderMinimal />
        <main className="pt-32 pb-24 px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-section mb-6">.empty cart</h1>
            <p className="text-body text-grey-medium mb-12">
              Your cart is empty. Please add items before checkout.
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

  return (
    <div className="min-h-screen bg-white">
      <HeaderMinimal />

      <main className="pt-32 pb-24 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-section mb-16">.checkout</h1>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-16">
            {/* Formulaire gauche */}
            <div className="space-y-12">
              {/* Contact */}
              <section>
                <h2 className="text-product mb-6">CONTACT</h2>
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-3 block"
                    >
                      email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent w-full"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="phone"
                      className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-3 block"
                    >
                      phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent w-full"
                    />
                  </div>
                </div>
              </section>

              {/* Adresse de livraison */}
              <section>
                <h2 className="text-product mb-6">SHIPPING ADDRESS</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-3 block">
                      first name *
                    </Label>
                    <Input
                      value={billingAddress.first_name}
                      onChange={(e) =>
                        setBillingAddress({
                          ...billingAddress,
                          first_name: e.target.value,
                        })
                      }
                      required
                      className="border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-3 block">
                      last name *
                    </Label>
                    <Input
                      value={billingAddress.last_name}
                      onChange={(e) =>
                        setBillingAddress({
                          ...billingAddress,
                          last_name: e.target.value,
                        })
                      }
                      required
                      className="border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent w-full"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-3 block">
                      address *
                    </Label>
                    <Input
                      value={billingAddress.address_line_1}
                      onChange={(e) =>
                        setBillingAddress({
                          ...billingAddress,
                          address_line_1: e.target.value,
                        })
                      }
                      required
                      className="border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-3 block">
                      city *
                    </Label>
                    <Input
                      value={billingAddress.city}
                      onChange={(e) =>
                        setBillingAddress({
                          ...billingAddress,
                          city: e.target.value,
                        })
                      }
                      required
                      className="border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-3 block">
                      postal code *
                    </Label>
                    <Input
                      value={billingAddress.postal_code}
                      onChange={(e) =>
                        setBillingAddress({
                          ...billingAddress,
                          postal_code: e.target.value,
                        })
                      }
                      required
                      className="border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent w-full"
                    />
                  </div>
                </div>
              </section>

              {/* Méthode de livraison */}
              <section>
                <h2 className="text-product mb-6">SHIPPING METHOD</h2>
                <div className="space-y-4">
                  {SHIPPING_RATES.map((rate) => (
                    <label
                      key={rate.id}
                      className="flex items-center gap-4 p-4 border border-grey-light cursor-pointer hover:border-black transition-colors"
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={rate.id}
                        checked={selectedShipping === rate.id}
                        onChange={(e) => setSelectedShipping(e.target.value)}
                        required
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="text-[13px] tracking-[0.05em] font-semibold lowercase">
                          {rate.name}
                        </div>
                        <div className="text-[13px] tracking-[0.05em] lowercase text-grey-medium">
                          {rate.description}
                        </div>
                      </div>
                      <div className="text-[13px] tracking-[0.05em] font-semibold lowercase">
                        {rate.base_rate === 0 ? 'free' : `${rate.base_rate}€`}
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            {/* Récapitulatif droite */}
            <div>
              <div className="border border-grey-light p-8 sticky top-32">
                <h2 className="text-product mb-8">ORDER SUMMARY</h2>

                <div className="space-y-6 mb-8">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-20 bg-gray-100 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[13px] tracking-[0.05em] font-semibold lowercase mb-1">
                          {item.name}
                        </div>
                        <div className="text-[13px] tracking-[0.05em] lowercase text-grey-medium">
                          qty: {item.quantity}
                        </div>
                      </div>
                      <div className="text-[13px] tracking-[0.05em] font-semibold lowercase">
                        {(item.price * item.quantity).toFixed(2)}€
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-grey-light pt-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium">
                      <span>subtotal</span>
                      <span className="text-black">{subtotal.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium">
                      <span>shipping</span>
                      <span className="text-black">
                        {shippingCost === 0
                          ? 'free'
                          : `${shippingCost.toFixed(2)}€`}
                      </span>
                    </div>
                    <div className="flex justify-between text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium">
                      <span>tax (20%)</span>
                      <span className="text-black">
                        {taxAmount.toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-grey-light pt-6 mb-8">
                  <div className="flex justify-between text-[15px] tracking-[0.02em] font-semibold text-black">
                    <span className="lowercase">total</span>
                    <span>{total.toFixed(2)}€</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-4 text-[13px] tracking-[0.05em] font-semibold lowercase bg-black text-white hover:bg-gray-800 transition-colors"
                  disabled={isLoading || !selectedShipping}
                >
                  {isLoading ? 'processing...' : 'place order'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <FooterMinimal />
    </div>
  )
}
