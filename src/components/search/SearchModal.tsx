// src/components/search/SearchModal.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { Product, Category, ProductImage } from '@/lib/types'
import {
  getProductImageUrl,
  getPrimaryProductImage,
  PLACEHOLDER_IMAGE,
} from '@/lib/image-helpers'

type SearchProduct = Product & {
  category?: Category | null
  images?: ProductImage[]
}

type SearchModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<SearchProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Navigation rapide
  const quickLinks = [
    { label: '.tops', href: '/products/hauts' },
    { label: '.bottoms', href: '/products/bas' },
    { label: '.accessories', href: '/products/accessoires' },
    { label: '.silhouettes', href: '/lookbooks' },
    { label: '.impact', href: '/sustainability' },
  ]

  // Focus automatique sur l'input quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Recherche de produits
  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setProducts([])
      return
    }

    setIsLoading(true)

    try {
      // 1. Récupérer les produits
      const { data: productsData, error: productsError } = await supabaseBrowser
        .from('products')
        .select('*')
        .eq('is_active', true)
        .ilike('name', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(6)

      if (productsError) {
        console.error('Error fetching products:', productsError)
        setProducts([])
        setIsLoading(false)
        return
      }

      if (!productsData || productsData.length === 0) {
        setProducts([])
        setIsLoading(false)
        return
      }

      // 2. Récupérer les catégories
      const categoryIds = productsData
        .map((p) => p.category_id)
        .filter((id): id is string => id !== null && id !== undefined)

      const uniqueCategoryIds = [...new Set(categoryIds)]
      const categoriesMap = new Map<string, Category>()

      if (uniqueCategoryIds.length > 0) {
        const { data: categoriesData } = await supabaseBrowser
          .from('categories')
          .select('*')
          .in('id', uniqueCategoryIds)

        if (categoriesData) {
          categoriesData.forEach((cat) => {
            categoriesMap.set(cat.id, cat)
          })
        }
      }

      // 3. Récupérer les images
      const productIds = productsData.map((p) => p.id)
      const { data: imagesData } = await supabaseBrowser
        .from('product_images')
        .select('*')
        .in('product_id', productIds)
        .order('sort_order', { ascending: true })

      // 4. Grouper les images par produit
      const imagesMap = new Map<string, ProductImage[]>()
      if (imagesData) {
        imagesData.forEach((img) => {
          if (!imagesMap.has(img.product_id)) {
            imagesMap.set(img.product_id, [])
          }
          imagesMap.get(img.product_id)!.push(img)
        })
      }

      // 5. Combiner toutes les données
      const transformedProducts: SearchProduct[] = productsData.map(
        (product) => ({
          ...product,
          category: product.category_id
            ? categoriesMap.get(product.category_id)
            : null,
          images: imagesMap.get(product.id) || [],
        })
      )

      setProducts(transformedProducts)
    } catch (err) {
      console.error('Search error:', err)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchProducts])

  // Gestion de la touche ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Voir tous les résultats
  const handleViewAll = () => {
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    onClose()
  }

  // Helper pour obtenir l'URL d'une image
  const getImageUrl = (images: ProductImage[]): string => {
    const primaryImage = getPrimaryProductImage(images)
    if (!primaryImage) return PLACEHOLDER_IMAGE
    return getProductImageUrl(primaryImage.id, 'md')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] pointer-events-none">
        <div className="h-full w-full flex flex-col pointer-events-auto">
          {/* Header - Barre de recherche */}
          <div className="bg-white border-b border-black/10 animate-in slide-in-from-top duration-300">
            <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-16 py-6">
              <div className="flex items-center gap-4">
                {/* Input de recherche */}
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40"
                    strokeWidth={1.5}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="search..."
                    className="w-full pl-8 pr-4 text-[24px] sm:text-[32px] font-light lowercase tracking-tight focus:outline-none bg-transparent placeholder:text-black/20"
                  />
                </div>

                {/* Bouton fermer */}
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center hover:opacity-60 transition-opacity"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 bg-white overflow-y-auto">
            <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
              {/* Pas de recherche - Afficher les liens rapides */}
              {!searchQuery.trim() && (
                <div>
                  <h2 className="text-[11px] uppercase tracking-[0.1em] text-black/40 mb-6">
                    quick access
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {quickLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className="group aspect-square border border-black/10 hover:border-black transition-colors flex items-center justify-center"
                      >
                        <span className="text-[15px] lowercase tracking-[0.05em] group-hover:scale-105 transition-transform">
                          {link.label}
                        </span>
                      </Link>
                    ))}
                  </div>

                  {/* Suggestions populaires */}
                  <div className="mt-12">
                    <h2 className="text-[11px] uppercase tracking-[0.1em] text-black/40 mb-4">
                      popular searches
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {['bag', 'dress', 'shirt', 'shoes', 'hat'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="px-4 py-2 border border-black/10 hover:border-black text-[13px] lowercase tracking-[0.05em] transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recherche en cours */}
              {searchQuery.trim() && isLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="aspect-[3/4] bg-black/5 animate-pulse" />
                      <div className="h-3 bg-black/5 animate-pulse w-3/4" />
                      <div className="h-3 bg-black/5 animate-pulse w-1/2" />
                    </div>
                  ))}
                </div>
              )}

              {/* Résultats */}
              {searchQuery.trim() && !isLoading && (
                <>
                  {products.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black/5 mb-6">
                        <Search
                          className="w-6 h-6 text-black/40"
                          strokeWidth={1.5}
                        />
                      </div>
                      <h2 className="text-[18px] font-light mb-2 lowercase">
                        no results for "{searchQuery}"
                      </h2>
                      <p className="text-[13px] text-black/40">
                        try a different search term
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[11px] uppercase tracking-[0.1em] text-black/40">
                          {products.length} result
                          {products.length > 1 ? 's' : ''}
                        </h2>
                        {products.length >= 6 && (
                          <button
                            onClick={handleViewAll}
                            className="text-[13px] lowercase tracking-[0.05em] underline hover:no-underline transition-all"
                          >
                            view all results →
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {products.map((product) => {
                          const imageUrl = getImageUrl(product.images || [])
                          const price = product.sale_price ?? product.price

                          return (
                            <Link
                              key={product.id}
                              href={`/product/${product.id}`}
                              onClick={onClose}
                              className="group"
                            >
                              {/* Image */}
                              <div className="aspect-[3/4] bg-black/5 mb-2 overflow-hidden relative">
                                <img
                                  src={imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = PLACEHOLDER_IMAGE
                                  }}
                                />
                              </div>

                              {/* Infos */}
                              <div className="space-y-1">
                                <h3 className="text-[11px] font-light tracking-[0.05em] text-black group-hover:underline line-clamp-1">
                                  {product.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                  {product.sale_price ? (
                                    <>
                                      <span className="text-[11px] font-normal text-black">
                                        {price}€
                                      </span>
                                      <span className="text-[10px] text-black/30 line-through">
                                        {product.price}€
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-[11px] font-normal text-black">
                                      {price}€
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          )
                        })}
                      </div>

                      {products.length >= 6 && (
                        <div className="mt-8 text-center">
                          <button
                            onClick={handleViewAll}
                            className="border border-black px-8 py-3 text-[13px] lowercase tracking-[0.05em] hover:bg-black hover:text-white transition-colors"
                          >
                            view all results
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
