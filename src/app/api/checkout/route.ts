// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Client Supabase avec service role pour bypasser RLS
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // Créer les line items pour Stripe
    const lineItems = items.map((item: any) => {
      // Construire le nom du produit avec variantes si présentes
      let productName = item.name || 'Product'
      if (item.size) productName += ` - ${item.size}`
      if (item.color) productName += ` - ${item.color}`

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: productName,
            description: item.description || undefined,
            // ✅ FIX : Toujours inclure images (même si vide)
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Convertir en centimes
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
            images: [], // ✅ FIX : Ajouter images vide
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
        phone: phone || '',
        billing_address: JSON.stringify(billingAddress),
        shipping_method: shippingMethod || 'Standard',
        items: JSON.stringify(
          items.map((item: any) => ({
            id: item.id,
            product_id: item.productId,
            variant_id: item.variantId || null,
            name: item.name,
            size: item.size || null,
            color: item.color || null,
            price: item.price,
            quantity: item.quantity,
          }))
        ),
      },
      // Activer la collecte d'adresse de livraison
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'LU', 'CH', 'DE', 'IT', 'ES', 'PT'],
      },
    })

    // ✅ Générer le numéro de commande en appelant la fonction SQL
    const { data: orderNumberData, error: orderNumberError } =
      await supabaseAdmin.rpc('generate_order_number')

    if (orderNumberError) {
      console.error('Error generating order number:', orderNumberError)
      throw new Error('Failed to generate order number')
    }

    const orderNumber = orderNumberData as string

    // Créer la commande en attente dans Supabase
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber, // ✅ FIX : Ajouter le order_number généré
        customer_email: email,
        customer_name: `${billingAddress.first_name} ${billingAddress.last_name}`,
        customer_phone: phone || null,
        status: 'pending',
        payment_status: 'pending',
        payment_intent_id: session.payment_intent as string,
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
      console.error('Error creating order:', orderError)
      // On continue quand même pour permettre le paiement
      // Le webhook recréera la commande si nécessaire
    } else {
      console.log('Order created:', order.order_number)
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
