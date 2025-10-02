// src/lib/images-server.ts
import { supabaseAdmin } from './supabase-admin'
import type { ImageSize, ImageFormat } from './images'
import { getStoragePath } from './images'

export interface ProductImageWithUrls {
  id: string
  product_id: string
  alt: string | null
  is_primary: boolean
  sort_order: number
  width: number | null
  height: number | null
  urls: {
    xl: Record<ImageFormat, string>
    lg: Record<ImageFormat, string>
    md: Record<ImageFormat, string>
    sm: Record<ImageFormat, string>
  }
}

/**
 * Récupère les URLs signées pour toutes les variantes d'une image
 */
export async function getImageUrls(
  productId: string,
  imageId: string,
  expiresIn: number = 3600
): Promise<Record<ImageSize, Record<ImageFormat, string>>> {
  const sizes: ImageSize[] = ['xl', 'lg', 'md', 'sm']
  const formats: ImageFormat[] = ['avif', 'webp', 'jpg']
  const urls: any = {}

  for (const size of sizes) {
    urls[size] = {}
    for (const format of formats) {
      const path = getStoragePath(productId, imageId, size, format)
      const { data, error } = await supabaseAdmin.storage
        .from('product-images')
        .createSignedUrl(path, expiresIn)

      if (!error && data) {
        urls[size][format] = data.signedUrl
      }
    }
  }

  return urls
}

/**
 * Récupère l'image principale d'un produit avec ses URLs signées
 */
export async function getProductPrimaryImage(
  productId: string,
  expiresIn: number = 3600
): Promise<ProductImageWithUrls | null> {
  const { data: image, error } = await supabaseAdmin
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .eq('is_primary', true)
    .single()

  if (error || !image) return null

  const urls = await getImageUrls(productId, image.id, expiresIn)

  return {
    id: image.id,
    product_id: image.product_id,
    alt: image.alt,
    is_primary: image.is_primary,
    sort_order: image.sort_order,
    width: image.width,
    height: image.height,
    urls,
  }
}

/**
 * Récupère toutes les images d'un produit avec leurs URLs signées
 */
export async function getProductImages(
  productId: string,
  expiresIn: number = 3600
): Promise<ProductImageWithUrls[]> {
  const { data: images, error } = await supabaseAdmin
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order')
    .order('created_at')

  if (error || !images) return []

  const imagesWithUrls = await Promise.all(
    images.map(async (image) => {
      const urls = await getImageUrls(productId, image.id, expiresIn)
      return {
        id: image.id,
        product_id: image.product_id,
        alt: image.alt,
        is_primary: image.is_primary,
        sort_order: image.sort_order,
        width: image.width,
        height: image.height,
        urls,
      }
    })
  )

  return imagesWithUrls
}

/**
 * Récupère une URL signée pour une taille/format spécifique
 */
export async function getImageSignedUrl(
  productId: string,
  imageId: string,
  size: ImageSize,
  format: ImageFormat,
  expiresIn: number = 3600
): Promise<string | null> {
  const path = getStoragePath(productId, imageId, size, format)
  const { data, error } = await supabaseAdmin.storage
    .from('product-images')
    .createSignedUrl(path, expiresIn)

  if (error || !data) return null
  return data.signedUrl
}
