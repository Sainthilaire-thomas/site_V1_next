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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
            {/* Image */}
            <div className="aspect-[3/4] bg-gray-100 mb-2 overflow-hidden relative">
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

              {/* Badge promo si sale_price */}
              {hasDiscount && (
                <div className="absolute top-2 right-2 bg-black text-white text-[9px] px-2 py-0.5 tracking-wider">
                  PROMO
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
            </div>

            {/* Infos */}
            <div className="space-y-1">
              <h3 className="text-[11px] font-light tracking-[0.05em] text-black group-hover:underline">
                {product.name}
              </h3>

              <div className="flex items-center gap-2">
                {hasDiscount ? (
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

              {product.category?.name && (
                <p className="text-[9px] tracking-[0.1em] uppercase text-black/30">
                  {product.category.name}
                </p>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
