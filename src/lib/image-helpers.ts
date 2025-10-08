// src/lib/image-helpers.ts
import type { ProductImage } from './types'

/**
 * Génère l'URL d'une image produit via l'API (URLs signées)
 * Recommandé pour tous les affichages publics
 */
export function getProductImageUrl(
  imageId: string,
  size: 'sm' | 'md' | 'lg' | 'xl' = 'md',
  format: 'avif' | 'webp' | 'jpg' = 'webp'
): string {
  return `/api/admin/product-images/${imageId}/signed-url?variant=${size}&format=${format}`
}

/**
 * Obtient l'image principale d'un produit
 */
export function getPrimaryProductImage(
  images: ProductImage[]
): ProductImage | null {
  if (!images || images.length === 0) return null

  // Chercher l'image marquée comme primaire
  const primary = images.find((img) => img.is_primary)
  if (primary) return primary

  // Sinon, prendre la première par ordre de tri
  const sorted = [...images].sort((a, b) => {
    const orderA = a.sort_order ?? 999
    const orderB = b.sort_order ?? 999
    return orderA - orderB
  })

  return sorted[0] || null
}

/**
 * Trie les images par ordre d'affichage
 */
export function sortProductImages(images: ProductImage[]): ProductImage[] {
  return [...images].sort((a, b) => {
    // Image primaire en premier
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1

    // Puis par sort_order
    const orderA = a.sort_order ?? 999
    const orderB = b.sort_order ?? 999
    return orderA - orderB
  })
}

/**
 * Placeholder image si aucune image disponible
 */
export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"%3E%3Crect width="400" height="600" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'
