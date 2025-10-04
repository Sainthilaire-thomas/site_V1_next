// src/app/admin/products/[id]/ProductPageWrapper.tsx
'use client'

import { useEffect } from 'react'
import { ProductFormClient } from './ProductFormClient'

export function ProductPageWrapper({
  product,
  variants,
  productId,
  categories,
}: {
  product: any
  variants: any[]
  productId: string
  categories: Array<{ id: string; name: string }>
}) {
  // Stocker le nom du produit pour le breadcrumb
  useEffect(() => {
    if (product?.name) {
      sessionStorage.setItem(`product_${productId}`, product.name)
    }
  }, [product?.name, productId])

  return (
    <ProductFormClient
      product={product}
      variants={variants}
      productId={productId}
      categories={categories}
    />
  )
}
