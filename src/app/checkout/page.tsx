'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PayPalButtonsWrapper } from '@/components/checkout/PayPalButtons'
import { toast } from 'sonner'
import { calculateShippingCost } from '@/lib/shipping/calculator'

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

export default function CheckoutPayPalPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCartStore()

  const [showPayPal, setShowPayPal] = useState(false)
  const [shippingCost, setShippingCost] = useState(5.9)
  const [shippingMethod] = useState('france_standard')

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

  useEffect(() => {
    const country = shippingAddress.country || 'FR'
    const method =
      country === 'FR' || country === 'MC'
        ? 'france_standard'
        : 'europe_standard'

    const calculation = calculateShippingCost(method, country, totalPrice)

    if (calculation) {
      setShippingCost(calculation.cost)
    } else {
      setShippingCost(country === 'FR' || country === 'MC' ? 5.9 : 12.9)
    }
  }, [totalPrice, shippingAddress.country])

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !shippingAddress.first_name ||
      !shippingAddress.last_name ||
      !shippingAddress.email ||
      !shippingAddress.address_line1 ||
      !shippingAddress.city ||
      !shippingAddress.postal_code
    ) {
      toast.error('Please fill in all required fields')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      router.push('/cart')
      return
    }

    setShowPayPal(true)
    toast.success('Information saved')

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
        Complete your order
      </h1>
      <p className="text-sm text-gray-500 mb-8">Secure payment with PayPal</p>

      <form onSubmit={handleContinueToPayment}>
        <div className="space-y-4 mb-8 bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 uppercase tracking-wider">
            Shipping information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First name *</Label>
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
              <Label htmlFor="last_name">Last name *</Label>
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
            <Label htmlFor="phone">Phone</Label>
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
            <Label htmlFor="address_line1">Address *</Label>
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
            <Label htmlFor="address_line2">Address line 2</Label>
            <Input
              id="address_line2"
              value={shippingAddress.address_line2}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  address_line2: e.target.value,
                })
              }
              placeholder="Apartment, floor, etc."
              disabled={showPayPal}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postal_code">Postal code *</Label>
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
              <Label htmlFor="city">City *</Label>
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
            <Label htmlFor="country">Country *</Label>
            <select
              id="country"
              value={shippingAddress.country}
              onChange={(e) => {
                setShippingAddress({
                  ...shippingAddress,
                  country: e.target.value,
                })
              }}
              disabled={showPayPal}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            >
              <option value="FR">France</option>
              <option value="MC">Monaco</option>
              <option value="BE">Belgium</option>
              <option value="LU">Luxembourg</option>
              <option value="DE">Germany</option>
              <option value="IT">Italy</option>
              <option value="ES">Spain</option>
              <option value="PT">Portugal</option>
              <option value="NL">Netherlands</option>
              <option value="AT">Austria</option>
              <option value="CH">Switzerland</option>
            </select>
          </div>

          {showPayPal && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPayPal(false)}
              className="w-full"
            >
              Edit address
            </Button>
          )}
        </div>

        <div className="bg-white border-2 border-gray-200 p-6 rounded-lg mb-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 uppercase tracking-wider">
            Order summary
          </h2>

          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Your cart is empty</p>
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
                  <span>Subtotal</span>
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{(totalPrice + shippingCost).toFixed(2)}€</span>
                </div>
              </div>
            </>
          )}
        </div>

        {!showPayPal ? (
          <Button
            type="submit"
            disabled={items.length === 0}
            className="w-full bg-black hover:bg-black/90 text-white font-['Archivo_Narrow'] uppercase tracking-wider"
            size="lg"
          >
            Confirm and pay
          </Button>
        ) : (
          <div id="paypal-section" className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 uppercase tracking-wider">
              PayPal payment
            </h2>

            {process.env.NEXT_PUBLIC_PAYPAL_MODE === 'sandbox' && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4 text-xs">
                <p className="text-amber-800">
                  Test mode: Use a PayPal Sandbox account
                </p>
              </div>
            )}

            <PayPalButtonsWrapper
              shippingCost={shippingCost}
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

        <div className="text-xs text-gray-500 text-center mt-6 space-y-1">
          <p>100% secure payment</p>
          <p className="text-gray-400">
            Your banking information is never stored on our servers
          </p>
        </div>
      </form>
    </div>
  )
}
