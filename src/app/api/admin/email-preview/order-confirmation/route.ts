// src/app/api/admin/email-preview/order-confirmation/route.ts
import { render } from '@react-email/render'
import { OrderConfirmationEmail } from '@/lib/email/order-confirmation'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    // 1. Récupérer la dernière commande complétée
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(
        `
        id,
        order_number,
        customer_email,
        customer_name,
        total_amount,
        shipping_amount,
        shipping_address,
        user_id
      `
      )
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (orderError || !order) {
      console.error('❌ No order found:', orderError)
      return NextResponse.json(
        { error: 'No orders found in database' },
        { status: 404 }
      )
    }

    // 2. Récupérer les items de la commande
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select(
        `
        id,
        product_id,
        product_name,
        variant_name,
        variant_value,
        quantity,
        unit_price,
        total_price,
        image_url
      `
      )
      .eq('order_id', order.id)

    if (itemsError || !orderItems) {
      console.error('❌ No items found:', itemsError)
      return NextResponse.json(
        { error: 'No order items found' },
        { status: 404 }
      )
    }

    // 3. Récupérer les images des produits
    const productIds = orderItems
      .map((item) => item.product_id)
      .filter((id): id is string => id !== null)

    const { data: productImages } = await supabaseAdmin
      .from('product_images')
      .select('id, product_id, storage_original, is_primary, sort_order')
      .in('product_id', productIds)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true })

    // Map des images par product_id
    const imagesByProduct = new Map()
    if (productImages) {
      productImages.forEach((img) => {
        if (img.product_id && !imagesByProduct.has(img.product_id)) {
          imagesByProduct.set(img.product_id, img)
        }
      })
    }

    // 4. Formater les items pour l'email
    const formattedItems = orderItems.map((item) => {
      let itemName = item.product_name || 'Produit'
      if (item.variant_name && item.variant_value) {
        itemName += ` - ${item.variant_name}: ${item.variant_value}`
      }

      const productImage = item.product_id
        ? imagesByProduct.get(item.product_id)
        : null

      return {
        name: itemName,
        quantity: item.quantity,
        price: item.unit_price, // ✅ Déjà en euros
        imageUrl: productImage?.id
          ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/product-images/${productImage.id}/signed-url?variant=sm&format=jpeg`
          : item.image_url || undefined,
      }
    })

    // 5. Récupérer le prénom du client
    let customerFirstName = 'Client'
    if (order.user_id) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('first_name')
        .eq('id', order.user_id)
        .single()

      customerFirstName = profile?.first_name || order.customer_name || 'Client'
    } else if (order.customer_name) {
      customerFirstName = order.customer_name.split(' ')[0] || 'Client'
    }

    // 6. Calculer le subtotal
    const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0)

    // 7. Formater l'adresse
    const shippingAddress = order.shipping_address as any
    const formattedAddress = {
      line1: shippingAddress?.address_line1 || '123 rue de la Mode',
      line2: shippingAddress?.address_line2,
      city: shippingAddress?.city || 'Paris',
      postalCode: shippingAddress?.postal_code || '75001',
      country: shippingAddress?.country || 'France',
    }

    // 8. Générer le HTML de l'email
    const html = await render(
      OrderConfirmationEmail({
        orderNumber: order.order_number,
        customerName: customerFirstName,
        items: formattedItems,
        subtotal: subtotal, // ✅ En euros
        shipping: order.shipping_amount || 0, // ✅ En euros
        total: order.total_amount, // ✅ En euros
        shippingAddress: formattedAddress,
      })
    )

    // 9. Retourner le HTML
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Order-Number': order.order_number, // ✅ Pour info
      },
    })
  } catch (error) {
    console.error('❌ Error generating email preview:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate preview',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
