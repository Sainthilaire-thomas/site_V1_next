// src/lib/paypal-config.ts

/**
 * Configuration PayPal centralisée
 * Supporte les environnements Sandbox (dev/preview) et Live (production)
 */

export const PAYPAL_CONFIG = {
  // Client ID (public)
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
  
  // Secret (privé - serveur seulement)
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
  
  // Mode : 'sandbox' ou 'live'
  mode: (process.env.NEXT_PUBLIC_PAYPAL_MODE || 'sandbox') as 'sandbox' | 'live',
  
  // URL de l'API PayPal selon le mode
  get apiUrl() {
    return this.mode === 'live' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'
  },
  
  // Est-ce qu'on est en production ?
  get isProduction() {
    return this.mode === 'live'
  },
  
  // Est-ce qu'on est en sandbox ?
  get isSandbox() {
    return this.mode === 'sandbox'
  }
}

/**
 * Helper pour logger l'environnement PayPal au démarrage
 * Utile pour le debugging
 */
export function logPayPalEnvironment() {
  if (typeof window === 'undefined') {
    // Côté serveur
    console.log('💳 PayPal Environment (Server):', {
      mode: PAYPAL_CONFIG.mode,
      apiUrl: PAYPAL_CONFIG.apiUrl,
      clientId: PAYPAL_CONFIG.clientId.substring(0, 20) + '...',
      hasSecret: !!PAYPAL_CONFIG.clientSecret
    })
  } else {
    // Côté client
    console.log('💳 PayPal Environment (Client):', {
      mode: PAYPAL_CONFIG.mode,
      clientId: PAYPAL_CONFIG.clientId.substring(0, 20) + '...'
    })
  }
}
