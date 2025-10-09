// src/app/account/wishlist/WishlistClient.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { ProductImage } from '@/components/products/ProductImage'
import { useCartStore } from '@/store/useCartStore'
import { toast } from 'sonner'
import type { Database } from '@/lib/database.types'

// Type complet depuis la DB
type ProductImageRow = Database['public']['Tables']['product_images']['Row']

type WishlistItem = {
  id: string
  product: {
    id: string
    name: string
    price: number
    sale_price: number | null
    images: ProductImageRow[]
  } | null
}

interface Props {
  initialItems: WishlistItem[]
}

export default function WishlistClient({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const { addItem } = useCartStore()

  const handleRemove = async (itemId: string) => {
    setIsRemoving(itemId)

    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove')

      setItems((prev) => prev.filter((item) => item.id !== itemId))
      toast.success('Retiré des favoris')
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsRemoving(null)
    }
  }

  const handleAddToCart = (product: WishlistItem['product']) => {
    if (!product) return

    const primaryImage =
      product.images?.find((img) => img.is_primary === true) ??
      product.images?.[0]

    addItem({
      id: product.id,
      name: product.name,
      price: product.sale_price ?? product.price,
      productId: product.id,
      imageId: primaryImage?.id,
    })
    toast.success('Ajouté au panier')
  }

  if (!items.length) {
    return (
      <div className="space-y-8">
        <h1 className="text-[32px] font-light tracking-tight text-black">
          Mes Favoris
        </h1>

        <div className="text-center py-24 border border-grey-light">
          <p className="text-grey-medium text-[15px] mb-6">
            Votre liste de favoris est vide
          </p>
          <Link
            href="/products"
            className="text-[13px] tracking-[0.05em] font-semibold lowercase text-black hover:text-grey-medium transition-colors"
          >
            Découvrir nos produits →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-light tracking-tight text-black">
          Mes Favoris
        </h1>
        <span className="text-[13px] text-grey-medium">
          {items.length} {items.length > 1 ? 'articles' : 'article'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => {
          if (!item.product) return null

          const product = item.product
          // Comparaison stricte avec true pour gérer le nullable
          const primaryImage =
            product.images?.find((img) => img.is_primary === true) ??
            product.images?.[0]

          return (
            <div key={item.id} className="group relative">
              <button
                onClick={() => handleRemove(item.id)}
                disabled={isRemoving === item.id}
                className="absolute top-2 right-2 z-10 w-8 h-8 bg-white border border-grey-light hover:bg-black hover:border-black hover:text-white transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                aria-label="Retirer des favoris"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <Link href={`/product/${product.id}`}>
                <div className="aspect-[3/4] bg-grey-light mb-3 overflow-hidden">
                  {primaryImage ? (
                    <ProductImage
                      productId={product.id}
                      imageId={primaryImage.id}
                      alt={primaryImage.alt || product.name}
                      size="md"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-grey-medium text-[11px]">
                        No image
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="space-y-2">
                <Link href={`/product/${product.id}`}>
                  <h3 className="text-[13px] font-light text-black group-hover:text-grey-medium transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {product.sale_price ? (
                      <>
                        <span className="text-[13px] font-medium text-black">
                          {product.sale_price}€
                        </span>
                        <span className="text-[11px] text-grey-medium line-through">
                          {product.price}€
                        </span>
                      </>
                    ) : (
                      <span className="text-[13px] font-medium text-black">
                        {product.price}€
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="text-[11px] tracking-[0.05em] font-semibold lowercase text-black hover:text-grey-medium transition-colors"
                  >
                    + panier
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
