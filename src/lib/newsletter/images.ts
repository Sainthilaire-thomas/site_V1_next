// src/lib/newsletter/images.ts

import { supabaseAdmin } from '@/lib/supabase-admin'
import sharp from 'sharp'
import { randomUUID } from 'crypto'

/**
 * Structure des tailles pour images newsletter
 * Les emails nécessitent des tailles optimisées
 */
const NEWSLETTER_SIZES = {
  xl: 1200, // Hero desktop
  lg: 800, // Hero mobile
  md: 600, // Fallback
  sm: 400, // Thumbnail
}

/**
 * Upload et génère les variantes d'une image hero de campagne
 *
 * @returns Object avec image_id et URLs des variantes
 */
export async function uploadNewsletterHeroImage(
  campaignId: string,
  file: File
): Promise<{
  success: boolean
  image_id?: string
  urls?: {
    original: string
    xl_avif: string
    xl_webp: string
    xl_jpg: string
    lg_avif: string
    lg_webp: string
    lg_jpg: string
    md_jpg: string
    sm_jpg: string
  }
  error?: string
}> {
  try {
    // Convertir File en Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Générer ID unique pour cette image
    const imageId = randomUUID()

    // 1. Upload de l'original
    const originalPath = `newsletter-campaigns/${campaignId}/hero/original/${imageId}.jpg`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-images') // Réutilisation du même bucket
      .upload(originalPath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // 2. Générer toutes les variantes
    const variants = await generateNewsletterVariants(
      campaignId,
      imageId,
      buffer
    )

    // 3. Construire les URLs publiques
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const urls = {
      original: `${baseUrl}/storage/v1/object/public/product-images/${originalPath}`,
      xl_avif: `${baseUrl}/storage/v1/object/public/product-images/newsletter-campaigns/${campaignId}/hero/xl/${imageId}.avif`,
      xl_webp: `${baseUrl}/storage/v1/object/public/product-images/newsletter-campaigns/${campaignId}/hero/xl/${imageId}.webp`,
      xl_jpg: `${baseUrl}/storage/v1/object/public/product-images/newsletter-campaigns/${campaignId}/hero/xl/${imageId}.jpg`,
      lg_avif: `${baseUrl}/storage/v1/object/public/product-images/newsletter-campaigns/${campaignId}/hero/lg/${imageId}.avif`,
      lg_webp: `${baseUrl}/storage/v1/object/public/product-images/newsletter-campaigns/${campaignId}/hero/lg/${imageId}.webp`,
      lg_jpg: `${baseUrl}/storage/v1/object/public/product-images/newsletter-campaigns/${campaignId}/hero/lg/${imageId}.jpg`,
      md_jpg: `${baseUrl}/storage/v1/object/public/product-images/newsletter-campaigns/${campaignId}/hero/md/${imageId}.jpg`,
      sm_jpg: `${baseUrl}/storage/v1/object/public/product-images/newsletter-campaigns/${campaignId}/hero/sm/${imageId}.jpg`,
    }

    return {
      success: true,
      image_id: imageId,
      urls,
    }
  } catch (error: any) {
    console.error('Newsletter hero upload error:', error)
    return {
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * Génère toutes les variantes d'une image newsletter
 */
async function generateNewsletterVariants(
  campaignId: string,
  imageId: string,
  buffer: Buffer
) {
  const results = []

  for (const [sizeKey, maxWidth] of Object.entries(NEWSLETTER_SIZES)) {
    const basePath = `newsletter-campaigns/${campaignId}/hero/${sizeKey}/${imageId}`

    // AVIF (uniquement pour xl et lg - meilleure compression)
    if (sizeKey === 'xl' || sizeKey === 'lg') {
      try {
        const avifBuffer = await sharp(buffer)
          .resize(maxWidth, undefined, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .avif({ quality: 60 })
          .toBuffer()

        await supabaseAdmin.storage
          .from('product-images')
          .upload(`${basePath}.avif`, avifBuffer, {
            contentType: 'image/avif',
            upsert: true,
          })

        results.push({ size: sizeKey, format: 'avif', ok: true })
      } catch (err: any) {
        console.error(`AVIF generation failed for ${sizeKey}:`, err.message)
        results.push({ size: sizeKey, format: 'avif', ok: false })
      }
    }

    // WebP (uniquement pour xl et lg)
    if (sizeKey === 'xl' || sizeKey === 'lg') {
      try {
        const webpBuffer = await sharp(buffer)
          .resize(maxWidth, undefined, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toBuffer()

        await supabaseAdmin.storage
          .from('product-images')
          .upload(`${basePath}.webp`, webpBuffer, {
            contentType: 'image/webp',
            upsert: true,
          })

        results.push({ size: sizeKey, format: 'webp', ok: true })
      } catch (err: any) {
        console.error(`WebP generation failed for ${sizeKey}:`, err.message)
        results.push({ size: sizeKey, format: 'webp', ok: false })
      }
    }

    // JPEG (pour toutes les tailles - fallback universel)
    try {
      const jpegBuffer = await sharp(buffer)
        .resize(maxWidth, undefined, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer()

      await supabaseAdmin.storage
        .from('product-images')
        .upload(`${basePath}.jpg`, jpegBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      results.push({ size: sizeKey, format: 'jpg', ok: true })
    } catch (err: any) {
      console.error(`JPEG generation failed for ${sizeKey}:`, err.message)
      results.push({ size: sizeKey, format: 'jpg', ok: false })
    }
  }

  return results
}

/**
 * Supprime toutes les images d'une campagne
 */
export async function deleteNewsletterCampaignImages(
  campaignId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const folderPath = `newsletter-campaigns/${campaignId}`

    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('product-images')
      .list(folderPath, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' },
      })

    if (listError) throw listError

    if (files && files.length > 0) {
      const filePaths = files.map((file) => `${folderPath}/${file.name}`)

      const { error: deleteError } = await supabaseAdmin.storage
        .from('product-images')
        .remove(filePaths)

      if (deleteError) throw deleteError
    }

    return { success: true }
  } catch (error: any) {
    console.error('Delete campaign images error:', error)
    return { success: false, error: error.message }
  }
}
