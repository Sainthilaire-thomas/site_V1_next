// src/app/api/admin/email/send-test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNewsletterConfirmationEmail, // ✅ AJOUTÉ
} from '@/lib/email/send'

import NewsletterConfirmation from '@/lib/email/newsletter-confirmation'
export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    const adminCheck = await requireAdmin()
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.message || 'Non autorisé' },
        { status: adminCheck.status }
      )
    }

    const { email, type } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    console.log(`📧 Sending test email: ${type} to ${email}`)

    switch (type) {
      case 'order-confirmation': {
        // Récupérer la dernière commande réelle
        const { data: order } = await supabaseAdmin
          .from('orders')
          .select(
            'id, order_number, customer_name, total_amount, shipping_amount, shipping_address, user_id'
          )
          .eq('payment_status', 'paid')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (!order) {
          // Fallback sur des données de test si pas de commande
          await sendOrderConfirmationEmail(email, {
            orderNumber: 'BR-TEST-001',
            customerName: 'Client',
            items: [
              {
                name: '.white glade skirt - S',
                quantity: 1,
                price: 165,
              },
            ],
            subtotal: 165,
            shipping: 0,
            total: 165,
            shippingAddress: {
              line1: '123 rue de la Mode',
              city: 'Paris',
              postalCode: '75001',
              country: 'France',
            },
          })
          break
        }

        // Récupérer les items
        const { data: items } = await supabaseAdmin
          .from('order_items')
          .select(
            'product_name, variant_name, variant_value, quantity, unit_price, product_id'
          )
          .eq('order_id', order.id)

        // Récupérer les images
        const productIds =
          items
            ?.map((i) => i.product_id)
            .filter((id): id is string => id !== null) || []

        const { data: images } = await supabaseAdmin
          .from('product_images')
          .select('id, product_id')
          .in('product_id', productIds)
          .eq('is_primary', true)

        const imageMap = new Map(images?.map((img) => [img.product_id, img.id]))

        const formattedItems =
          items?.map((item) => ({
            name: `${item.product_name}${item.variant_name ? ` - ${item.variant_name}: ${item.variant_value}` : ''}`,
            quantity: item.quantity,
            price: item.unit_price,
            imageUrl:
              item.product_id && imageMap.has(item.product_id)
                ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/product-images/${imageMap.get(item.product_id)}/signed-url?variant=sm&format=jpeg`
                : undefined,
          })) || []

        const subtotal =
          items?.reduce(
            (sum, item) => sum + item.unit_price * item.quantity,
            0
          ) || 0
        const shippingAddr = order.shipping_address as any

        await sendOrderConfirmationEmail(email, {
          orderNumber: order.order_number,
          customerName: order.customer_name?.split(' ')[0] || 'Client',
          items: formattedItems,
          subtotal,
          shipping: order.shipping_amount || 0,
          total: order.total_amount,
          shippingAddress: {
            line1: shippingAddr?.address_line1 || '123 rue de la Mode',
            line2: shippingAddr?.address_line2,
            city: shippingAddr?.city || 'Paris',
            postalCode: shippingAddr?.postal_code || '75001',
            country: shippingAddr?.country || 'France',
          },
        })
        break
      }

      case 'order-shipped': {
        await sendOrderShippedEmail(email, {
          orderNumber: 'BR-2025-000042',
          customerName: 'Marie',
          trackingNumber: 'FR123456789',
          carrier: 'Colissimo',
          trackingUrl:
            'https://www.laposte.fr/outils/suivre-vos-envois?code=FR123456789',
          estimatedDelivery: 'Friday, October 18, 2025',
        })
        break
      }

      case 'order-delivered': {
        await sendOrderDeliveredEmail(email, {
          orderNumber: 'BR-2025-000042',
          customerName: 'Marie',
          deliveredAt: 'Wednesday, October 16, 2025 at 2:30 PM',
        })
        break
      }

      case 'welcome': {
        await sendWelcomeEmail(email, {
          firstName: 'Marie',
        })
        break
      }

      case 'password-reset': {
        await sendPasswordResetEmail(email, {
          resetUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=test123`,
          expiresIn: '1 hour',
        })
        break
      }

      case 'newsletter-confirmation': {
        await sendNewsletterConfirmationEmail(email, {
          firstName: 'thomas',
          confirmUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/newsletter/confirm?token=TEST_TOKEN_123456`,
        })
        break
      }

      default:
        return NextResponse.json(
          { error: 'Unknown email type' },
          { status: 400 }
        )
    }

    console.log(`✅ Test email sent: ${type}`)

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${email}`,
    })
  } catch (error) {
    console.error('❌ Error sending test email:', error)

    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
