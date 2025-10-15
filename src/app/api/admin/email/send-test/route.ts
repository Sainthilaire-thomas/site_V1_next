// src/app/api/admin/email/send-test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { render } from '@react-email/render'
import { Resend } from 'resend'
import { OrderConfirmationEmail } from '@/lib/email/order-confirmation'
import { OrderShippedEmail } from '@/lib/email/order-shipped'
import { OrderDeliveredEmail } from '@/lib/email/order-delivered'
import { WelcomeEmail } from '@/lib/email/welcome'
import { PasswordResetEmail } from '@/lib/email/password-reset'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function POST(request: NextRequest) {
  console.log('🚀 API Route appelée')

  try {
    const body = await request.json()
    console.log('📦 Body reçu:', body)

    const { email, type } = body

    if (!email || !type) {
      console.log('❌ Email ou type manquant')
      return NextResponse.json(
        { error: 'Email and type are required' },
        { status: 400 }
      )
    }

    console.log("📧 Génération de l'email pour:", email, 'type:', type)

    let emailComponent
    let subject

    switch (type) {
      case 'order-confirmation':
        emailComponent = OrderConfirmationEmail({
          orderNumber: 'BR-2025-TEST',
          customerName: 'Test User',
          items: [
            {
              name: 'Black long dress',
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
            line1: '123 Fashion Street',
            city: 'Paris',
            postalCode: '75001',
            country: 'France',
          },
        })
        subject = '[TEST] Order Confirmation'
        break

      case 'order-shipped':
        emailComponent = OrderShippedEmail({
          orderNumber: 'BR-2025-TEST',
          customerName: 'Test User',
          trackingNumber: '3SBRCP00012345',
          carrier: 'Colissimo',
          trackingUrl: 'https://www.laposte.fr/suivre',
          estimatedDelivery: 'Wednesday, October 16',
        })
        subject = '[TEST] Order Shipped'
        break

      case 'order-delivered':
        emailComponent = OrderDeliveredEmail({
          orderNumber: 'BR-2025-TEST',
          customerName: 'Test User',
          deliveredAt: 'Wednesday, October 16 at 2:32 PM',
        })
        subject = '[TEST] Order Delivered'
        break

      case 'welcome':
        emailComponent = WelcomeEmail({
          firstName: 'Test',
        })
        subject = '[TEST] Welcome'
        break

      case 'password-reset':
        emailComponent = PasswordResetEmail({
          resetUrl: 'http://localhost:3000/auth/reset-password?token=test',
          expiresIn: '1 hour',
        })
        subject = '[TEST] Password Reset'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    console.log('🎨 Rendu du composant email...')
    const html = await render(emailComponent)
    console.log('✅ HTML généré, longueur:', html.length)

    if (resend) {
      console.log('📨 Envoi avec Resend...')
      const { data, error } = await resend.emails.send({
        from: 'Blanche Renaudin <contact@blancherenaudin.com>',
        to: email,
        subject: subject,
        html: html,
      })

      if (error) {
        console.error('❌ Erreur Resend:', error)
        throw error
      }

      console.log('✅ Email envoyé! ID:', data?.id)

      return NextResponse.json({
        success: true,
        message: `Email sent to ${email}`,
        emailId: data?.id,
      })
    } else {
      console.log('⚠️ Mode simulation (pas de RESEND_API_KEY)')

      return NextResponse.json({
        success: true,
        message: `[SIMULATION] Email would be sent to ${email}`,
        emailId: 'test-' + Date.now(),
        note: 'Configure RESEND_API_KEY to send real emails',
      })
    }
  } catch (error) {
    console.error('💥 Erreur complète:', error)
    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
