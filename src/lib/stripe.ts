// src/lib/stripe.ts
import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY at runtime.')
  }

  if (!_stripe) {
    _stripe = new Stripe(key, {
      apiVersion: '2025-09-30.clover', // ✅ FIX : Version correcte
      typescript: true,
    })
  }

  return _stripe
}

// Export pour une utilisation directe
export const stripe = getStripe()
