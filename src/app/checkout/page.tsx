// src/app/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { Database } from '@/lib/database.types'

// Type pour l'adresse (snake_case comme dans la DB)
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

type ShippingRate = Database['public']['Tables']['shipping_rates']['Row']

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCartStore()

  const [isLoading, setIsLoading] = useState(false)
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [selectedShipping, setSelectedShipping] = useState<string>('')

  const [billingAddress, setBillingAddress] = useState<AddressInput>({
    first_name: '',
    last_name: '',
    address_line_1: '',
    city: '',
    postal_code: '',
    country: 'FR',
  })

  const [shippingAddress, setShippingAddress] = useState<AddressInput>({
    first_name: '',
    last_name: '',
    address_line_1: '',
    city: '',
    postal_code: '',
    country: 'FR',
  })

  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Charger les tarifs de livraison
  useEffect(() => {
    const fetchShippingRates = async () => {
      try {
        const res = await fetch('/api/shipping/rates')
        const data = await res.json()
        setShippingRates(data.rates || [])
      } catch (error) {
        console.error('Erreur chargement tarifs:', error)
      }
    }
    fetchShippingRates()
  }, [])

  // Rediriger si panier vide
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items, router])

  const selectedRate = shippingRates.find((r) => r.id === selectedShipping)
  const shippingCost = selectedRate?.base_rate || 0
  const subtotal = totalPrice
  const taxAmount = subtotal * 0.2 // TVA 20%
  const total = subtotal + shippingCost + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const orderData = {
        customer_email: email,
        customer_name: `${billingAddress.first_name} ${billingAddress.last_name}`,
        customer_phone: phone,
        billing_address: billingAddress,
        shipping_address: sameAsShipping ? billingAddress : shippingAddress,
        items: items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          unit_price: item.price,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
          variant_name: item.size
            ? 'Taille'
            : item.color
              ? 'Couleur'
              : undefined,
          variant_value: item.size || item.color,
        })),
        subtotal,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        total_amount: total,
        shipping_method: selectedRate?.name,
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!res.ok) throw new Error('Erreur création commande')

      const { order, payment_url } = await res.json()

      // Rediriger vers Stripe
      if (payment_url) {
        window.location.href = payment_url
      } else {
        clearCart()
        router.push(`/order/success?order=${order.id}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la commande')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-8">Finaliser la commande</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-12">
          {/* Formulaire gauche */}
          <div className="space-y-8">
            {/* Contact */}
            <section>
              <h2 className="text-xl font-medium mb-4">Contact</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Adresse de livraison */}
            <section>
              <h2 className="text-xl font-medium mb-4">Adresse de livraison</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prénom *</Label>
                  <Input
                    value={billingAddress.first_name}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        first_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Nom *</Label>
                  <Input
                    value={billingAddress.last_name}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        last_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>Adresse *</Label>
                  <Input
                    value={billingAddress.address_line_1}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        address_line_1: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Ville *</Label>
                  <Input
                    value={billingAddress.city}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        city: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Code postal *</Label>
                  <Input
                    value={billingAddress.postal_code}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        postal_code: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
            </section>

            {/* Méthode de livraison */}
            <section>
              <h2 className="text-xl font-medium mb-4">Livraison</h2>
              <div className="space-y-3">
                {shippingRates.map((rate) => (
                  <label
                    key={rate.id}
                    className="flex items-center gap-3 p-4 border rounded cursor-pointer hover:border-violet-600"
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={rate.id}
                      checked={selectedShipping === rate.id}
                      onChange={(e) => setSelectedShipping(e.target.value)}
                      required
                    />
                    <div className="flex-1">
                      <div className="font-medium">{rate.name}</div>
                      <div className="text-sm text-gray-500">
                        {rate.description}
                      </div>
                    </div>
                    <div className="font-medium">
                      {rate.base_rate === 0 ? 'Gratuit' : `${rate.base_rate}€`}
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Récapitulatif droite */}
          <div>
            <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
              <h2 className="text-xl font-medium mb-4">Récapitulatif</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-gray-200 rounded" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        Qté: {item.quantity}
                      </div>
                    </div>
                    <div>{(item.price * item.quantity).toFixed(2)}€</div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>
                    {shippingCost === 0
                      ? 'Gratuit'
                      : `${shippingCost.toFixed(2)}€`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (20%)</span>
                  <span>{taxAmount.toFixed(2)}€</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-between text-xl font-medium mb-6">
                <span>Total</span>
                <span>{total.toFixed(2)}€</span>
              </div>

              <Button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700"
                disabled={isLoading || !selectedShipping}
              >
                {isLoading ? 'Traitement...' : 'Payer maintenant'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
