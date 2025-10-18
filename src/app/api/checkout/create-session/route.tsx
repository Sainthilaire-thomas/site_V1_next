// src/app/api/checkout/create-session/route.tsx

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

interface CartItem {
  productId: string
  variantId?: string | null
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  image?: string
}

interface ShippingAddress {
  first_name: string
  last_name: string
  email: string
  phone?: string
  address_line1: string
  address_line2?: string
  city: string
  postal_code: string
  country: string
}

export async function POST(req: NextRequest) {
  console.log('\n\n')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('🚀 CHECKOUT SESSION CREATION START')
  console.log('═══════════════════════════════════════════════════════════')

  try {
    const { items, shippingAddress } = (await req.json()) as {
      items: CartItem[]
      shippingAddress: ShippingAddress
    }

    console.log('\n📦 Step 1: Request received')
    console.log('   └─ Items count:', items?.length)
    console.log('   └─ Customer email:', shippingAddress?.email)

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // VALIDATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n🔍 Step 2: Validation')

    if (!items || items.length === 0) {
      console.error('   ❌ Empty cart')
      return NextResponse.json({ error: 'Le panier est vide' }, { status: 400 })
    }
    console.log('   ✅ Cart has items')

    if (!shippingAddress?.email || !shippingAddress?.address_line1) {
      console.error('   ❌ Incomplete address')
      return NextResponse.json({ error: 'Adresse incomplète' }, { status: 400 })
    }
    console.log('   ✅ Address is complete')

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CALCUL DES MONTANTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n💰 Step 3: Amount calculation')

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const totalAmount = subtotal

    console.log('   └─ Total:', totalAmount.toFixed(2), '€')

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ÉTAPE 1 : CRÉER LA COMMANDE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n📝 Step 4: Creating order in Supabase')
    console.log('   ┌─ Shipping address to insert:')
    console.log('   │  Type:', typeof shippingAddress)
    console.log('   │  Value:', JSON.stringify(shippingAddress, null, 2))
    console.log('   └─ [Preparing INSERT...]')

    const insertData = {
      order_number: '', // Le trigger le générera
      customer_email: shippingAddress.email,
      customer_name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
      customer_phone: shippingAddress.phone || null,
      shipping_address: shippingAddress as any,
      billing_address: shippingAddress as any,
      total_amount: totalAmount,
      shipping_amount: 0,
      tax_amount: 0,
      discount_amount: 0,
      shipping_method: 'standard',
      status: 'pending',
      payment_status: 'pending',
      fulfillment_status: 'unfulfilled',
      notes: null,
      admin_notes: null,
      stripe_session_id: null,
      payment_intent_id: null,
      user_id: null,
    }

    console.log('   ┌─ Insert data prepared')
    console.log('   └─ Keys:', Object.keys(insertData).join(', '))

    const { data: orders, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(insertData)
      .select()

    if (orderError) {
      console.error('   ❌ Supabase error:', orderError)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    if (!orders || orders.length === 0) {
      console.error('   ❌ No order returned')
      return NextResponse.json(
        { error: 'Aucune commande créée' },
        { status: 500 }
      )
    }

    const order = orders[0]

    console.log('\n   ✅ Order created (returned from INSERT):')
    console.log('   ├─ ID:', order.id)
    console.log('   ├─ Number:', order.order_number)
    console.log('   ├─ Email:', order.customer_email)
    console.log('   ├─ Total:', order.total_amount)
    console.log('   ├─ shipping_address type:', typeof order.shipping_address)
    console.log(
      '   ├─ shipping_address is null?',
      order.shipping_address === null
    )
    console.log(
      '   └─ shipping_address value:',
      JSON.stringify(order.shipping_address, null, 2)
    )

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // VÉRIFICATION IMMÉDIATE : Relire la commande
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n🔍 Step 5: IMMEDIATE RE-READ from database')
    console.log('   └─ [Executing SELECT immediately after INSERT...]')

    const { data: verification, error: verifyError } = await supabaseAdmin
      .from('orders')
      .select(
        'id, order_number, shipping_address, billing_address, created_at, updated_at'
      )
      .eq('id', order.id)
      .single()

    if (verifyError) {
      console.error('   ❌ Verification SELECT error:', verifyError)
    } else {
      console.log('   ✅ Verification SELECT successful:')
      console.log('   ├─ Order number:', verification.order_number)
      console.log('   ├─ Created at:', verification.created_at)
      console.log('   ├─ Updated at:', verification.updated_at)
      console.log(
        '   ├─ shipping_address type:',
        typeof verification.shipping_address
      )
      console.log(
        '   ├─ shipping_address is null?',
        verification.shipping_address === null
      )
      console.log(
        '   └─ shipping_address value:',
        JSON.stringify(verification.shipping_address, null, 2)
      )

      if (!verification.shipping_address) {
        console.error('\n   🚨 🚨 🚨 CRITICAL ALERT 🚨 🚨 🚨')
        console.error(
          '   🚨 shipping_address is ALREADY NULL right after INSERT!'
        )
        console.error(
          '   🚨 This means a trigger or constraint is setting it to NULL'
        )
        console.error('   🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨\n')
      } else {
        console.log(
          '   ✅ shipping_address is preserved immediately after INSERT'
        )
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ÉTAPE 2 : CRÉER LA SESSION STRIPE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n💳 Step 6: Creating Stripe session')

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description:
            [item.size, item.color].filter(Boolean).join(' - ') || undefined,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      customer_email: shippingAddress.email,
      locale: 'fr',
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        items: JSON.stringify(
          items.map((item) => ({
            product_id: item.productId,
            variant_id: item.variantId || null,
            name: item.name,
            size: item.size || null,
            color: item.color || null,
            quantity: item.quantity,
            price: item.price,
            image: item.image || null,
          }))
        ),
      },
    })

    console.log('   ✅ Session created:', session.id)

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ÉTAPE 3 : LIER LA SESSION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔗 Step 7: Linking session to order WITH PROTECTION
    console.log('\n🔗 Step 7: Linking session to order WITH ADDRESS PROTECTION')

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        stripe_session_id: session.id,
        shipping_address: order.shipping_address, // 🛡️ PROTECTION
        billing_address: order.billing_address, // 🛡️ PROTECTION
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('   ❌ Error linking session:', updateError.message)
    } else {
      console.log('   ✅ Session linked WITH protected addresses')
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // VÉRIFICATION FINALE : Relire une dernière fois
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n🔍 Step 8: FINAL VERIFICATION before redirect')

    const { data: finalCheck } = await supabaseAdmin
      .from('orders')
      .select('shipping_address, billing_address, stripe_session_id')
      .eq('id', order.id)
      .single()

    console.log('   ├─ stripe_session_id:', finalCheck?.stripe_session_id)
    console.log(
      '   ├─ shipping_address is null?',
      finalCheck?.shipping_address === null
    )
    console.log(
      '   └─ shipping_address:',
      JSON.stringify(finalCheck?.shipping_address, null, 2)
    )

    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('✅ SUCCESS - Redirecting to Stripe')
    console.log(
      '═══════════════════════════════════════════════════════════\n\n'
    )

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      orderNumber: order.order_number,
      orderId: order.id,
    })
  } catch (error: any) {
    console.error(
      '\n═══════════════════════════════════════════════════════════'
    )
    console.error('❌ FAILED')
    console.error('═══════════════════════════════════════════════════════════')
    console.error('Error:', error?.message)
    console.error('Stack:', error?.stack)
    console.error(
      '═══════════════════════════════════════════════════════════\n\n'
    )

    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
