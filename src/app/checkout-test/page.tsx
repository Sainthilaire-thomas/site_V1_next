'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface ShippingAddress {
  first_name: string
  last_name: string
  email: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  postal_code: string
  country: string
}

export default function CheckoutTestPage() {
  const router = useRouter()

  // ✅ CORRECTION : Utiliser totalPrice au lieu de getTotalPrice()
  const { items, totalPrice, clearCart } = useCartStore()

  const [isLoading, setIsLoading] = useState(false)

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: 'FR',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (
      !shippingAddress.first_name ||
      !shippingAddress.email ||
      !shippingAddress.address_line1
    ) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (items.length === 0) {
      toast.error('Votre panier est vide')
      router.push('/cart')
      return
    }

    setIsLoading(true)

    try {
      // Appel API pour créer la session Stripe
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.image,
          })),
          shippingAddress,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || 'Erreur lors de la création de la session'
        )
      }

      const { url, error } = await response.json()

      if (error) {
        toast.error(error)
        return
      }

      // ✅ Redirection vers Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Erreur lors du paiement. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Checkout Test</h1>

      <form onSubmit={handleSubmit}>
        {/* Formulaire d'adresse */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Informations de livraison
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Prénom *</Label>
              <Input
                id="first_name"
                value={shippingAddress.first_name}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    first_name: e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="last_name">Nom *</Label>
              <Input
                id="last_name"
                value={shippingAddress.last_name}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    last_name: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={shippingAddress.email}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  email: e.target.value,
                })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  phone: e.target.value,
                })
              }
              placeholder="+33..."
            />
          </div>

          <div>
            <Label htmlFor="address_line1">Adresse *</Label>
            <Input
              id="address_line1"
              value={shippingAddress.address_line1}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  address_line1: e.target.value,
                })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="address_line2">Complément d'adresse</Label>
            <Input
              id="address_line2"
              value={shippingAddress.address_line2}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  address_line2: e.target.value,
                })
              }
              placeholder="Appartement, étage, etc."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postal_code">Code postal *</Label>
              <Input
                id="postal_code"
                value={shippingAddress.postal_code}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    postal_code: e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    city: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="country">Pays</Label>
            <Input
              id="country"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  country: e.target.value,
                })
              }
              disabled
            />
          </div>
        </div>

        {/* Résumé panier */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Résumé de la commande</h2>

          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Votre panier est vide
            </p>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId || 'default'}`}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.name}
                      {item.size && ` - ${item.size}`}
                      {item.color && ` - ${item.color}`}
                      {' × '}
                      {item.quantity}
                    </span>
                    <span>{(item.price * item.quantity).toFixed(2)}€</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  {/* ✅ CORRECTION : Utiliser totalPrice directement */}
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span className="text-green-600">Gratuite</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  {/* ✅ CORRECTION : Utiliser totalPrice directement */}
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bouton paiement */}
        <Button
          type="submit"
          disabled={isLoading || items.length === 0}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <span className="mr-2">Redirection vers Stripe...</span>
              <span className="animate-spin">⏳</span>
            </>
          ) : (
            'Procéder au paiement'
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Paiement sécurisé par Stripe. Vos informations bancaires ne sont
          jamais stockées sur nos serveurs.
        </p>
      </form>
    </div>
  )
}
