// src/lib/types.ts
import type { Database } from './database.types'

// ============================================
// ✅ Types de base depuis la DB (source unique de vérité)
// ============================================
export type Product = Database['public']['Tables']['products']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type ProductVariant =
  Database['public']['Tables']['product_variants']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Collection = Database['public']['Tables']['collections']['Row']
export type Coupon = Database['public']['Tables']['coupons']['Row']
export type Address = Database['public']['Tables']['addresses']['Row']

// ✅ Types pour les commandes (depuis DB)
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type OrderStatusHistory =
  Database['public']['Tables']['order_status_history']['Row']
export type ShippingRate = Database['public']['Tables']['shipping_rates']['Row']
export type Return = Database['public']['Tables']['returns']['Row']

export type WishlistItemRow = Database['public']['Tables']['wishlist_items']['Row']

// ============================================
// ✅ Types avec relations (enrichis)
// ============================================
export type ProductWithRelations = Product & {
  category?: Category | null
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export type ProductWithPrimaryImage = Product & {
  primary_image_id?: string | null
}

export type OrderWithRelations = Order & {
  items?: OrderItem[]
  history?: OrderStatusHistory[]
}

export type WishlistItem = WishlistItemRow & {
  product: ProductWithRelations
}

// ============================================
// ✅ Helpers pour manipuler les images
// ============================================
export function getPrimaryImage(product: ProductWithRelations): ProductImage | null {
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

// ============================================
// ✅ Types pour le panier (localStorage - pas en DB)
// ============================================
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

// ============================================
// ✅ Types pour les formulaires
// ============================================
export interface ContactForm {
  name: string
  email: string
  message: string
}

export interface NewsletterForm {
  email: string
}

// ============================================
// ✅ Types pour l'API
// ============================================
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

// ============================================
// ✅ Types pour les filtres
// ============================================
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

// ============================================
// ✅ Types pour le système d'images
// ============================================
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

// ============================================
// ✅ Types utilitaires
// ============================================

// Statuts des commandes (pour référence rapide)
export type OrderStatus = Order['status']
export type PaymentStatus = Order['payment_status']
export type FulfillmentStatus = Order['fulfillment_status']

// Type pour la création d'une commande (sans champs auto-générés)
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderItemInsert =
  Database['public']['Tables']['order_items']['Insert']

// Type pour la mise à jour d'une commande
export type OrderUpdate = Database['public']['Tables']['orders']['Update']
