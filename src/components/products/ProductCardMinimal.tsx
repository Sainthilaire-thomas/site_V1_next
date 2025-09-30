// src/components/products/ProductCardMinimal.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/useCartStore'
import { ShoppingBag } from 'lucide-react'

type Product = {
  id: string
  name: string
  short_description: string | null
  price: number
  sale_price: number | null
  stock_quantity: number | null
  images?: Array<{ url: string; alt_text: string | null }>
  category?: { name: string } | null
}

export default function ProductCardMinimal({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false)
  const { addItem } = useCartStore()

  const mainImage = product.images?.[0]
  const hoverImage = product.images?.[1] || mainImage
  const qty = Math.max(0, product.stock_quantity ?? 0)
  const price = product.sale_price ?? product.price

  return (
    <div
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image avec changement au hover */}
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-grey-light">
          {mainImage?.url && (
            <>
              <img
                src={isHovered && hoverImage ? hoverImage.url : mainImage.url}
                alt={mainImage.alt_text || product.name}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
              />

              {/* Overlay hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-500" />
            </>
          )}

          {!mainImage?.url && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-grey-medium text-sm">Pas d'image</span>
            </div>
          )}

          {/* Badge ÉPUISÉ */}
          {qty === 0 && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <span className="text-product">ÉPUISÉ</span>
            </div>
          )}

          {/* Bouton panier au hover */}
          {qty > 0 && (
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  addItem({
                    id: product.id,
                    name: product.name,
                    price: price,
                    image: mainImage?.url ?? '/placeholder.jpg',
                  })
                }}
                className="bg-black text-white p-3 hover:bg-grey-dark transition-colors"
                aria-label="Ajouter au panier"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Infos produit */}
      <div className="space-y-2">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-product text-black group-hover:text-grey-medium transition-colors">
            {product.name.toUpperCase()}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <p className="text-body text-black font-semibold">
            {product.sale_price ? (
              <>
                <span className="text-black">{product.sale_price}€</span>
                <span className="text-grey-medium line-through ml-2 text-sm">
                  {product.price}€
                </span>
              </>
            ) : (
              <span>{product.price}€</span>
            )}
          </p>

          {/* Statut stock */}
          <span
            className={`text-xs ${
              qty > 0 ? 'text-grey-medium' : 'text-grey-dark'
            }`}
          >
            {qty > 0 ? 'En stock' : 'Épuisé'}
          </span>
        </div>
      </div>
    </div>
  )
}
