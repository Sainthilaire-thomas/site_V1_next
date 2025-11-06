// src/app/api/paypal/capture-order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/paypal'
import checkoutNodeJssdk from '@paypal/checkout-server-sdk'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { orderID } = await req.json()

    console.log('💳 Capturing PayPal payment:', orderID)

    if (!orderID) {
      return NextResponse.json({ error: 'Missing orderID' }, { status: 400 })
    }

    // Capturer le paiement PayPal
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID)
    request.requestBody({})

    const response = await client().execute(request)
    const captureData = response.result

    console.log('✅ Payment captured:', captureData.id)
    console.log('   Status:', captureData.status)

    // Récupérer la commande Supabase
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, metadata')
      .eq('paypal_order_id', orderID)
      .single()

    if (orderError || !order) {
      console.error('❌ Order not found in Supabase:', orderError)
      throw new Error('Order not found')
    }

    console.log('📦 Order found:', order.order_number)

    // Mettre à jour la commande
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        paid_at: new Date().toISOString(),
        paypal_capture_id: captureData.id,
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('❌ Error updating order:', updateError)
      throw updateError
    }

    // Créer les order_items depuis les metadata
    const items = order.metadata?.items || []

    if (items.length > 0) {
      console.log(`📋 Creating ${items.length} order items...`)

      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        product_name: item.name || null,
        variant_name: item.variant_name || null,
        image_url: item.image || null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))

      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('⚠️ Error creating order items:', itemsError)
        // Ne pas faire échouer la capture si items non créés
      } else {
        console.log('✅ Order items created')
      }

      // TODO: Décrémenter le stock
      // TODO: Envoyer email de confirmation
    }

    console.log('✅ Order processed successfully')

    return NextResponse.json({
      success: true,
      captureID: captureData.id,
      orderNumber: order.order_number,
      status: captureData.status,
    })
  } catch (error: any) {
    console.error('❌ Error capturing PayPal order:', error)
    return NextResponse.json(
      {
        error: 'Failed to capture order',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
