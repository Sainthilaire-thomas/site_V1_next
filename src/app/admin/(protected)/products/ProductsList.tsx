// src/app/admin/products/ProductsList.tsx
'use client'

import Link from 'next/link'
import { ProductImage } from '@/components/products/ProductImage'

type Product = {
  id: string
  name: string
  price: number
  is_active: boolean
  is_featured: boolean
  stock_quantity: number | null
  primary_image_id: string | null
}

type Props = {
  products: Product[]
}

export function ProductsList({ products }: Props) {
  return (
    <div className="grid gap-3">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/admin/products/${p.id}`}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg hover:border-violet transition-colors overflow-hidden"
        >
          <div className="flex gap-4 p-4">
            {/* Miniature */}
            <div className="flex-shrink-0 w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
              {p.primary_image_id ? (
                <ProductImage
                  productId={p.id}
                  imageId={p.primary_image_id}
                  alt={p.name}
                  size="sm"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  Pas d'image
                </div>
              )}
            </div>

            {/* Informations */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-lg mb-1">{p.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-3 flex-wrap">
                <span>€ {Number(p.price).toFixed(2)}</span>
                <span>•</span>
                <span
                  className={
                    p.is_active
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }
                >
                  {p.is_active ? 'Actif' : 'Inactif'}
                </span>
                {p.is_featured && (
                  <>
                    <span>•</span>
                    <span className="text-violet">★ À la une</span>
                  </>
                )}
                {p.stock_quantity !== null && (
                  <>
                    <span>•</span>
                    <span
                      className={
                        p.stock_quantity <= 0
                          ? 'text-red-600 dark:text-red-400'
                          : p.stock_quantity < 10
                            ? 'text-orange-500'
                            : 'text-green-600 dark:text-green-400'
                      }
                    >
                      Stock: {p.stock_quantity}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
