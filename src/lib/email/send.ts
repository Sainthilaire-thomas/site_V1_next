// src/lib/email/send.ts
import { Resend } from 'resend'
import { render } from '@react-email/render'
import type { ReactElement } from 'react'

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY manquante dans les variables d'environnement")
}

const resend = new Resend(process.env.RESEND_API_KEY)
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
    subject: `Confirmation de commande #${orderData.orderNumber}`,
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

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}
