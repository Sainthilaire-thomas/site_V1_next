// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendOrderConfirmationHook } from '@/lib/email/send-order-confirmation-hook'

// ✅ Helper sécurisé pour envoyer l'email sans faire échouer le webhook
async function sendConfirmationEmailSafe(orderId: string) {
  try {
    console.log('📧 Attempting to send confirmation email...')
    const result = await sendOrderConfirmationHook(orderId)

    if (result.success) {
      console.log('✅ Confirmation email sent successfully')
    } else {
      console.error('⚠️ Email sending failed (non-critical):', result.error)
    }
  } catch (error) {
    console.error('⚠️ Email sending error (non-critical):', error)
    // Ne pas faire échouer le webhook si l'email échoue
  }
}

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
    console.error('❌ Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  console.log(`\n🔔 Webhook received: ${event.type}`)

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
      console.log(`ℹ️ Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutSessionCompleted(session: any) {
  console.log('\n🎉 Checkout session completed:', session.id)

  try {
    // ÉTAPE 1 : Récupérer les détails complets de la session
    console.log('📋 Step 1: Fetching full session details...')
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'customer_details', 'payment_intent'],
    })

    // ✅ FIX : Gérer les 2 cas (string ou objet)
    const paymentIntent = fullSession.payment_intent
    const paymentIntentId =
      typeof paymentIntent === 'string'
        ? paymentIntent
        : paymentIntent?.id || null

    if (!paymentIntentId) {
      console.log(
        '⏳ Payment intent not yet created, deferring to payment_intent.succeeded'
      )
      return
    }

    console.log(`✅ Payment Intent found: ${paymentIntentId}`)

    // ÉTAPE 2 : Récupérer la commande
    console.log('📋 Step 2: Finding order...')
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, payment_intent_id, order_number')
      .eq('stripe_session_id', session.id)
      .single()

    if (orderError || !order) {
      console.error('❌ Error finding order:', orderError)
      return
    }

    console.log(`✅ Order found: ${order.order_number} (${order.id})`)

    // ÉTAPE 3 : Vérifier si les items existent déjà
    console.log('📋 Step 3: Checking for existing items...')
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
      console.log('⚠️ Order items already exist, just updating order')
      await updateOrderWithSessionData(order.id, fullSession, paymentIntentId)
      // ✅ NOUVEAU : Envoyer l'email de confirmation
      await sendConfirmationEmailSafe(order.id)
      return
    }

    console.log('✅ No existing items, proceeding with creation')

    // ÉTAPE 4 : Créer les items
    await createOrderItemsFromSession(order.id, fullSession, paymentIntentId)
    // ✅ NOUVEAU : Envoyer l'email de confirmation après création des items
    await sendConfirmationEmailSafe(order.id)
  } catch (error) {
    console.error('❌ Exception in handleCheckoutSessionCompleted:')
    console.error(error)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('\n💳 Payment intent succeeded:', paymentIntent.id)

  try {
    // ✅ Récupérer la session associée
    console.log('📋 Step 1: Finding associated session...')
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1,
    })

    if (sessions.data.length === 0) {
      console.log('⚠️ No session found for this payment intent')
      // Fallback : mettre à jour via payment_intent_id uniquement
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
          paid_at: new Date().toISOString(),
        })
        .eq('payment_intent_id', paymentIntent.id)
      return
    }

    const sessionId = sessions.data[0].id
    console.log(`✅ Session found: ${sessionId}`)

    // ✅ Récupérer la session COMPLÈTE avec expand
    console.log('📋 Step 2: Fetching full session details...')
    const fullSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details', 'payment_intent'],
    })

    // ✅ Mettre à jour la commande
    console.log('📋 Step 3: Finding order...')
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number')
      .eq('stripe_session_id', sessionId)
      .single()

    if (orderError || !order) {
      console.error('❌ Error finding order:', orderError)
      return
    }

    console.log(`✅ Order found: ${order.order_number} (${order.id})`)

    // ✅ Vérifier si les items existent déjà
    console.log('📋 Step 4: Checking for existing items...')
    const { data: existingItems } = await supabaseAdmin
      .from('order_items')
      .select('id')
      .eq('order_id', order.id)
      .limit(1)

    if (existingItems && existingItems.length > 0) {
      console.log('✅ Order items already exist, just updating payment status')
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
          paid_at: new Date().toISOString(),
          payment_intent_id: paymentIntent.id,
        })
        .eq('id', order.id)
      return
    }

    // ✅ Les items n'existent pas : les créer maintenant
    console.log('⚠️ Order items missing, creating them now...')
    await createOrderItemsFromSession(order.id, fullSession, paymentIntent.id)
  } catch (error) {
    console.error('❌ Error in handlePaymentIntentSucceeded:', error)
  }
}

// ✅ Fonction utilitaire pour créer les order items
async function createOrderItemsFromSession(
  orderId: string,
  fullSession: any,
  paymentIntentId: string | any
) {
  try {
    // ✅ FIX : Extraire l'ID si c'est un objet
    const paymentIntentIdString =
      typeof paymentIntentId === 'string'
        ? paymentIntentId
        : paymentIntentId?.id || null

    if (!paymentIntentIdString) {
      console.error('❌ No valid payment intent ID')
      return
    }

    const customerEmail =
      fullSession.customer_details?.email || fullSession.customer_email
    const shippingAddress = fullSession.shipping_details?.address || null
    const customerName = fullSession.customer_details?.name || ''

    console.log('📋 Step A: Updating order with session data...')
    console.log(`   💳 Payment Intent: ${paymentIntentIdString}`)
    console.log(`   👤 Customer: ${customerName} (${customerEmail})`)
    console.log(`   📍 Shipping: ${shippingAddress ? 'Present' : 'None'}`)

    // Mettre à jour la commande
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        paid_at: new Date().toISOString(),
        payment_intent_id: paymentIntentIdString,
        customer_name: customerName,
        shipping_address: shippingAddress,
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('❌ Error updating order:', updateError)
      return
    }

    console.log('✅ Order updated successfully')

    // Parser les items depuis les métadonnées
    console.log('📋 Step B: Parsing items from metadata...')
    const itemsString = fullSession.metadata?.items || '[]'

    let items
    try {
      items = JSON.parse(itemsString)
    } catch (e) {
      console.error('❌ Error parsing items JSON:', e)
      console.error('   Raw string:', itemsString)
      return
    }

    if (!items || items.length === 0) {
      console.error('❌ No items found in metadata')
      return
    }

    console.log(`✅ Found ${items.length} items in metadata`)

    // Créer les order items
    console.log('📋 Step C: Creating order items...')
    const orderItems = items.map((item: any) => ({
      order_id: orderId,
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

    console.log('   Items to insert:', JSON.stringify(orderItems, null, 2))

    const { data: insertedItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)
      .select()

    if (itemsError) {
      if (itemsError.code === '23505') {
        console.log('⚠️ Duplicate items detected (already created)')
        return
      }

      console.error('❌ Error creating order items:')
      console.error('   Code:', itemsError.code)
      console.error('   Message:', itemsError.message)
      return
    }

    if (!insertedItems || insertedItems.length === 0) {
      console.error('⚠️ No items were inserted')
      return
    }

    console.log(`✅ Successfully created ${insertedItems.length} order items`)
    console.log('   IDs:', insertedItems.map((i) => i.id).join(', '))
  } catch (error) {
    console.error('❌ Error in createOrderItemsFromSession:', error)
  }
}

// ✅ Fonction utilitaire pour mettre à jour l'ordre sans créer d'items
async function updateOrderWithSessionData(
  orderId: string,
  fullSession: any,
  paymentIntentId: string | any
) {
  try {
    // ✅ FIX : Extraire l'ID si c'est un objet
    const paymentIntentIdString =
      typeof paymentIntentId === 'string'
        ? paymentIntentId
        : paymentIntentId?.id || null

    const shippingAddress = fullSession.shipping_details?.address || null
    const customerName = fullSession.customer_details?.name || ''

    await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        paid_at: new Date().toISOString(),
        payment_intent_id: paymentIntentIdString,
        customer_name: customerName,
        shipping_address: shippingAddress,
      })
      .eq('id', orderId)

    console.log('✅ Order updated (items already existed)')
  } catch (error) {
    console.error('❌ Error updating order:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  console.log('\n❌ Payment intent failed:', paymentIntent.id)

  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'failed',
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('payment_intent_id', paymentIntent.id)

  if (error) {
    console.error('❌ Error updating order on payment failure:', error)
  } else {
    console.log('✅ Order marked as failed')
  }
}
