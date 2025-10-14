// src/lib/email/send.ts
import { Resend } from 'resend'
import { render } from '@react-email/render'
import type { ReactElement } from 'react' // ✅ Import type-only

// Vérifier que la clé API est présente
if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY manquante dans les variables d'environnement")
}

const resend = new Resend(process.env.RESEND_API_KEY)

// Configuration de l'expéditeur
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const FROM_NAME = 'Blanche Renaudin'

/**
 * Types d'emails supportés
 */
export type EmailType =
  | 'order-confirmation'
  | 'order-shipped'
  | 'order-delivered'
  | 'order-cancelled'
  | 'password-reset'
  | 'welcome'

/**
 * Options d'envoi d'email
 */
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

/**
 * Envoi d'un email via Resend
 * @param options Options de l'email
 * @returns Promise avec l'ID de l'email envoyé
 */
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
    // ✅ Rendu du composant React en HTML (await pour résoudre la Promise)
    const html = await render(react)

    // Envoi via Resend
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

/**
 * Envoi d'un email de confirmation de commande
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
  // Import dynamique pour éviter les erreurs de bundling
  const { OrderConfirmationEmail } = await import('./order-confirmation')

  return sendEmail({
    to: email,
    subject: `Confirmation de commande #${orderData.orderNumber}`,
    react: OrderConfirmationEmail(orderData),
    type: 'order-confirmation',
  })
}

/**
 * Envoi d'un email de suivi d'expédition
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
  // ✅ Import conditionnel si le fichier existe
  try {
    const { OrderShippedEmail } = await import('./order-shipped')
    return sendEmail({
      to: email,
      subject: `Votre commande #${orderData.orderNumber} a été expédiée`,
      react: OrderShippedEmail(orderData),
      type: 'order-shipped',
    })
  } catch (error) {
    console.error('❌ Template order-shipped.tsx manquant:', error)
    throw new Error('Template email order-shipped non trouvé')
  }
}

/**
 * Envoi d'un email de livraison confirmée
 */
export async function sendOrderDeliveredEmail(
  email: string,
  orderData: {
    orderNumber: string
    customerName: string
    deliveredAt: string
  }
) {
  try {
    const { OrderDeliveredEmail } = await import('./order-delivered')
    return sendEmail({
      to: email,
      subject: `Votre commande #${orderData.orderNumber} a été livrée`,
      react: OrderDeliveredEmail(orderData),
      type: 'order-delivered',
    })
  } catch (error) {
    console.error('❌ Template order-delivered.tsx manquant:', error)
    throw new Error('Template email order-delivered non trouvé')
  }
}

/**
 * Envoi d'un email de réinitialisation de mot de passe
 */
export async function sendPasswordResetEmail(
  email: string,
  data: {
    resetUrl: string
    expiresIn: string
  }
) {
  try {
    const { PasswordResetEmail } = await import('./password-reset')
    return sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      react: PasswordResetEmail(data),
      type: 'password-reset',
    })
  } catch (error) {
    console.error('❌ Template password-reset.tsx manquant:', error)
    throw new Error('Template email password-reset non trouvé')
  }
}

/**
 * Envoi d'un email de bienvenue
 */
export async function sendWelcomeEmail(
  email: string,
  data: {
    firstName: string
  }
) {
  try {
    const { WelcomeEmail } = await import('./welcome')
    return sendEmail({
      to: email,
      subject: 'Bienvenue chez Blanche Renaudin',
      react: WelcomeEmail(data),
      type: 'welcome',
    })
  } catch (error) {
    console.error('❌ Template welcome.tsx manquant:', error)
    throw new Error('Template email welcome non trouvé')
  }
}

/**
 * Utilitaire pour formatter les prix
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}
