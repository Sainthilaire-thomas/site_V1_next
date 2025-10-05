import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY at runtime.')
  }

  if (!_stripe) {
    // ✅ Ne PAS passer d'options → évite le conflit de types sur apiVersion
    _stripe = new Stripe(key)
  }
  return _stripe
}
