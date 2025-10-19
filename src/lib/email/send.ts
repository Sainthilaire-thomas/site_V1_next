// src/lib/email/send.ts
import { Resend } from 'resend'
import { render } from '@react-email/render'
import type { ReactElement } from 'react'
import { EMAIL_CONFIG, type EmailType } from './config'

// Mode développement : autoriser les tests sans clé API
const isDevelopment = process.env.NODE_ENV === 'development'
const hasResendKey = !!process.env.RESEND_API_KEY

// Logs au démarrage du module
console.log('🔍 RESEND_API_KEY présente:', hasResendKey)
if (hasResendKey) {
  console.log(
    '🔍 RESEND_API_KEY (premiers caractères):',
    process.env.RESEND_API_KEY?.substring(0, 10)
  )
  console.log('📧 Expéditeur configuré:', EMAIL_CONFIG.fromAddress)
}

if (!hasResendKey && !isDevelopment) {
  throw new Error("RESEND_API_KEY manquante dans les variables d'environnement")
}

const resend = hasResendKey ? new Resend(process.env.RESEND_API_KEY) : null

interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: ReactElement
  type?: EmailType
  from?: string // ✅ Permet de surcharger l'expéditeur
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content: Buffer | string
  }>
}

export async function sendEmail({
  to,
  subject,
  react,
  type,
  from,
  replyTo,
  cc,
  bcc,
  attachments,
}: SendEmailOptions) {
  try {
    const html = await render(react)

    // ✅ Utiliser l'expéditeur configuré ou celui passé en paramètre
    const fromAddress = from || EMAIL_CONFIG.fromAddress
    const replyToAddress = replyTo || EMAIL_CONFIG.replyTo

    // Mode test : simulation sans Resend
    if (!resend) {
      console.log('📧 [TEST MODE] Email simulé:')
      console.log('   From:', fromAddress)
      console.log('   To:', to)
      console.log('   Subject:', subject)
      console.log('   Type:', type)
      console.log(
        '   ⚠️  Configure RESEND_API_KEY pour envoyer de vrais emails'
      )

      return {
        id: 'test-' + Date.now(),
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        created_at: new Date().toISOString(),
      }
    }

    // Envoi réel avec Resend
    console.log('📤 Envoi email:', {
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject,
      type,
    })

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: replyToAddress,
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      attachments,
      tags: type ? [{ name: 'type', value: type }] : undefined,
    })

    if (error) {
      console.error('❌ Erreur envoi email:', error)
      throw new Error(`Échec envoi email: ${error.message}`)
    }

    console.log('✅ Email envoyé avec succès:', {
      id: data?.id,
      from: fromAddress,
      to,
      type,
    })
    return data
  } catch (error) {
    console.error('❌ Erreur critique envoi email:', error)
    throw error
  }
}

/**
 * Envoyer un email de confirmation de commande
 */
export async function sendOrderConfirmationEmail(
  email: string,
  orderData: {
    orderNumber: string
    customerName: string
    items: Array<{
      name: string
      quantity: number
      price: number
      imageUrl?: string
    }>
    subtotal: number
    shipping: number
    total: number
    shippingAddress: {
      line1: string
      line2?: string
      city: string
      postalCode: string
      country: string
    }
  }
) {
  const { OrderConfirmationEmail } = await import('./order-confirmation')
  return sendEmail({
    to: email,
    subject: `Confirmation de commande #${orderData.orderNumber}`,
    react: OrderConfirmationEmail(orderData),
    type: 'order-confirmation',
  })
}

/**
 * Envoyer un email de commande expédiée
 */
export async function sendOrderShippedEmail(
  email: string,
  orderData: {
    orderNumber: string
    customerName: string
    trackingNumber: string
    carrier: string
    trackingUrl: string
    estimatedDelivery?: string
  }
) {
  const { OrderShippedEmail } = await import('./order-shipped')
  return sendEmail({
    to: email,
    subject: `Votre commande #${orderData.orderNumber} a été expédiée`,
    react: OrderShippedEmail(orderData),
    type: 'order-shipped',
  })
}

/**
 * Envoyer un email de commande livrée
 */
export async function sendOrderDeliveredEmail(
  email: string,
  orderData: {
    orderNumber: string
    customerName: string
    deliveredAt: string
  }
) {
  const { OrderDeliveredEmail } = await import('./order-delivered')
  return sendEmail({
    to: email,
    subject: `Votre commande #${orderData.orderNumber} a été livrée`,
    react: OrderDeliveredEmail(orderData),
    type: 'order-delivered',
  })
}

/**
 * Envoyer un email de réinitialisation de mot de passe
 */
export async function sendPasswordResetEmail(
  email: string,
  data: {
    resetUrl: string
    expiresIn: string
  }
) {
  const { PasswordResetEmail } = await import('./password-reset')
  return sendEmail({
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    react: PasswordResetEmail(data),
    type: 'password-reset',
  })
}

/**
 * Envoyer un email de bienvenue
 */
export async function sendWelcomeEmail(
  email: string,
  data: {
    firstName: string
  }
) {
  const { WelcomeEmail } = await import('./welcome')
  return sendEmail({
    to: email,
    subject: 'Bienvenue chez Blanche Renaudin',
    react: WelcomeEmail(data),
    type: 'welcome',
  })
}

export async function sendNewsletterConfirmationEmail(
  email: string,
  data: {
    firstName?: string
    confirmUrl: string
  }
) {
  const NewsletterConfirmation = (await import('./newsletter-confirmation'))
    .default
  return sendEmail({
    to: email,
    subject: 'confirm your newsletter subscription',
    react: NewsletterConfirmation(data),
    type: 'newsletter-confirmation',
  })
}

/**
 * Formater un prix en centimes en euros
 */
export function formatPrice(euros: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(euros) // Pas de division
}
