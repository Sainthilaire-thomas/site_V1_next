// src/lib/images.ts
// Ajoutez ces exports si vous ne les avez pas déjà

export const IMAGE_SIZES = ['sm', 'md', 'lg', 'xl'] as const
export const IMAGE_FORMATS = ['avif', 'webp', 'jpg'] as const

export type ImageSize = (typeof IMAGE_SIZES)[number]
export type ImageFormat = (typeof IMAGE_FORMATS)[number]

/**
 * Chemin de l'image originale dans le bucket
 */
export function getOriginalPath(
  productId: string,
  imageId: string,
  ext: string = 'jpg'
): string {
  return `products/${productId}/original/${imageId}.${ext}`
}

/**
 * Chemin de stockage générique (alias de getOriginalPath pour compatibilité)
 */
export function getStoragePath(
  productId: string,
  imageId: string,
  ext: string = 'jpg'
): string {
  return getOriginalPath(productId, imageId, ext)
}

/**
 * Chemin d'une variante (taille + format spécifiques)
 */
export function getVariantPath(
  productId: string,
  imageId: string,
  size: ImageSize,
  format: ImageFormat
): string {
  return `products/${productId}/${size}/${imageId}.${format}`
}

/**
 * Infère l'extension depuis le type MIME
 */
export function inferExtFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
  }
  return map[mimeType.toLowerCase()] || 'jpg'
}
