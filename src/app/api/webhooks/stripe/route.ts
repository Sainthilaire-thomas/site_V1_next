// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendOrderConfirmationHook } from '@/lib/email/send-order-confirmation-hook'
import { decrementStockForOrder } from '@/lib/stock/decrement-stock'

function parseAddress(address: any): any {
  if (!address) return null
  if (typeof address === 'string') {
    try {
      return JSON.parse(address)
    } catch {
      return null
    }
  }
  return address
}

async function sendConfirmationEmailSafe(orderId: string) {
  try {
    const result = await sendOrderConfirmationHook(orderId)
    if (result.success) {
      console.log('✅ Email sent')
    }
  } catch (error) {
    console.error('⚠️ Email error:', error)
  }
}

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  const now = new Date().toISOString()
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📥 WEBHOOK RECEIVED AT ${now}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: any
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('❌ Webhook error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  console.log(`\n🔔 Webhook: ${event.type}`)

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
      console.log(`ℹ️ Unhandled: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutSessionCompleted(session: any) {
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('🎉 CHECKOUT SESSION COMPLETED')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('Session ID:', session.id)

  try {
    console.log('\n📋 Step 1: Fetching full session from Stripe...')
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'customer_details', 'payment_intent'],
    })
    console.log('   ✅ Full session retrieved')

    const paymentIntentId =
      typeof fullSession.payment_intent === 'string'
        ? fullSession.payment_intent
        : fullSession.payment_intent?.id || null

    if (!paymentIntentId) {
      console.log('   ⏳ No payment intent yet, exiting')
      return
    }
    console.log('   ✅ Payment Intent ID:', paymentIntentId)

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LECTURE DE LA COMMANDE DEPUIS SUPABASE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n📋 Step 2: Reading order from Supabase...')
    console.log('   └─ Looking for stripe_session_id:', session.id)

    const { data: orderRaw, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(
        'id, order_number, shipping_address, billing_address, created_at, updated_at'
      )
      .eq('stripe_session_id', session.id)
      .single()

    if (orderError) {
      console.error('   ❌ Error finding order:', orderError)
      return
    }

    if (!orderRaw) {
      console.error('   ❌ No order found')
      return
    }

    console.log('\n   ✅ Order found in database:')
    console.log('   ├─ Order ID:', orderRaw.id)
    console.log('   ├─ Order number:', orderRaw.order_number)
    console.log('   ├─ Created at:', orderRaw.created_at)
    console.log('   ├─ Updated at:', orderRaw.updated_at)
    console.log(
      '   ├─ shipping_address type:',
      typeof orderRaw.shipping_address
    )
    console.log(
      '   ├─ shipping_address is null?',
      orderRaw.shipping_address === null
    )
    console.log('   ├─ shipping_address value:')
    console.log(JSON.stringify(orderRaw.shipping_address, null, 6))
    console.log('   ├─ billing_address type:', typeof orderRaw.billing_address)
    console.log(
      '   ├─ billing_address is null?',
      orderRaw.billing_address === null
    )
    console.log('   └─ billing_address value:')
    console.log(JSON.stringify(orderRaw.billing_address, null, 6))

    if (!orderRaw.shipping_address) {
      console.error('\n   🚨 🚨 🚨 CRITICAL ALERT 🚨 🚨 🚨')
      console.error('   🚨 shipping_address is NULL when webhook reads it!')
      console.error('   🚨 It was set to NULL BEFORE this webhook executed')
      console.error('   🚨 Check: triggers, RLS policies, or other code')
      console.error('   🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨\n')
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // VÉRIFIER SI LES ITEMS EXISTENT DÉJÀ
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n📋 Step 3: Checking for existing order items...')

    const { data: existingItems, error: itemsCheckError } = await supabaseAdmin
      .from('order_items')
      .select('id')
      .eq('order_id', orderRaw.id)
      .limit(1)

    if (itemsCheckError) {
      console.error('   ❌ Error checking items:', itemsCheckError)
    }

    if (existingItems && existingItems.length > 0) {
      console.log('   ⚠️ Order items already exist')
      console.log(
        '   └─ Will update payment status ONLY (no address modification)'
      )

      console.log('\n📋 Step 4: Updating payment status...')
      console.log('   └─ [Executing UPDATE with ONLY payment fields...]')

      const { data: updatedOrders, error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
          paid_at: new Date().toISOString(),
          payment_intent_id: paymentIntentId,
        })
        .eq('id', orderRaw.id)
        .select('shipping_address, billing_address')

      if (updateError) {
        console.error('   ❌ UPDATE error:', updateError)
      } else {
        console.log('   ✅ UPDATE successful')
        console.log(
          '   ├─ shipping_address after UPDATE:',
          JSON.stringify(updatedOrders?.[0]?.shipping_address, null, 2)
        )
        console.log(
          '   └─ billing_address after UPDATE:',
          JSON.stringify(updatedOrders?.[0]?.billing_address, null, 2)
        )

        if (!updatedOrders?.[0]?.shipping_address) {
          console.error('\n   🚨 shipping_address is STILL NULL after UPDATE')
          console.error('   🚨 But we did NOT modify it in the UPDATE!')
          console.error(
            '   🚨 This confirms: it was ALREADY NULL before UPDATE\n'
          )
        }
      }

      await decrementStockForOrder(orderRaw.id)
      await sendConfirmationEmailSafe(orderRaw.id)

      console.log('═══════════════════════════════════════════════════════════')
      console.log('✅ WEBHOOK COMPLETED (items already existed)')
      console.log(
        '═══════════════════════════════════════════════════════════\n'
      )
      return
    }

    console.log('   ✅ No existing items, will create them')
    await createOrderItemsFromSession(orderRaw.id, fullSession, paymentIntentId)
    await decrementStockForOrder(orderRaw.id)
    await sendConfirmationEmailSafe(orderRaw.id)

    console.log('═══════════════════════════════════════════════════════════')
    console.log('✅ WEBHOOK COMPLETED (items created)')
    console.log('═══════════════════════════════════════════════════════════\n')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('💳 PAYMENT INTENT SUCCEEDED')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('Payment Intent ID:', paymentIntent.id)

  try {
    console.log('\n📋 Step 1: Finding associated session...')
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1,
    })

    if (sessions.data.length === 0) {
      console.log('   ⚠️ No session found, updating order directly')
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
          paid_at: new Date().toISOString(),
        })
        .eq('payment_intent_id', paymentIntent.id)
      console.log('   ✅ Order updated')
      console.log('═══════════════════════════════════════════════════════════')
      console.log('✅ PAYMENT INTENT SUCCEEDED COMPLETED (no session)')
      console.log(
        '═══════════════════════════════════════════════════════════\n'
      )
      return
    }

    const sessionId = sessions.data[0].id
    console.log('   ✅ Session found:', sessionId)

    console.log('\n📋 Step 2: Fetching full session...')
    const fullSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    })
    console.log('   ✅ Full session retrieved')

    console.log('\n📋 Step 3: Finding order...')
    const { data: orderRaw, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, shipping_address, billing_address')
      .eq('stripe_session_id', sessionId)
      .single()

    if (orderError || !orderRaw) {
      console.error('   ❌ Error finding order:', orderError)
      console.log('═══════════════════════════════════════════════════════════')
      console.log('❌ PAYMENT INTENT SUCCEEDED FAILED (order not found)')
      console.log(
        '═══════════════════════════════════════════════════════════\n'
      )
      return
    }

    console.log('   ✅ Order found:', orderRaw.order_number)
    console.log(
      '   ├─ shipping_address is null?',
      orderRaw.shipping_address === null
    )
    console.log(
      '   └─ billing_address is null?',
      orderRaw.billing_address === null
    )

    console.log('\n📋 Step 4: Checking for existing items...')
    const { data: existingItems } = await supabaseAdmin
      .from('order_items')
      .select('id')
      .eq('order_id', orderRaw.id)
      .limit(1)

    if (existingItems && existingItems.length > 0) {
      console.log('   ⚠️ Order items already exist')
      console.log('   └─ Skipping payment_intent.succeeded processing')
      console.log('   └─ (checkout.session.completed will handle it)')
      console.log('═══════════════════════════════════════════════════════════')
      console.log('✅ PAYMENT INTENT SUCCEEDED COMPLETED (items exist)')
      console.log(
        '═══════════════════════════════════════════════════════════\n'
      )
      return
    }

    console.log('   ✅ No existing items, will create them')
    console.log('\n⚠️  WARNING: payment_intent.succeeded is creating items')
    console.log('⚠️  This might race with checkout.session.completed!')

    await createOrderItemsFromSession(
      orderRaw.id,
      fullSession,
      paymentIntent.id
    )

    console.log('═══════════════════════════════════════════════════════════')
    console.log('✅ PAYMENT INTENT SUCCEEDED COMPLETED (items created)')
    console.log('═══════════════════════════════════════════════════════════\n')
  } catch (error) {
    console.error('❌ Error in handlePaymentIntentSucceeded:', error)
    console.log('═══════════════════════════════════════════════════════════')
    console.log('❌ PAYMENT INTENT SUCCEEDED FAILED')
    console.log('═══════════════════════════════════════════════════════════\n')
  }
}

async function createOrderItemsFromSession(
  orderId: string,
  fullSession: any,
  paymentIntentId: any
) {
  try {
    const paymentIntentIdString =
      typeof paymentIntentId === 'string'
        ? paymentIntentId
        : paymentIntentId?.id || null

    if (!paymentIntentIdString) return

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ NE PLUS FAIRE D'UPDATE ICI !
    // Les webhooks principaux s'en chargent déjà
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CRÉER LES ORDER ITEMS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const items = JSON.parse(fullSession.metadata?.items || '[]')
    if (!items || items.length === 0) {
      console.error('❌ No items in session metadata')
      return
    }

    const orderItems = items.map((item: any) => ({
      order_id: orderId,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      product_name: item.name,
      variant_name:
        item.size || item.color
          ? `${item.size || ''} ${item.color || ''}`.trim()
          : null,
      image_url: item.image || null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }))

    const { error: insertError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (insertError) {
      // ✅ Ignorer les doublons (race condition)
      if (insertError.code === '23505') {
        console.log('⚠️ Items already exist (race condition)')
        return
      }
      console.error('❌ Error inserting order items:', insertError)
    } else {
      console.log(`✅ Inserted ${orderItems.length} order items`)
    }
  } catch (error) {
    console.error('❌ Error in createOrderItemsFromSession:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'failed',
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('payment_intent_id', paymentIntent.id)
}
