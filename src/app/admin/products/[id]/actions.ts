'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  productUpdateSchema,
  variantCreateSchema,
  stockAdjustSchema,
} from '@/lib/validation/adminProducts'

function emptyToNull(v: unknown) {
  const s = (v ?? '').toString().trim()
  return s === '' ? null : s
}

// ✅ Nouvelle fonction pour convertir les string boolean
function stringToBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return value === 'true' || value === 'on'
  }
  return false
}

export async function updateProductAction(
  productId: string,
  formData: FormData
) {
  // ⚠️ Number('') = 0, Number(undefined) = NaN. On protège.
  const priceRaw = formData.get('price')
  const price =
    priceRaw !== null &&
    priceRaw !== undefined &&
    String(priceRaw).trim() !== ''
      ? Number(priceRaw)
      : undefined

  const partial = {
    name: formData.get('name')?.toString(),
    slug: formData.get('slug')?.toString(),
    price, // ✅ protégé
    short_description: emptyToNull(formData.get('short_description')),
    description: emptyToNull(formData.get('description')),
    // ✅ NOUVEAUX CHAMPS
    composition: emptyToNull(formData.get('composition')),
    care: emptyToNull(formData.get('care')),
    impact: emptyToNull(formData.get('impact')),
    craftsmanship: emptyToNull(formData.get('craftsmanship')),
    // FIN NOUVEAUX CHAMPS
    sku: emptyToNull(formData.get('sku')),
    category_id: emptyToNull(formData.get('category_id')) as
      | string
      | null
      | undefined,
    // ✅ Conversion correcte des boolean
    is_active: stringToBoolean(formData.get('is_active')),
    is_featured: stringToBoolean(formData.get('is_featured')),
  }

  const parsed = productUpdateSchema.safeParse(partial)
  if (!parsed.success)
    return { ok: false as const, error: parsed.error.flatten() }

  const { error } = await supabaseAdmin
    .from('products')
    .update(parsed.data)
    .eq('id', productId)
  if (error) return { ok: false as const, error: { message: error.message } }

  revalidatePath(`/admin/products/${productId}`)
  revalidatePath('/admin/products')
  return { ok: true as const }
}

export async function createVariantAction(
  productId: string,
  formData: FormData
) {
  const payload = {
    name: String(formData.get('name') ?? ''),
    value: String(formData.get('value') ?? ''),
    sku: ((formData.get('sku') as string) || '').trim() || null,
    price_modifier: Number(formData.get('price_modifier') ?? 0),
    stock_quantity: Number(formData.get('stock_quantity') ?? 0),
    is_active: formData.get('is_active') === 'on',
  }

  const parsed = variantCreateSchema.safeParse(payload)
  if (!parsed.success)
    return { ok: false as const, error: parsed.error.flatten() }

  const { error } = await supabaseAdmin
    .from('product_variants')
    .insert({ ...parsed.data, product_id: productId })
  if (error) return { ok: false as const, error: { message: error.message } }

  // recalcule le stock produit
  await supabaseAdmin.rpc('recompute_product_stock', {
    p_product_id: productId,
  })

  revalidatePath(`/admin/products/${productId}`)
  return { ok: true as const }
}

export async function deleteVariantAction(
  productId: string,
  variantId: string
) {
  const { error } = await supabaseAdmin
    .from('product_variants')
    .delete()
    .eq('id', variantId)
  if (error) return { ok: false as const, error: { message: error.message } }

  await supabaseAdmin.rpc('recompute_product_stock', {
    p_product_id: productId,
  })
  revalidatePath(`/admin/products/${productId}`)
  return { ok: true as const }
}

export async function adjustStockAction(
  productId: string,
  variantId: string,
  formData: FormData
) {
  const payload = {
    delta: Number(formData.get('delta') ?? 0),
    reason: String(formData.get('reason') ?? ''),
  }
  const parsed = stockAdjustSchema.safeParse(payload)
  if (!parsed.success)
    return { ok: false as const, error: parsed.error.flatten() }

  const { error } = await supabaseAdmin.from('stock_movements').insert({
    variant_id: variantId,
    delta: parsed.data.delta,
    reason: parsed.data.reason,
  })
  if (error) return { ok: false as const, error: { message: error.message } }

  await supabaseAdmin.rpc('recompute_product_stock', {
    p_product_id: productId,
  })
  revalidatePath(`/admin/products/${productId}`)
  return { ok: true as const }
}
