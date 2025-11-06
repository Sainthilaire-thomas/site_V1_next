// src/lib/paypal.ts
import checkoutNodeJssdk from '@paypal/checkout-server-sdk'

function environment() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not configured')
  }

  if (process.env.PAYPAL_MODE === 'live') {
    console.log('🔴 PayPal: Mode PRODUCTION activé')
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
  }

  console.log('🟡 PayPal: Mode SANDBOX activé')
  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret)
}

function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment())
}

export { client }
