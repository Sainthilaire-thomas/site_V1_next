// src/app/admin/media/MediaGridHeader.tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export function MediaGridHeader({ productId }: { productId: string | null }) {
  const [productName, setProductName] = useState<string | null>(null)

  useEffect(() => {
    if (productId && typeof window !== 'undefined') {
      const name = sessionStorage.getItem(`product_${productId}`)
      setProductName(name)
    }
  }, [productId])

  if (!productId) {
    return (
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Gestion des médias</h1>
        <div className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
          <p className="font-medium mb-2">⚠️ Aucun produit sélectionné</p>
          <p className="text-sm">
            Pour gérer les images d'un produit, accédez à la page du produit et
            cliquez sur "Gérer les images".
          </p>
          <Link
            href="/admin/products"
            className="inline-block mt-3 text-sm underline hover:text-amber-700 dark:hover:text-amber-300"
          >
            → Voir tous les produits
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">
            Images {productName && `de "${productName}"`}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gérez les images de ce produit : upload, édition, réorganisation
          </p>
        </div>

        <Link
          href={`/admin/products/${productId}`}
          className="flex-shrink-0 px-4 py-2 border border-violet text-violet rounded hover:bg-violet hover:text-white transition-colors text-sm font-medium"
        >
          ← Retour au produit
        </Link>
      </div>
    </div>
  )
}
