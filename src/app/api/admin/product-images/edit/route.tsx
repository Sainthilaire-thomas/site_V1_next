// src/app/api/admin/product-images/edit/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import sharp from 'sharp'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { imageId, productId, crop, rotation } = body

    console.log('📥 Requête reçue:', { imageId, productId, crop, rotation })

    // Validation
    if (!imageId || !productId) {
      return NextResponse.json(
        { error: 'imageId et productId requis' },
        { status: 400 }
      )
    }

    if (!crop || typeof crop !== 'object') {
      return NextResponse.json(
        { error: 'Paramètres de crop invalides' },
        { status: 400 }
      )
    }

    // 1. Récupérer l'image depuis la DB
    const { data: img, error: imgErr } = await supabaseAdmin
      .from('product_images')
      .select('storage_original, storage_master')
      .eq('id', imageId)
      .single()

    if (imgErr || !img) {
      console.error('❌ Image non trouvée:', imgErr)
      return NextResponse.json({ error: 'Image non trouvée' }, { status: 404 })
    }

    if (!img.storage_original) {
      return NextResponse.json(
        { error: 'storage_original manquant' },
        { status: 422 }
      )
    }

    console.log('✅ Image trouvée:', img.storage_original)

    // 2. Télécharger l'original
    const { data: fileData, error: downloadErr } = await supabaseAdmin.storage
      .from('product-images')
      .download(img.storage_original)

    if (downloadErr || !fileData) {
      console.error('❌ Erreur téléchargement:', downloadErr)
      return NextResponse.json(
        { error: 'Téléchargement échoué' },
        { status: 500 }
      )
    }

    console.log('✅ Fichier téléchargé')

    const buffer = Buffer.from(await fileData.arrayBuffer())

    // 3. Appliquer les transformations
    const { x, y, width, height } = crop
    let processed = sharp(buffer)

    // Rotation d'abord
    if (rotation && rotation !== 0) {
      console.log('🔄 Rotation:', rotation)
      processed = processed.rotate(rotation)
    }

    // Crop
    const extractOptions = {
      left: Math.max(0, Math.round(x)),
      top: Math.max(0, Math.round(y)),
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height)),
    }

    console.log('✂️ Crop:', extractOptions)

    try {
      processed = processed.extract(extractOptions)
      const editedBuffer = await processed.jpeg({ quality: 90 }).toBuffer()

      console.log('✅ Image traitée, taille:', editedBuffer.length, 'octets')

      // 4. Upload vers storage_master
      const masterPath = `products/${productId}/master/${imageId}.jpg`

      const { error: uploadErr } = await supabaseAdmin.storage
        .from('product-images')
        .upload(masterPath, editedBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (uploadErr) {
        console.error('❌ Erreur upload:', uploadErr)
        return NextResponse.json(
          { error: `Upload échoué: ${uploadErr.message}` },
          { status: 500 }
        )
      }

      console.log('✅ Upload réussi')

      // 5. Mettre à jour la DB
      const { error: updateErr } = await supabaseAdmin
        .from('product_images')
        .update({ storage_master: masterPath })
        .eq('id', imageId)

      if (updateErr) {
        console.error('❌ Erreur update DB:', updateErr)
        return NextResponse.json(
          { error: `Mise à jour DB échouée: ${updateErr.message}` },
          { status: 500 }
        )
      }

      console.log('✅ DB mise à jour')

      // 6. Régénérer les variantes
      console.log('🔄 Régénération des variantes...')
      const variantsResult = await generateVariants(
        productId,
        imageId,
        editedBuffer
      )
      console.log('✅ Variantes régénérées:', variantsResult)

      return NextResponse.json({ ok: true })
    } catch (sharpErr: any) {
      console.error('❌ Erreur Sharp:', sharpErr)
      return NextResponse.json(
        { error: `Erreur traitement: ${sharpErr.message}` },
        { status: 500 }
      )
    }
  } catch (err: any) {
    console.error('❌ Erreur globale:', err)
    return NextResponse.json(
      { error: err?.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * Génère toutes les variantes
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
      console.error(`Erreur AVIF ${sizeKey}:`, err.message)
      results.push({ size: sizeKey, format: 'avif', ok: false })
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
      console.error(`Erreur WebP ${sizeKey}:`, err.message)
      results.push({ size: sizeKey, format: 'webp', ok: false })
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
      console.error(`Erreur JPEG ${sizeKey}:`, err.message)
      results.push({ size: sizeKey, format: 'jpg', ok: false })
    }
  }

  return results
}
