// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Client Supabase avec service role
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Désactiver le body parsing de Next.js pour les webhooks
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: any

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  console.log('Webhook received:', event.type)

  // Traiter les différents types d'événements
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object)
      break

    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object)
      break

    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutSessionCompleted(session: any) {
  console.log('Checkout session completed:', session.id)

  try {
    // ✅ FIX : Expand shipping_details en plus des autres
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'customer_details', 'shipping_details'],
    })

    const paymentIntentId = fullSession.payment_intent as string
    const customerEmail =
      fullSession.customer_details?.email || session.customer_email
    // ✅ FIX : Utiliser le bon chemin pour shipping_details
    const shippingAddress =
      (fullSession as any).shipping_details?.address || null
    const customerName = fullSession.customer_details?.name || ''

    // Mettre à jour la commande
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        paid_at: new Date().toISOString(),
        customer_name: customerName,
        shipping_address: shippingAddress,
      })
      .eq('payment_intent_id', paymentIntentId)

    if (updateError) {
      console.error('Error updating order:', updateError)
    } else {
      console.log(
        'Order updated successfully for payment_intent:',
        paymentIntentId
      )
    }

    // Créer les order items
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('payment_intent_id', paymentIntentId)
      .single()

    if (order) {
      const items = JSON.parse(session.metadata?.items || '[]')

      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        product_name: item.name || null,
        product_sku: null,
        variant_name:
          item.size || item.color
            ? `${item.size || ''} ${item.color || ''}`.trim()
            : null,
        variant_value: null,
        image_url: item.image || null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))

      if (orderItems.length > 0) {
        const { error: itemsError } = await supabaseAdmin
          .from('order_items')
          .insert(orderItems)

        if (itemsError) {
          console.error('Error creating order items:', itemsError)
        } else {
          console.log(`Created ${orderItems.length} order items`)
        }
      }
    }
  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('Payment intent succeeded:', paymentIntent.id)

  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'processing',
      paid_at: new Date().toISOString(),
    })
    .eq('payment_intent_id', paymentIntent.id)

  if (error) {
    console.error('Error updating order on payment success:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  console.log('Payment intent failed:', paymentIntent.id)

  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'failed',
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('payment_intent_id', paymentIntent.id)

  if (error) {
    console.error('Error updating order on payment failure:', error)
  }
}
