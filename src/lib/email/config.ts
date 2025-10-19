// src/lib/email/config.ts

/**
 * Configuration centralisée pour les emails transactionnels
 * Domaine vérifié : blancherenaudin.com ✅
 */

export const EMAIL_CONFIG = {
  // ✅ Expéditeur par défaut (vérifié dans Resend)
  from: {
    name: 'Blanche Renaudin',
    email: 'contact@blancherenaudin.com',
  },

  // Format complet pour Resend
  get fromAddress() {
    return `${this.from.name} <${this.from.email}>`
  },

  // Reply-To (optionnel)
  replyTo: 'contact@blancherenaudin.com',

  // Autres expéditeurs possibles
  senders: {
    noreply: 'noreply@blancherenaudin.com',
    orders: 'contact@blancherenaudin.com',
    support: 'contact@blancherenaudin.com',
  },
}

/**
 * Types d'emails disponibles
 */
export const EMAIL_TYPES = {
  ORDER_CONFIRMATION: 'order-confirmation',
  ORDER_SHIPPED: 'order-shipped',
  ORDER_DELIVERED: 'order-delivered',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password-reset',
  NEWSLETTER_CONFIRMATION: 'newsletter-confirmation',
  NEWSLETTER_CAMPAIGN: 'newsletter-campaign',
} as const

export type EmailType = (typeof EMAIL_TYPES)[keyof typeof EMAIL_TYPES]
