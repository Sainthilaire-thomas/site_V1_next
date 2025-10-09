// src/components/products/ProductGridJacquemus.tsx
'use client'

import Link from 'next/link'
import { ProductImage } from '@/components/products/ProductImage'
import type { ProductWithRelations } from '@/lib/types'
import { getPrimaryImage } from '@/lib/types'

export default function ProductGridJacquemus({
  products,
}: {
  products: ProductWithRelations[]
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
      {products.map((product) => {
        const primaryImage = getPrimaryImage(product)
        const price = product.sale_price ?? product.price
        const hasDiscount = !!product.sale_price

        return (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="group block"
          >
            {/* Image - sans margin bottom pour coller verticalement aussi */}
            <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
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
                  <span className="text-[10px] text-gray-300 uppercase tracking-wider">
                    No image
                  </span>
                </div>
              )}

              {/* Badge stock */}
              {(product.stock_quantity ?? 0) <= 0 && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <span className="text-[10px] tracking-[0.15em] uppercase text-black/40">
                    Épuisé
                  </span>
                </div>
              )}

              {/* Overlay avec infos au hover - affiché par-dessus l'image */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                <h3 className="text-[13px] font-light tracking-[0.05em] text-white mb-2 text-center">
                  {product.name}
                </h3>

                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-normal text-white">
                    {price}€
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
