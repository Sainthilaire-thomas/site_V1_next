// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      items,
      email,
      phone,
      billingAddress,
      shippingMethod,
      totalAmount,
      shippingAmount,
      taxAmount,
    } = body

    // Validation des données
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Générer le numéro de commande AVANT de créer la session
    const { data: orderNumber, error: orderNumberError } =
      await supabaseAdmin.rpc('generate_order_number')

    if (orderNumberError) {
      console.error('Error generating order number:', orderNumberError)
      throw new Error('Failed to generate order number')
    }

    console.log('🔍 Order number generated:', orderNumber)

    // Créer les line items pour Stripe
    const lineItems = items.map((item: any) => {
      let productName = item.name || 'Product'
      if (item.size) productName += ` - ${item.size}`
      if (item.color) productName += ` - ${item.color}`

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: productName,
            description: item.description || undefined,
            images: item.image_url ? [item.image_url] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }
    })

    // Ajouter les frais de livraison si > 0
    if (shippingAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Shipping',
            description: shippingMethod || 'Standard shipping',
            images: [],
          },
          unit_amount: Math.round(shippingAmount * 100),
        },
        quantity: 1,
      })
    }

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
      customer_email: email,
      metadata: {
        order_number: orderNumber as string, // ✅ Ajouter le order_number dans les métadonnées
        phone: phone || '',
        billing_address: JSON.stringify(billingAddress),
        shipping_method: shippingMethod || 'Standard',
        items: JSON.stringify(
          items.map((item: any) => ({
            product_id: item.product_id,
            variant_id: item.variant_id || null,
            name: item.name,
            size: item.size || null,
            color: item.color || null,
            price: item.price,
            quantity: item.quantity,
            image: item.image_url || null,
          }))
        ),
      },
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'LU', 'CH', 'DE', 'IT', 'ES', 'PT'],
      },
    })

    console.log('🔍 Session created:', session.id)
    console.log('🔍 Payment intent at creation:', session.payment_intent) // Sera null

    // ✅ Créer la commande avec session.id comme référence temporaire
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber as string,
        customer_email: email,
        customer_name: `${billingAddress.first_name} ${billingAddress.last_name}`,
        customer_phone: phone || null,
        status: 'pending',
        payment_status: 'pending',
        payment_intent_id: null, // ✅ Sera rempli par le webhook
        stripe_session_id: session.id, // ✅ IMPORTANT : Ajouter cette colonne
        total_amount: totalAmount,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        discount_amount: 0,
        billing_address: billingAddress,
        shipping_address: billingAddress,
        shipping_method: shippingMethod,
        fulfillment_status: 'unfulfilled',
      })
      .select()
      .single()

    if (orderError) {
      console.error('❌ Error creating order:', orderError)
      throw new Error('Failed to create order')
    } else {
      console.log('✅ Order created:', order.order_number)
      console.log('✅ Session ID saved:', order.stripe_session_id)
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      orderNumber: orderNumber,
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
