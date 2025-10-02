'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  productUpdateSchema,
  variantCreateSchema,
  stockAdjustSchema,
} from '@/lib/validation/adminProducts'

export async function updateProductAction(
  productId: string,
  formData: FormData
) {
  const partial = {
    name: formData.get('name')?.toString(),
    slug: formData.get('slug')?.toString(),
    price:
      formData.get('price') !== null
        ? Number(formData.get('price'))
        : undefined,
    short_description:
      (formData.get('short_description') as string) ?? undefined,
    description: (formData.get('description') as string) ?? undefined,
    sku: (formData.get('sku') as string) ?? undefined,
    category_id: (formData.get('category_id') as string) ?? undefined,
    is_active:
      formData.get('is_active') !== null
        ? formData.get('is_active') === 'on'
        : undefined,
    is_featured:
      formData.get('is_featured') !== null
        ? formData.get('is_featured') === 'on'
        : undefined,
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
