// src/lib/email/send.ts
import { Resend } from 'resend'
import { render } from '@react-email/render'
import type { ReactElement } from 'react'

// Mode développement : autoriser les tests sans clé API
const isDevelopment = process.env.NODE_ENV === 'development'
const hasResendKey = !!process.env.RESEND_API_KEY

// Logs au démarrage du module
console.log('🔍 RESEND_API_KEY présente:', hasResendKey)
if (hasResendKey) {
  console.log('🔍 RESEND_API_KEY (premiers caractères):', process.env.RESEND_API_KEY?.substring(0, 10))
}

if (!hasResendKey && !isDevelopment) {
  throw new Error("RESEND_API_KEY manquante dans les variables d'environnement")
}

const resend = hasResendKey ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const FROM_NAME = 'Blanche Renaudin'

export type EmailType =
  | 'order-confirmation'
  | 'order-shipped'
  | 'order-delivered'
  | 'order-cancelled'
  | 'password-reset'
  | 'welcome'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: ReactElement
  type?: EmailType
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
  replyTo,
  cc,
  bcc,
  attachments,
}: SendEmailOptions) {
  try {
    const html = await render(react)

    // Mode test : simulation sans Resend
    if (!resend) {
      console.log('📧 [TEST MODE] Email simulé:')
      console.log('   To:', to)
      console.log('   Subject:', subject)
      console.log('   Type:', type)
      console.log(
        '   ⚠️  Configure RESEND_API_KEY pour envoyer de vrais emails'
      )

      return {
        id: 'test-' + Date.now(),
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: Array.isArray(to) ? to : [to],
        created_at: new Date().toISOString(),
      }
    }

    // Envoi réel avec Resend
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      attachments,
      tags: type ? [{ name: 'type', value: type }] : undefined,
    })

    if (error) {
      console.error('❌ Erreur envoi email:', error)
      throw new Error(`Échec envoi email: ${error.message}`)
    }

    console.log('✅ Email envoyé:', data?.id)
    return data
  } catch (error) {
    console.error('❌ Erreur critique envoi email:', error)
    throw error
  }
}

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
    subject: `Order confirmation #${orderData.orderNumber}`,
    react: OrderConfirmationEmail(orderData),
    type: 'order-confirmation',
  })
}

export async function sendOrderShippedEmail(
  email: string,
  orderData: {
    orderNumber: string
    customerName: string
    trackingNumber: string
    carrier: string
    trackingUrl: string
    estimatedDelivery: string // ✅ Retiré le "?"
  }
) {
  const { OrderShippedEmail } = await import('./order-shipped')
  return sendEmail({
    to: email,
    subject: `Your order #${orderData.orderNumber} has been shipped`,
    react: OrderShippedEmail(orderData),
    type: 'order-shipped',
  })
}

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
    subject: `Your order #${orderData.orderNumber} has been delivered`,
    react: OrderDeliveredEmail(orderData),
    type: 'order-delivered',
  })
}

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
    subject: 'Reset your password',
    react: PasswordResetEmail(data),
    type: 'password-reset',
  })
}

export async function sendWelcomeEmail(
  email: string,
  data: {
    firstName: string
  }
) {
  const { WelcomeEmail } = await import('./welcome')
  return sendEmail({
    to: email,
    subject: 'Welcome to Blanche Renaudin',
    react: WelcomeEmail(data),
    type: 'welcome',
  })
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}
