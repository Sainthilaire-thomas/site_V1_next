// src/store/useCartStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Type CartItem étendu avec les champs nécessaires pour Stripe
export interface CartItem {
  // Identifiants
  id: string // ID unique du cart item (combinaison product+variant)
  productId: string // ID du produit dans Supabase
  variantId?: string | null // ID de la variante si applicable
  imageId?: string // ✅ AJOUT : ID de l'image pour ProductImage component

  // Informations produit
  name: string // Nom du produit
  description?: string // Description (optionnel)
  image?: string // URL de l'image (optionnel, pour compatibilité)

  // Variantes
  size?: string // Taille
  color?: string // Couleur

  // Prix et quantité
  price: number // Prix unitaire
  quantity: number // Quantité
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
}

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  return { totalItems, totalPrice }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.id === newItem.id &&
              item.size === newItem.size &&
              item.color === newItem.color
          )

          let newItems

          if (existingItemIndex > -1) {
            // Item exists, increment quantity
            newItems = state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          } else {
            // New item, add to cart
            newItems = [...state.items, { ...newItem, quantity: 1 }]
          }

          const { totalItems, totalPrice } = calculateTotals(newItems)

          return {
            items: newItems,
            totalItems,
            totalPrice,
            isOpen: true, // Open cart when item is added
          }
        })
      },

      removeItem: (itemId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId)
          const { totalItems, totalPrice } = calculateTotals(newItems)

          return {
            items: newItems,
            totalItems,
            totalPrice,
          }
        })
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            const newItems = state.items.filter((item) => item.id !== itemId)
            const { totalItems, totalPrice } = calculateTotals(newItems)
            return { items: newItems, totalItems, totalPrice }
          }

          const newItems = state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )

          const { totalItems, totalPrice } = calculateTotals(newItems)

          return {
            items: newItems,
            totalItems,
            totalPrice,
          }
        })
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        })
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }))
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      },
    }),
    {
      name: 'blanche-renaudin-cart',
      // Only persist cart items, not UI state like isOpen
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      }),
    }
  )
)

// Hook de compatibilité pour l'ancien useCart
export const useCart = () => {
  const store = useCartStore()
  return {
    items: store.items,
    totalItems: store.totalItems,
    totalPrice: store.totalPrice,
    isOpen: store.isOpen,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    toggleCart: store.toggleCart,
    openCart: store.openCart,
    closeCart: store.closeCart,
  }
}
