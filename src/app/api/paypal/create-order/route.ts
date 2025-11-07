// src/app/api/paypal/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/paypal'
import checkoutNodeJssdk from '@paypal/checkout-server-sdk'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      items,
      shippingAddress,
      billingAddress,
      customerEmail,
      customerName,
      shippingCost,
    } = body

    console.log('📦 Creating PayPal order...')
    console.log('Items:', items?.length || 0)

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )
    const SHIPPING_COST = shippingCost || 5.9
    const totalAmount = subtotal + SHIPPING_COST

    console.log('💰 Subtotal:', subtotal)
    console.log('🚚 Shipping:', SHIPPING_COST)
    console.log('💳 Total:', totalAmount)

    // Créer la commande dans Supabase
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'paypal',
        total_amount: totalAmount,
        shipping_amount: SHIPPING_COST,
        shipping_address: shippingAddress || null,
        billing_address: billingAddress || null,
        customer_email: customerEmail || null,
        customer_name: customerName || null,
      })
      .select()
      .single()

    if (orderError) {
      console.error('❌ Error creating order in Supabase:', orderError)
      throw orderError
    }

    console.log('✅ Order created in Supabase:', order.order_number)

    // Créer la requête PayPal
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest()
    request.prefer('return=representation')
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: order.id,
          description: `Commande Blanche Renaudin #${order.order_number}`,
          amount: {
            currency_code: 'EUR',
            value: totalAmount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: subtotal.toFixed(2),
              },
              shipping: {
                currency_code: 'EUR',
                value: SHIPPING_COST.toFixed(2),
              },
              handling: {
                currency_code: 'EUR',
                value: '0.00',
              },
              tax_total: {
                currency_code: 'EUR',
                value: '0.00',
              },
              insurance: {
                currency_code: 'EUR',
                value: '0.00',
              },
              shipping_discount: {
                currency_code: 'EUR',
                value: '0.00',
              },
              discount: {
                currency_code: 'EUR',
                value: '0.00',
              },
            },
          },
          items: items.map((item: any) => ({
            name: item.name || 'Produit',
            description: item.variant_name || '',
            unit_amount: {
              currency_code: 'EUR',
              value: item.price.toFixed(2),
            },
            quantity: item.quantity.toString(),
            sku: item.product_id || '',
          })),
        },
      ],
      application_context: {
        brand_name: 'Blanche Renaudin',
        landing_page: 'NO_PREFERENCE',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/cancel`,
      },
    })

    // Appeler l'API PayPal
    const response = await client().execute(request)
    const paypalOrderId = response.result.id

    console.log('✅ PayPal order created:', paypalOrderId)

    // Enregistrer l'order ID PayPal
    await supabaseAdmin
      .from('orders')
      .update({
        paypal_order_id: paypalOrderId,
        metadata: { items },
      })
      .eq('id', order.id)

    return NextResponse.json({
      orderID: paypalOrderId,
      supabaseOrderId: order.id,
      orderNumber: order.order_number,
    })
  } catch (error: any) {
    console.error('❌ Error creating PayPal order:', error)
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
