import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getOriginalPath, inferExtFromMime } from '@/lib/images'
import { randomUUID } from 'crypto'
// Optionnel : sharp pour lire dimensions
import sharp from 'sharp'

export async function POST(req: Request) {
  const form = await req.formData()
  const productId = String(form.get('productId') || '')
  const files = form.getAll('files') as File[]

  if (!productId || files.length === 0) {
    return NextResponse.json(
      { error: 'productId et files requis' },
      { status: 400 }
    )
  }

  // Récupérer s’il existe déjà une principale
  const { data: existing } = await supabaseAdmin
    .from('product_images')
    .select('id')
    .eq('product_id', productId)
    .eq('is_primary', true)
    .limit(1)

  const results: any[] = []

  for (let index = 0; index < files.length; index++) {
    const file = files[index]
    const arrayBuf = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuf)
    const ext = inferExtFromMime(file.type).replace('jpeg', 'jpg')
    const imageId = randomUUID()

    // (Optionnel) Lire dimensions
    let width: number | null = null
    let height: number | null = null
    try {
      const meta = await sharp(buffer).metadata()
      width = meta.width ?? null
      height = meta.height ?? null
    } catch {}

    const path = getOriginalPath(productId, imageId, ext)

    const { error: upErr } = await supabaseAdmin.storage
      .from('product-images')
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (upErr) {
      results.push({ ok: false, error: upErr.message })
      continue
    }

    const { data: inserted, error: dbErr } = await supabaseAdmin
      .from('product_images')
      .insert({
        product_id: productId,
        storage_original: path,
        alt: null,
        is_primary: !existing || existing.length === 0, // la 1ère importée devient principale si aucune n’existe
        sort_order: index,
        width,
        height,
      })
      .select('id')

    if (dbErr) {
      results.push({ ok: false, error: dbErr.message })
      continue
    }

    results.push({ ok: true, id: inserted?.[0]?.id })
  }

  return NextResponse.json({ results })
}
