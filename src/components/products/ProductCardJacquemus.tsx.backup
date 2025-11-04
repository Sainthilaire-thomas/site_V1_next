'use client'

import Link from 'next/link'
import { useState } from 'react'

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

export default function ProductCardJacquemus({
  product,
}: {
  product: Product
}) {
  const [isHovered, setIsHovered] = useState(false)
  const mainImage = product.images?.[0]
  const secondImage = product.images?.[1]
  const finalPrice = product.sale_price ?? product.price

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] mb-2 overflow-hidden bg-gray-50">
        {mainImage?.url ? (
          <>
            {/* Image principale */}
            <img
              src={mainImage.url}
              alt={mainImage.alt_text || product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                isHovered ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
              }`}
            />

            {/* Image secondaire (hover) */}
            {secondImage?.url && (
              <img
                src={secondImage.url}
                alt={secondImage.alt_text || product.name}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                  isHovered ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
                }`}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[10px] text-black/20 uppercase tracking-[0.15em]">
              No image
            </span>
          </div>
        )}
      </div>

      {/* Infos produit */}
      <div className="space-y-1">
        <h3 className="text-[11px] font-light tracking-[0.05em] uppercase text-black group-hover:text-black/60 transition-colors duration-300">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-[13px] font-light text-black">
            {finalPrice}€
          </span>

          {product.sale_price && (
            <span className="text-[11px] text-black/30 line-through">
              {product.price}€
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
