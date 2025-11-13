// src/lib/paypal.ts
import checkoutNodeJssdk from '@paypal/checkout-server-sdk'
import { PAYPAL_CONFIG } from '@/lib/paypal-config'

function environment() {
  const clientId = PAYPAL_CONFIG.clientId
  const clientSecret = PAYPAL_CONFIG.clientSecret

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not configured')
  }

  if (PAYPAL_CONFIG.isProduction) {
    console.log('🔴 PayPal: Mode PRODUCTION activé (LIVE)')
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
  }

  console.log('🟡 PayPal: Mode SANDBOX activé')
  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret)
}

function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment())
}

export { client }
