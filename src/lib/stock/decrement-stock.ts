// src/lib/stock/decrement-stock.ts
import { supabaseAdmin } from '@/lib/supabase-admin'

interface OrderItemStock {
  product_id: string | null
  variant_id: string | null
  quantity: number
  product_name?: string | null
  variant_name?: string | null
}

/**
 * Décrémenter le stock après un paiement validé
 * Appelé depuis le webhook Stripe après checkout.session.completed
 */
export async function decrementStockForOrder(orderId: string) {
  try {
    console.log('📦 Starting stock decrement for order:', orderId)

    // ✅ Récupérer les items de la commande
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('product_id, variant_id, quantity, product_name, variant_name')
      .eq('order_id', orderId)

    if (itemsError) {
      console.error('❌ Error fetching order items:', itemsError)
      throw new Error(`Failed to fetch order items: ${itemsError.message}`)
    }

    if (!orderItems || orderItems.length === 0) {
      console.log('⚠️ No items found for order:', orderId)
      return { success: true, decremented: 0 }
    }

    console.log(`📋 Found ${orderItems.length} items to process`)

    let decrementedCount = 0
    const errors: string[] = []

    // ✅ Traiter chaque item
    for (const item of orderItems) {
      try {
        const result = await decrementStockForItem(item as OrderItemStock)
        if (result.success) {
          decrementedCount++
          console.log(
            `✅ Stock decremented for: ${item.product_name} (qty: ${item.quantity})`
          )
        } else {
          errors.push(
            `${item.product_name}: ${result.error || 'Unknown error'}`
          )
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error'
        errors.push(`${item.product_name}: ${errorMsg}`)
        console.error(`❌ Error processing item:`, error)
      }
    }

    // ✅ Résumé
    console.log(
      `📊 Stock decrement summary: ${decrementedCount}/${orderItems.length} items processed`
    )

    if (errors.length > 0) {
      console.error('⚠️ Errors during stock decrement:', errors)
      return {
        success: false,
        decremented: decrementedCount,
        errors,
      }
    }

    return {
      success: true,
      decremented: decrementedCount,
    }
  } catch (error) {
    console.error('❌ Critical error in decrementStockForOrder:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Décrémenter le stock pour un item spécifique
 */
async function decrementStockForItem(item: OrderItemStock) {
  try {
    // ✅ CAS 1 : Produit avec variante
    if (item.variant_id) {
      return await decrementVariantStock(
        item.variant_id,
        item.quantity,
        `Order item: ${item.product_name} - ${item.variant_name}`
      )
    }

    // ✅ CAS 2 : Produit sans variante
    if (item.product_id) {
      return await decrementProductStock(
        item.product_id,
        item.quantity,
        `Order item: ${item.product_name}`
      )
    }

    console.error('⚠️ Item has no product_id or variant_id:', item)
    return {
      success: false,
      error: 'No product_id or variant_id',
    }
  } catch (error) {
    console.error('❌ Error in decrementStockForItem:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Décrémenter le stock d'une variante
 */
async function decrementVariantStock(
  variantId: string,
  quantity: number,
  reason: string
) {
  try {
    // ✅ Récupérer le stock actuel
    const { data: variant, error: variantError } = await supabaseAdmin
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', variantId)
      .single()

    if (variantError || !variant) {
      console.error('❌ Variant not found:', variantId)
      return { success: false, error: 'Variant not found' }
    }

    const currentStock = variant.stock_quantity ?? 0
    const newStock = Math.max(0, currentStock - quantity)

    console.log(
      `📦 Variant ${variantId}: ${currentStock} → ${newStock} (Δ -${quantity})`
    )

    // ✅ Mettre à jour le stock
    const { error: updateError } = await supabaseAdmin
      .from('product_variants')
      .update({ stock_quantity: newStock })
      .eq('id', variantId)

    if (updateError) {
      console.error('❌ Error updating variant stock:', updateError)
      return { success: false, error: updateError.message }
    }

    // ✅ Créer un mouvement de stock (historique)
    await createStockMovement(variantId, -quantity, reason)

    return { success: true, newStock }
  } catch (error) {
    console.error('❌ Error in decrementVariantStock:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Décrémenter le stock d'un produit (sans variante)
 */
async function decrementProductStock(
  productId: string,
  quantity: number,
  reason: string
) {
  try {
    // ✅ Récupérer le stock actuel
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      console.error('❌ Product not found:', productId)
      return { success: false, error: 'Product not found' }
    }

    const currentStock = product.stock_quantity ?? 0
    const newStock = Math.max(0, currentStock - quantity)

    console.log(
      `📦 Product ${productId}: ${currentStock} → ${newStock} (Δ -${quantity})`
    )

    // ✅ Mettre à jour le stock
    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', productId)

    if (updateError) {
      console.error('❌ Error updating product stock:', updateError)
      return { success: false, error: updateError.message }
    }

    // Note : Les stock_movements sont liés aux variantes uniquement
    // Pour les produits sans variantes, pas de mouvement créé

    return { success: true, newStock }
  } catch (error) {
    console.error('❌ Error in decrementProductStock:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Créer un mouvement de stock dans l'historique
 */
async function createStockMovement(
  variantId: string,
  delta: number,
  reason: string
) {
  try {
    const { error } = await supabaseAdmin.from('stock_movements').insert({
      variant_id: variantId,
      delta: delta,
      reason: reason,
      created_by: null, // Système automatique
    })

    if (error) {
      console.error('⚠️ Error creating stock movement:', error)
      // Non-bloquant
    }
  } catch (error) {
    console.error('⚠️ Error creating stock movement:', error)
    // Non-bloquant
  }
}
