// src/app/admin/media/BreadcrumbProvider.tsx
'use client'

import { useEffect } from 'react'

type Props = {
  productId: string | null
  productName: string | null
}

// Ce composant injecte les données dans l'URL pour que le breadcrumb puisse les utiliser
export function BreadcrumbProvider({ productId, productName }: Props) {
  useEffect(() => {
    if (productId && productName) {
      // Stocker dans sessionStorage pour que Breadcrumb puisse y accéder
      sessionStorage.setItem(`product_${productId}`, productName)
    }
  }, [productId, productName])

  return null
}
