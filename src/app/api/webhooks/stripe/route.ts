// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

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
  console.log('🎉 Checkout session completed:', session.id)

  try {
    // ✅ ÉTAPE 1 : Récupérer la commande
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, payment_intent_id')
      .eq('stripe_session_id', session.id)
      .single()

    if (orderError || !order) {
      console.error('❌ Error finding order:', orderError)
      return
    }

    console.log('📋 Order found:', order.id)

    // ✅ ÉTAPE 2 : Vérifier si les items existent déjà (protection contre doublons)
    const { data: existingItems, error: checkError } = await supabaseAdmin
      .from('order_items')
      .select('id')
      .eq('order_id', order.id)
      .limit(1)

    if (checkError) {
      console.error('❌ Error checking existing items:', checkError)
      return
    }

    if (existingItems && existingItems.length > 0) {
      console.log('⚠️ Order items already exist, skipping creation')
      // ✅ Mettre quand même à jour la commande au cas où
      await updateOrderStatus(order.id, session)
      return
    }

    // ✅ ÉTAPE 3 : Récupérer les détails complets de la session
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'customer_details'],
    })

    console.log('📦 Full session metadata:', fullSession.metadata)

    const paymentIntentId = fullSession.payment_intent as string
    const customerEmail =
      fullSession.customer_details?.email || session.customer_email
    const shippingAddress =
      (fullSession as any).shipping_details?.address || null
    const customerName = fullSession.customer_details?.name || ''

    console.log('💳 Payment Intent ID:', paymentIntentId)
    console.log('📍 Shipping address:', shippingAddress)

    // ✅ ÉTAPE 4 : Mettre à jour la commande avec le payment_intent_id
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        paid_at: new Date().toISOString(),
        payment_intent_id: paymentIntentId,
        customer_name: customerName,
        shipping_address: shippingAddress,
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('❌ Error updating order:', updateError)
    } else {
      console.log('✅ Order updated successfully')
    }

    // ✅ ÉTAPE 5 : Parser les items depuis les métadonnées
    const itemsString = fullSession.metadata?.items || '[]'
    console.log('📦 Raw items string:', itemsString)

    const items = JSON.parse(itemsString)
    console.log('📦 Parsed items:', JSON.stringify(items, null, 2))

    if (!items || items.length === 0) {
      console.error('❌ No items found in metadata')
      return
    }

    // ✅ ÉTAPE 6 : Créer les order items
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

    console.log(
      '📦 Order items to insert:',
      JSON.stringify(orderItems, null, 2)
    )

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // ✅ Si erreur de contrainte unique (code 23505), c'est OK
      if (itemsError.code === '23505') {
        console.log('⚠️ Duplicate items detected (unique constraint), skipping')
        return
      }
      console.error('❌ Error creating order items:', itemsError)
      console.error('❌ Full error:', JSON.stringify(itemsError, null, 2))
    } else {
      console.log(`✅ Created ${orderItems.length} order items`)
    }
  } catch (error) {
    console.error('❌ Error in handleCheckoutSessionCompleted:', error)
  }
}

// ✅ Fonction helper pour mettre à jour le statut
async function updateOrderStatus(orderId: string, session: any) {
  try {
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['customer_details'],
    })

    const paymentIntentId = fullSession.payment_intent as string
    const shippingAddress =
      (fullSession as any).shipping_details?.address || null
    const customerName = fullSession.customer_details?.name || ''

    await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        paid_at: new Date().toISOString(),
        payment_intent_id: paymentIntentId,
        customer_name: customerName,
        shipping_address: shippingAddress,
      })
      .eq('id', orderId)

    console.log('✅ Order status updated (items already existed)')
  } catch (error) {
    console.error('❌ Error updating order status:', error)
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
