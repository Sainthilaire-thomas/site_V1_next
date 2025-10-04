// src/store/useProductStore.ts
import { create } from 'zustand'
import type { ProductWithRelations } from '@/lib/types'

export interface ProductState {
  products: ProductWithRelations[]
  featuredProducts: ProductWithRelations[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchProducts: () => Promise<void>
  fetchFeaturedProducts: () => Promise<void>
  fetchProductById: (id: string) => Promise<ProductWithRelations | null>
  searchProducts: (query: string) => Promise<void>
  filterByCategory: (categorySlug: string) => Promise<void>
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  featuredProducts: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch('/api/products')
      const { data } = await response.json()

      set({ products: data || [], isLoading: false })
    } catch (error) {
      console.error('Error fetching products:', error)
      set({
        error: 'Erreur lors du chargement des produits',
        isLoading: false,
      })
    }
  },

  fetchFeaturedProducts: async () => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch('/api/products?featured=true')
      const { data } = await response.json()

      set({ featuredProducts: data || [], isLoading: false })
    } catch (error) {
      console.error('Error fetching featured products:', error)
      set({
        error: 'Erreur lors du chargement des produits à la une',
        isLoading: false,
      })
    }
  },

  fetchProductById: async (id: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`/api/products/${id}`)
      const { data } = await response.json()

      set({ isLoading: false })
      return data || null
    } catch (error) {
      console.error('Error fetching product:', error)
      set({
        error: 'Erreur lors du chargement du produit',
        isLoading: false,
      })
      return null
    }
  },

  searchProducts: async (query: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(
        `/api/products?q=${encodeURIComponent(query)}`
      )
      const { data } = await response.json()

      set({ products: data || [], isLoading: false })
    } catch (error) {
      console.error('Error searching products:', error)
      set({
        error: 'Erreur lors de la recherche',
        isLoading: false,
      })
    }
  },

  filterByCategory: async (categorySlug: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(
        `/api/products?category=${encodeURIComponent(categorySlug)}`
      )
      const { data } = await response.json()

      set({ products: data || [], isLoading: false })
    } catch (error) {
      console.error('Error filtering products:', error)
      set({
        error: 'Erreur lors du filtrage',
        isLoading: false,
      })
    }
  },
}))
