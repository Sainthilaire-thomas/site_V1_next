// src/lib/types.ts
import type { Database } from './database.types'

// ✅ Types de base depuis la DB (source unique de vérité)
export type Product = Database['public']['Tables']['products']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type ProductVariant =
  Database['public']['Tables']['product_variants']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type WishlistItemRow =
  Database['public']['Tables']['wishlist_items']['Row']

// ✅ Types avec relations
export type ProductWithRelations = Product & {
  category?: Category | null
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export type ProductWithPrimaryImage = Product & {
  primary_image_id?: string | null
}

export type WishlistItem = WishlistItemRow & {
  product: ProductWithRelations
}

// ✅ Types pour les images avec URLs générées
export type ProductImageWithUrls = ProductImage & {
  urls: Record<
    'sm' | 'md' | 'lg' | 'xl',
    Record<'avif' | 'webp' | 'jpg', string>
  >
}

// ✅ Helpers pour manipuler les images
export function getPrimaryImage(
  product: ProductWithRelations
): ProductImage | null {
  if (!product.images?.length) return null
  return product.images.find((img) => img.is_primary) ?? product.images[0]
}

export function getSortedImages(product: ProductWithRelations): ProductImage[] {
  if (!product.images?.length) return []
  return [...product.images].sort((a, b) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    return (a.sort_order ?? 0) - (b.sort_order ?? 0)
  })
}

// ✅ Types pour le panier (non encore en DB)
export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  size?: string
  color?: string
  sku?: string
}

// ✅ Types pour les formulaires
export interface ContactForm {
  name: string
  email: string
  message: string
}

export interface NewsletterForm {
  email: string
}

// ✅ Types pour l'API
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ✅ Types pour les filtres
export interface ProductFilters {
  category?: string
  priceMin?: number
  priceMax?: number
  inStock?: boolean
  featured?: boolean
  colors?: string[]
  sizes?: string[]
}

export interface SearchParams {
  query?: string
  category?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'price' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

// ✅ Types pour le système d'images
export type ImageSize = 'sm' | 'md' | 'lg' | 'xl'
export type ImageFormat = 'avif' | 'webp' | 'jpg'

export const IMAGE_SIZES: readonly ImageSize[] = [
  'sm',
  'md',
  'lg',
  'xl',
] as const
export const IMAGE_FORMATS: readonly ImageFormat[] = [
  'avif',
  'webp',
  'jpg',
] as const
