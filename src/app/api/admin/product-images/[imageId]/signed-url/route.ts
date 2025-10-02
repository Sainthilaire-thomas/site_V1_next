// src/app/api/admin/product-images/[imageId]/signed-url/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { IMAGE_FORMATS, IMAGE_SIZES, getVariantPath } from '@/lib/images'
import type { Database } from '@/lib/databasetypes'

type ProductImageRow = Database['public']['Tables']['product_images']['Row']

export async function GET(
  req: Request,
  { params }: { params: { imageId: string } }
) {
  const url = new URL(req.url)
  const variant = url.searchParams.get('variant') || 'original' // 'original' | 'xl' | 'lg' | 'md' | 'sm'
  const format = (url.searchParams.get('format') ||
    'webp') as (typeof IMAGE_FORMATS)[number]
  const ttl = Number(url.searchParams.get('ttl') || 600)

  // IMPORTANT : on bypasse la validation stricte de schéma avec 'as any'
  // et on force le type renvoyé par single<ProductImageRow>()
  const { data, error } = await supabaseAdmin
    .from('product_images' as any)
    .select('*')
    .eq('id', params.imageId)
    .single<ProductImageRow>()

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || 'not found' },
      { status: 404 }
    )
  }

  // Si VS Code insiste avec "SelectQueryError", on force via unknown :
  const img = data as unknown as ProductImageRow

  // Chemin par défaut = original
  let path = img.storage_original ?? ''
  if (!path) {
    return NextResponse.json(
      { error: 'storage_original manquant' },
      { status: 422 }
    )
  }

  // Variante demandée
  if (variant !== 'original') {
    if (
      !IMAGE_SIZES.includes(variant as any) ||
      !IMAGE_FORMATS.includes(format)
    ) {
      return NextResponse.json(
        { error: 'variant/format invalide' },
        { status: 400 }
      )
    }
    path = getVariantPath(
      img.product_id,
      params.imageId,
      variant as any,
      format
    )
  }

  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from('product-images')
    .createSignedUrl(path, ttl)

  if (signErr || !signed) {
    return NextResponse.json(
      { error: signErr?.message || 'sign error' },
      { status: 500 }
    )
  }

  return NextResponse.redirect(signed.signedUrl, 302)
}
