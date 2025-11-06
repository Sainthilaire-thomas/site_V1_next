'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PayPalButtonsWrapper } from '@/components/checkout/PayPalButtons'
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

export default function CheckoutTestPayPalPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCartStore()

  const [showPayPal, setShowPayPal] = useState(false)
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

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (
      !shippingAddress.first_name ||
      !shippingAddress.last_name ||
      !shippingAddress.email ||
      !shippingAddress.address_line1 ||
      !shippingAddress.city ||
      !shippingAddress.postal_code
    ) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (items.length === 0) {
      toast.error('Votre panier est vide')
      router.push('/cart')
      return
    }

    // Afficher les boutons PayPal
    setShowPayPal(true)
    toast.success('Informations enregistrées')

    // Scroll vers les boutons PayPal
    setTimeout(() => {
      document.getElementById('paypal-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 100)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2 font-['Archivo_Black'] uppercase tracking-[0.05em]">
        Checkout Test - PayPal
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Page de test pour l'intégration PayPal (mode Sandbox)
      </p>

      <form onSubmit={handleContinueToPayment}>
        {/* Formulaire d'adresse */}
        <div className="space-y-4 mb-8 bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 uppercase tracking-wider">
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
                disabled={showPayPal}
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
                disabled={showPayPal}
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
              disabled={showPayPal}
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
              disabled={showPayPal}
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
              disabled={showPayPal}
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
              disabled={showPayPal}
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
                disabled={showPayPal}
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
                disabled={showPayPal}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="country">Pays</Label>
            <Input id="country" value="France" disabled />
          </div>

          {showPayPal && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPayPal(false)}
              className="w-full"
            >
              Modifier l'adresse
            </Button>
          )}
        </div>

        {/* Résumé panier */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border">
          <h2 className="text-xl font-semibold mb-4 uppercase tracking-wider">
            Résumé de la commande
          </h2>

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
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span className="text-green-600">Gratuite</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bouton continuer ou Section PayPal */}
        {!showPayPal ? (
          <Button
            type="submit"
            disabled={items.length === 0}
            className="w-full bg-[hsl(271,74%,37%)] hover:bg-[hsl(271,74%,30%)]"
            size="lg"
          >
            Continuer vers le paiement
          </Button>
        ) : (
          <div id="paypal-section" className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 uppercase tracking-wider">
              Paiement PayPal
            </h2>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                🧪 <strong>Mode Test (Sandbox)</strong> - Utilisez un compte
                PayPal de test
              </p>
            </div>

            <PayPalButtonsWrapper
              items={items.map((item) => ({
                product_id: item.productId,
                variant_id: item.variantId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                variant_name: [item.size, item.color]
                  .filter(Boolean)
                  .join(' - '),
                image: item.image,
              }))}
              shippingAddress={shippingAddress}
              billingAddress={shippingAddress}
              customerEmail={shippingAddress.email}
              customerName={`${shippingAddress.first_name} ${shippingAddress.last_name}`}
              onSuccess={() => {
                clearCart()
              }}
            />
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          🔒 Paiement sécurisé par PayPal. Environnement de test (Sandbox).
        </p>
      </form>
    </div>
  )
}
