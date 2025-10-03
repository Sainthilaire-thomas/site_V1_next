// src/app/api/admin/product-images/upload/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getOriginalPath, inferExtFromMime } from '@/lib/images'
import { randomUUID } from 'crypto'
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

  // Récupérer s'il existe déjà une principale
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

    // Lire dimensions
    let width: number | null = null
    let height: number | null = null
    try {
      const meta = await sharp(buffer).metadata()
      width = meta.width ?? null
      height = meta.height ?? null
    } catch {}

    const path = getOriginalPath(productId, imageId, ext)

    // Upload de l'original
    const { error: upErr } = await supabaseAdmin.storage
      .from('product-images')
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (upErr) {
      results.push({ ok: false, error: upErr.message })
      continue
    }

    // Insertion en DB
    const { data: inserted, error: dbErr } = await supabaseAdmin
      .from('product_images')
      .insert({
        id: imageId, // ✅ Spécifier l'ID pour le retrouver
        product_id: productId,
        storage_original: path,
        alt: null,
        is_primary: !existing || existing.length === 0,
        sort_order: index,
        width,
        height,
      })
      .select('id')

    if (dbErr) {
      results.push({ ok: false, error: dbErr.message })
      continue
    }

    // ✅ Générer les variantes immédiatement
    const variantsResult = await generateVariants(productId, imageId, buffer)

    results.push({
      ok: true,
      id: imageId,
      variants: variantsResult,
    })
  }

  return NextResponse.json({ results })
}

/**
 * Génère toutes les variantes d'une image
 */
async function generateVariants(
  productId: string,
  imageId: string,
  buffer: Buffer
) {
  const SIZES = {
    xl: 2048,
    lg: 1280,
    md: 768,
    sm: 384,
  }

  const results = []

  for (const [sizeKey, maxSize] of Object.entries(SIZES)) {
    // AVIF
    try {
      const avifBuffer = await sharp(buffer)
        .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
        .avif({ quality: 50 })
        .toBuffer()

      const avifPath = `products/${productId}/${sizeKey}/${imageId}.avif`
      await supabaseAdmin.storage
        .from('product-images')
        .upload(avifPath, avifBuffer, {
          contentType: 'image/avif',
          upsert: true,
        })
      results.push({ size: sizeKey, format: 'avif', ok: true })
    } catch (err: any) {
      results.push({
        size: sizeKey,
        format: 'avif',
        ok: false,
        error: err.message,
      })
    }

    // WebP
    try {
      const webpBuffer = await sharp(buffer)
        .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer()

      const webpPath = `products/${productId}/${sizeKey}/${imageId}.webp`
      await supabaseAdmin.storage
        .from('product-images')
        .upload(webpPath, webpBuffer, {
          contentType: 'image/webp',
          upsert: true,
        })
      results.push({ size: sizeKey, format: 'webp', ok: true })
    } catch (err: any) {
      results.push({
        size: sizeKey,
        format: 'webp',
        ok: false,
        error: err.message,
      })
    }

    // JPEG
    try {
      const jpgBuffer = await sharp(buffer)
        .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer()

      const jpgPath = `products/${productId}/${sizeKey}/${imageId}.jpg`
      await supabaseAdmin.storage
        .from('product-images')
        .upload(jpgPath, jpgBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        })
      results.push({ size: sizeKey, format: 'jpg', ok: true })
    } catch (err: any) {
      results.push({
        size: sizeKey,
        format: 'jpg',
        ok: false,
        error: err.message,
      })
    }
  }

  return results
}
