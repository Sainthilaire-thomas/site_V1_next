// src/app/api/admin/email/send-test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { render } from '@react-email/render'
import { OrderConfirmationEmail } from '@/lib/email/order-confirmation'
import { OrderShippedEmail } from '@/lib/email/order-shipped'
import { OrderDeliveredEmail } from '@/lib/email/order-delivered'
import { WelcomeEmail } from '@/lib/email/welcome'
import { PasswordResetEmail } from '@/lib/email/password-reset'
// import { sendEmail } from '@/lib/email/send' // Décommenter quand configuré

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json()

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Email and type are required' },
        { status: 400 }
      )
    }

    // Générer le contenu selon le type
    let emailHtml: string
    let subject: string

    switch (type) {
      case 'order-confirmation':
        emailHtml = await render(
          OrderConfirmationEmail({
            orderNumber: 'BR-2025-TEST',
            customerName: 'Test User',
            items: [
              {
                name: 'Robe longue noire',
                quantity: 1,
                price: 29500,
                imageUrl:
                  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
              },
            ],
            subtotal: 29500,
            shipping: 0,
            total: 29500,
            shippingAddress: {
              line1: '123 rue de la Mode',
              city: 'Paris',
              postalCode: '75001',
              country: 'France',
            },
          })
        )
        subject = '[TEST] Order Confirmation - BR-2025-TEST'
        break

      case 'order-shipped':
        emailHtml = await render(
          OrderShippedEmail({
            orderNumber: 'BR-2025-TEST',
            customerName: 'Test User',
            trackingNumber: '3SBRCP00012345',
            carrier: 'Colissimo',
            trackingUrl:
              'https://www.laposte.fr/outils/suivre-vos-envois?code=3SBRCP00012345',
            estimatedDelivery: 'Wednesday, October 16',
          })
        )
        subject = '[TEST] Your order has been shipped - BR-2025-TEST'
        break

      case 'order-delivered':
        emailHtml = await render(
          OrderDeliveredEmail({
            orderNumber: 'BR-2025-TEST',
            customerName: 'Test User',
            deliveredAt: 'Wednesday, October 16 at 2:32 PM',
          })
        )
        subject = '[TEST] Your order has been delivered - BR-2025-TEST'
        break

      case 'welcome':
        emailHtml = await render(
          WelcomeEmail({
            firstName: 'Test',
          })
        )
        subject = '[TEST] Welcome to Blanche Renaudin'
        break

      case 'password-reset':
        emailHtml = await render(
          PasswordResetEmail({
            resetUrl:
              'http://localhost:3000/auth/reset-password?token=test-token',
            expiresIn: '1 hour',
          })
        )
        subject = '[TEST] Reset your password'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    // TODO: Décommenter quand vous aurez configuré Resend/SendGrid
    /*
    await sendEmail({
      to: email,
      subject: subject,
      html: emailHtml,
    })
    */

    // Pour l'instant, on log juste (à retirer en production)
    console.log('📧 Test email would be sent to:', email)
    console.log('📧 Subject:', subject)
    console.log('📧 Type:', type)

    // Simuler un délai
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${email}`,
      // Temporaire: retourner le HTML pour debug
      preview: `Email would be sent with subject: ${subject}`,
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}
