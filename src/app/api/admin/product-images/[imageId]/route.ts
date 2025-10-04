import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getVariantPath, IMAGE_SIZES, IMAGE_FORMATS } from '@/lib/images'
import type { Database } from '@/lib/database.types'

type ProductImageRow = Database['public']['Tables']['product_images']['Row']

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const { imageId } = await params

  const { data, error } = await supabaseAdmin
    .from('product_images' as any)
    .select('*')
    .eq('id', imageId)
    .single<ProductImageRow>()

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || 'not found' },
      { status: 404 }
    )
  }

  const img = data

  const toRemove: string[] = []
  for (const size of IMAGE_SIZES) {
    for (const fmt of IMAGE_FORMATS) {
      toRemove.push(getVariantPath(img.product_id, imageId, size, fmt))
    }
  }
  if (img.storage_original) toRemove.push(img.storage_original)
  if (img.storage_master) toRemove.push(img.storage_master)

  await supabaseAdmin.storage.from('product-images').remove(toRemove)

  const { error: delErr } = await supabaseAdmin
    .from('product_images' as any)
    .delete()
    .eq('id', imageId)

  if (delErr)
    return NextResponse.json({ error: delErr.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
