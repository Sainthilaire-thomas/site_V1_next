// src/lib/email/send-order-confirmation-hook.ts
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendOrderConfirmationEmail } from './send'

// Type partiel pour les images
type ProductImagePartial = {
  id: string
  product_id: string
  storage_original: string
  is_primary: boolean | null
  sort_order: number | null
}

/**
 * Hook appelé après la création d'une commande pour envoyer l'email de confirmation
 */
export async function sendOrderConfirmationHook(orderId: string) {
  try {
    console.log('📧 Fetching order details for ID:', orderId)

    // ✅ Utiliser supabaseAdmin (service role) pour bypasser RLS dans les webhooks
    const supabase = supabaseAdmin

    // Récupérer les détails de la commande
    const { data: order, error: orderError } = await supabase
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
        billing_address,
        user_id
      `
      )
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('❌ Erreur récupération commande:', orderError)
      throw new Error('Commande introuvable')
    }

    console.log('✅ Order found:', order.order_number)

    // ✅✅✅ LOGS CRITIQUES POUR LE DEBUG
    console.log('='.repeat(60))
    console.log('📦 DEBUG SHIPPING ADDRESS')
    console.log('='.repeat(60))
    console.log(
      '📦 Raw shipping_address from DB:',
      JSON.stringify(order.shipping_address, null, 2)
    )
    console.log('📦 Type of shipping_address:', typeof order.shipping_address)
    console.log('📦 Is null?', order.shipping_address === null)
    console.log('📦 Is undefined?', order.shipping_address === undefined)
    console.log(
      '📦 Has address_line_1?',
      order.shipping_address &&
        typeof order.shipping_address === 'object' &&
        'address_line_1' in (order.shipping_address as object)
    )
    console.log('='.repeat(60))

    // Récupérer les items de la commande
    const { data: orderItems, error: itemsError } = await supabase
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
      .eq('order_id', orderId)

    if (itemsError || !orderItems) {
      console.error('❌ Erreur récupération items:', itemsError)
      throw new Error('Items de commande introuvables')
    }

    console.log(`✅ Found ${orderItems.length} items`)

    // Récupérer les images des produits
    const productIds = orderItems
      .map((item) => item.product_id)
      .filter((id): id is string => id !== null)

    const { data: productImages } = await supabase
      .from('product_images')
      .select('id, product_id, storage_original, is_primary, sort_order')
      .in('product_id', productIds)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true })

    // Map des images par product_id
    const imagesByProduct = new Map<string, ProductImagePartial>()

    if (productImages) {
      productImages.forEach((img) => {
        if (img.product_id && !imagesByProduct.has(img.product_id)) {
          imagesByProduct.set(img.product_id, img)
        }
      })
    }

    // Transformer les items au format attendu par l'email
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
        price: item.unit_price,
        imageUrl: productImage?.id
          ? `/api/product-images/${productImage.id}`
          : item.image_url || undefined,
      }
    })

    // Récupérer le prénom du client
    let customerFirstName = 'Client'

    if (order.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', order.user_id)
        .single()

      customerFirstName = profile?.first_name || order.customer_name || 'Client'
    } else if (order.customer_name) {
      customerFirstName = order.customer_name.split(' ')[0] || 'Client'
    }

    // Vérifier que l'email existe
    if (!order.customer_email) {
      throw new Error('Email client manquant')
    }

    // Calculer le subtotal
    const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0)

    // ✅ Formater l'adresse au bon format
    const shippingAddress = order.shipping_address as any

    console.log('🔍 PARSING SHIPPING ADDRESS')
    console.log(
      '🔍 shippingAddress?.address_line_1:',
      shippingAddress?.address_line_1
    )
    console.log('🔍 shippingAddress?.city:', shippingAddress?.city)
    console.log(
      '🔍 shippingAddress?.postal_code:',
      shippingAddress?.postal_code
    )
    console.log('🔍 shippingAddress?.country:', shippingAddress?.country)

    const formattedAddress = {
      line1: shippingAddress?.address_line1 || '', // ✅ Sans underscore au milieu
      line2: shippingAddress?.address_line2 || '', // ✅ Sans underscore au milieu
      city: shippingAddress?.city || '',
      postalCode: shippingAddress?.postal_code || '', // ✅ Garde l'underscore
      country: shippingAddress?.country || '',
      firstName: shippingAddress?.first_name || '',
      lastName: shippingAddress?.last_name || '',
      phone: shippingAddress?.phone || '',
    }

    console.log(
      '✅ Formatted address for email:',
      JSON.stringify(formattedAddress, null, 2)
    )

    // ✅ Envoyer l'email avec EXACTEMENT les champs attendus
    await sendOrderConfirmationEmail(order.customer_email, {
      orderNumber: order.order_number,
      customerName: customerFirstName,
      items: formattedItems,
      subtotal: subtotal,
      shipping: order.shipping_amount || 0,
      total: order.total_amount,
      shippingAddress: formattedAddress,
    })

    console.log(
      `✅ Email de confirmation envoyé pour la commande ${order.order_number}`
    )
    return { success: true }
  } catch (error) {
    console.error('❌ Erreur envoi email confirmation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}
