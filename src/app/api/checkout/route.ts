// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

interface CheckoutItem {
  product_id: string
  variant_id?: string | null
  name: string
  price: number
  quantity: number
  image?: string
  size?: string
  color?: string
}

interface CheckoutRequestBody {
  items: CheckoutItem[]
  email: string
  shippingAddress: {
    first_name: string
    last_name: string
    address_line_1: string
    address_line_2?: string
    city: string
    postal_code: string
    country: string
  }
  billingAddress: {
    first_name: string
    last_name: string
    address_line_1: string
    address_line_2?: string
    city: string
    postal_code: string
    country: string
  }
  useShippingForBilling?: boolean
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutRequestBody = await req.json()
    const { items, email, shippingAddress, billingAddress } = body

    console.log('📦 Checkout request received')

    if (!items?.length || !email || !shippingAddress || !billingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // ÉTAPE 1 : Créer la commande AVEC les adresses
    const orderNumber = `BR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    console.log('📋 Creating order with addresses...')

    // Nettoyer les objets pour PostgreSQL JSONB
    const shippingAddressJson = JSON.parse(JSON.stringify(shippingAddress))
    const billingAddressJson = JSON.parse(JSON.stringify(billingAddress))

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_email: email,
        customer_name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
        total_amount: totalAmount,
        payment_status: 'pending',
        status: 'pending',
        shipping_address: shippingAddressJson,
        billing_address: billingAddressJson,
      })
      .select('id, order_number, shipping_address, billing_address')
      .single()

    if (orderError) {
      console.error('❌ Order creation error:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      )
    }

    console.log('✅ Order created:', order.order_number)

    // ÉTAPE 2 : Créer la session Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    console.log('💳 Creating Stripe session...')

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      customer_email: email,
      // ⚠️ Ne PAS collecter shipping_address via Stripe (on la gère nous-même)
      billing_address_collection: 'auto',
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
        items: JSON.stringify(
          items.map((item) => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.image,
          }))
        ),
      },
    })

    console.log('✅ Stripe session created:', session.id)

    // ÉTAPE 3 : Lier la session Stripe ET préserver les adresses
    console.log('🔗 Linking Stripe session and preserving addresses...')

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        stripe_session_id: session.id,
        // 🚨 CRITICAL FIX : Forcer explicitement les adresses
        // Car Supabase met les colonnes JSONB à null si non spécifiées lors d'un UPDATE
        shipping_address: shippingAddressJson,
        billing_address: billingAddressJson,
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('❌ Update error:', updateError)
      return NextResponse.json(
        {
          error: 'Failed to link Stripe session',
          details: updateError.message,
        },
        { status: 500 }
      )
    }

    console.log('✅ Order linked to Stripe session (addresses preserved)')

    // ÉTAPE 4 : Vérification finale (optionnelle, pour debug)
    if (process.env.NODE_ENV === 'development') {
      const { data: finalCheck } = await supabaseAdmin
        .from('orders')
        .select('id, stripe_session_id, shipping_address, billing_address')
        .eq('id', order.id)
        .single()

      console.log('🔍 FINAL CHECK:', {
        id: finalCheck?.id,
        stripe_session_id: finalCheck?.stripe_session_id,
        has_shipping_address: !!finalCheck?.shipping_address,
        has_billing_address: !!finalCheck?.billing_address,
      })
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('❌ Checkout error:', error)
    return NextResponse.json(
      {
        error: 'Checkout failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
