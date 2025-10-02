// src/lib/images.ts
export const IMAGE_SIZES = ['xl', 'lg', 'md', 'sm'] as const
export type ImageSize = (typeof IMAGE_SIZES)[number]

export const IMAGE_FORMATS = ['avif', 'webp', 'jpg'] as const
export type ImageFormat = (typeof IMAGE_FORMATS)[number]

export function getOriginalPath(
  productId: string,
  imageId: string,
  ext: string
) {
  return `products/${productId}/original/${imageId}.${ext}`
}

export function getMasterPath(productId: string, imageId: string, ext: string) {
  return `products/${productId}/master/${imageId}.${ext}`
}

export function getVariantPath(
  productId: string,
  imageId: string,
  size: ImageSize,
  format: ImageFormat
) {
  return `products/${productId}/${size}/${imageId}.${format}`
}

export function inferExtFromMime(
  mime: string
): 'jpg' | 'jpeg' | 'png' | 'webp' {
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  return 'jpg' // par défaut
}
