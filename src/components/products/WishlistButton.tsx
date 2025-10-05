// ============================================
// BONUS: Bouton Heart pour ajouter/retirer
// src/components/products/WishlistButton.tsx
// ============================================
'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { toast } from 'sonner'

interface Props {
  productId: string
  className?: string
}

export function WishlistButton({ productId, className = '' }: Props) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser()
      setUserId(user?.id ?? null)

      if (user) {
        // Vérifier si le produit est déjà en wishlist
        const { data } = await supabaseBrowser
          .from('wishlist_items')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .single()

        setIsInWishlist(!!data)
      }
    }

    checkAuth()
  }, [productId])

  const handleToggle = async () => {
    if (!userId) {
      toast.error('Connectez-vous pour ajouter aux favoris')
      return
    }

    setIsLoading(true)

    try {
      if (isInWishlist) {
        // Supprimer
        const { data: item } = await supabaseBrowser
          .from('wishlist_items')
          .select('id')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .single()

        if (item) {
          await fetch(`/api/wishlist/${item.id}`, { method: 'DELETE' })
          setIsInWishlist(false)
          toast.success('Retiré des favoris')
        }
      } else {
        // Ajouter
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
        setIsInWishlist(true)
        toast.success('Ajouté aux favoris')
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        w-10 h-10 flex items-center justify-center
        border transition-colors
        ${
          isInWishlist
            ? 'bg-black border-black text-white'
            : 'bg-white border-grey-light hover:border-black'
        }
        ${className}
      `}
      aria-label={isInWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart
        className="w-5 h-5"
        strokeWidth={1.5}
        fill={isInWishlist ? 'currentColor' : 'none'}
      />
    </button>
  )
}
