'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { productCreateSchema } from '@/lib/validation/adminProducts'

export async function createProductAction(formData: FormData) {
  const payload = {
    name: String(formData.get('name') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    price: Number(formData.get('price') ?? 0),
    short_description: (formData.get('short_description') as string) || null,
    description: (formData.get('description') as string) || null,
    sku: ((formData.get('sku') as string) || '').trim() || null,
    category_id: ((formData.get('category_id') as string) || '').trim() || null,
    is_active: formData.get('is_active') === 'on',
    is_featured: formData.get('is_featured') === 'on',
  }

  const parsed = productCreateSchema.safeParse(payload)
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() }
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) return { ok: false as const, error: { message: error.message } }

  revalidatePath('/admin/products')
  return { ok: true as const, id: data!.id }
}
