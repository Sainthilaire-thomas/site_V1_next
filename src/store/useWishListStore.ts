// src/store/useWishListStore.ts
import { create } from 'zustand'
import type { WishlistItem } from '@/lib/types'

interface WishlistState {
  items: WishlistItem[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchWishlist: (userId: string) => Promise<void>
  addToWishlist: (userId: string, productId: string) => Promise<void>
  removeFromWishlist: (itemId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchWishlist: async (userId: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`/api/wishlist?userId=${userId}`)
      const { data } = await response.json()

      // ✅ Filtrer les items où product n'est pas null
      const validItems = (data || []).filter(
        (item: any) => item.product !== null
      )

      set({ items: validItems, isLoading: false })
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      set({
        error: 'Erreur lors du chargement de la wishlist',
        isLoading: false,
      })
    }
  },

  addToWishlist: async (userId: string, productId: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId }),
      })

      if (!response.ok) throw new Error('Failed to add to wishlist')

      const { data } = await response.json()

      // ✅ Vérifier que product n'est pas null avant d'ajouter
      if (data?.product) {
        set((state) => ({
          items: [...state.items, data],
          isLoading: false,
        }))
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      set({
        error: "Erreur lors de l'ajout à la wishlist",
        isLoading: false,
      })
    }
  },

  removeFromWishlist: async (itemId: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove from wishlist')

      set((state) => ({
        items: state.items.filter((item) => item.id !== itemId),
        isLoading: false,
      }))
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      set({
        error: 'Erreur lors de la suppression',
        isLoading: false,
      })
    }
  },

  isInWishlist: (productId: string) => {
    return get().items.some((item) => item.product_id === productId)
  },

  clearWishlist: () => {
    set({ items: [], error: null })
  },
}))
