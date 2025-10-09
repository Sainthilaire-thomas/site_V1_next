// src/components/editorial/EditorialProductsSection.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'

// Helper pour récupérer les produits par IDs
async function fetchProductsByIds(ids: string[]) {
  if (!ids?.length) return []

  try {
    const response = await fetch(
      '/api/products?' +
        new URLSearchParams({
          ids: ids.join(','),
        })
    )

    if (!response.ok) throw new Error('Failed to fetch products')

    const data = await response.json()
    return data.products || []
  } catch (error) {
    console.error('Error fetching editorial products:', error)
    return []
  }
}

interface EditorialProductsSectionProps {
  title?: string
  productIds: string[]
}

export default function EditorialProductsSection({
  title,
  productIds,
}: EditorialProductsSectionProps) {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addItem } = useCartStore()

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      const fetchedProducts = await fetchProductsByIds(productIds)
      setProducts(fetchedProducts)
      setIsLoading(false)
    }

    if (productIds?.length > 0) {
      loadProducts()
    } else {
      setIsLoading(false)
    }
  }, [productIds])

  if (isLoading) {
    return (
      <section className="py-24 px-8">
        <div className="container mx-auto">
          {title && (
            <h2 className="text-3xl font-light text-center mb-20 text-gray-800 tracking-tight">
              {title}
            </h2>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!products.length) {
    return (
      <section className="py-24 px-8">
        <div className="container mx-auto text-center">
          {title && (
            <h2 className="text-3xl font-light mb-8 text-gray-800 tracking-tight">
              {title}
            </h2>
          )}
          <p className="text-gray-500">
            Aucun produit trouvé pour cette sélection.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 px-8">
      <div className="container mx-auto">
        {title && (
          <h2 className="text-3xl font-light text-center mb-20 text-gray-800 tracking-tight">
            {title}
          </h2>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => {
            const qty = Math.max(0, product.stock_quantity ?? 0)
            const mainImage = product.images?.[0]
            const price = product.sale_price ?? product.price

            return (
              <div key={product.id} className="group">
                <div className="aspect-[3/4] rounded-lg overflow-hidden mb-4 relative border border-gray-50">
                  {mainImage?.url ? (
                    <img
                      src={mainImage.url}
                      alt={mainImage.alt_text || product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Pas d'image</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <Button
                      onClick={() =>
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: price,
                          productId: product.id,
                          imageId: mainImage?.id,
                        })
                      }
                      size="sm"
                      className="bg-white text-gray-900 hover:bg-gray-100"
                      disabled={qty === 0}
                    >
                      <ShoppingBag className="w-4 h-4 mr-1" />
                      {qty > 0 ? 'Panier' : 'Épuisé'}
                    </Button>

                    <Link href={`/products/${product.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white text-white hover:bg-white hover:text-gray-900"
                      >
                        Voir
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="font-medium text-gray-900 group-hover:text-violet-600 transition-colors mb-2">
                    {product.name}
                  </h3>

                  <div className="flex justify-center items-center gap-2 mb-2">
                    {product.sale_price ? (
                      <>
                        <span className="text-lg font-medium text-violet-600">
                          {product.sale_price}€
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {product.price}€
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-medium text-gray-900">
                        {product.price}€
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      qty > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {qty > 0 ? 'En stock' : 'Épuisé'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
