// src/lib/types.ts

// Types de base
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'customer'
  createdAt: Date
}

// Catégorie
export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image_url?: string | null
  parent_id?: string | null
  is_active?: boolean | null
  sort_order?: number | null
  created_at: string
  updated_at: string
}

// ✅ ProductImage MIS À JOUR pour le système de bucket privé
export interface ProductImage {
  id: string
  product_id: string
  alt: string | null // ✅ Renommé de alt_text en alt
  is_primary: boolean
  sort_order: number
  width: number | null
  height: number | null
  storage_original: string // ✅ Chemin dans le bucket
  storage_master: string | null // ✅ Chemin de l'image éditée
  created_at: string
  updated_at: string
}

// Variante de produit
export interface ProductVariant {
  id: string
  product_id: string
  name: string
  value: string
  price_modifier: number | null
  stock_quantity: number | null
  sku: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ✅ Product unifié (remplace Product et ApiProduct)
export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  sale_price: number | null
  category_id: string | null
  is_active: boolean
  is_featured: boolean
  stock_quantity: number | null
  sku: string | null
  weight: number | null
  dimensions: string | null
  created_at: string
  updated_at: string

  // Relations (optionnelles selon le contexte)
  category?: Category | null
  images?: ProductImage[]
  variants?: ProductVariant[]
}

// Alias pour compatibilité avec l'ancien code
export type ApiProduct = Product

// ✅ Helpers pour manipuler les images
export function getPrimaryImage(product: Product): ProductImage | null {
  if (!product.images?.length) return null
  return product.images.find((img) => img.is_primary) ?? product.images[0]
}

export function getSortedImages(product: Product): ProductImage[] {
  if (!product.images?.length) return []
  return [...product.images].sort((a, b) => {
    // Image principale en premier
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    // Puis par sort_order
    return a.sort_order - b.sort_order
  })
}

export function getImagesByPriority(product: Product): ProductImage[] {
  const sorted = getSortedImages(product)
  // Retourne : [principale, ...autres triées]
  return sorted
}

// Collection
export interface Collection {
  id: string
  name: string
  description: string
  image: string
  products: Product[]
  featured?: boolean
}

// ✅ CartItem
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

// Commande
export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  createdAt: Date
}

// Types pour les formulaires
export interface ContactForm {
  name: string
  email: string
  message: string
}

export interface NewsletterForm {
  email: string
}

// Types pour l'API
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

// Types pour les filtres de produits
export interface ProductFilters {
  category?: string
  priceMin?: number
  priceMax?: number
  inStock?: boolean
  featured?: boolean
  colors?: string[]
  sizes?: string[]
}

// Types pour les paramètres de recherche
export interface SearchParams {
  query?: string
  category?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'price' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// ✅ Wishlist
export interface WishlistItem {
  id: string
  user_id: string | null
  product_id: string | null
  created_at: string
  product: Product
}

// ✅ Types pour le système d'images (tailles et formats)
export type ImageSize = 'sm' | 'md' | 'lg' | 'xl'
export type ImageFormat = 'avif' | 'webp' | 'jpg'

export const IMAGE_SIZES: ImageSize[] = ['sm', 'md', 'lg', 'xl']
export const IMAGE_FORMATS: ImageFormat[] = ['avif', 'webp', 'jpg']

export type ProductWithRelations = Product
