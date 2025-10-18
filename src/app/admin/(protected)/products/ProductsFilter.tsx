// src/app/admin/products/ProductsFilter.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function ProductsFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showInactive = searchParams.get('show_inactive') === '1'

  function toggleInactive(checked: boolean) {
    const params = new URLSearchParams(searchParams.toString())

    if (checked) {
      params.set('show_inactive', '1')
    } else {
      params.delete('show_inactive')
    }

    router.push(`/admin/products?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) => toggleInactive(e.target.checked)}
          className="rounded border-gray-300 text-violet focus:ring-violet"
        />
        <span className="text-sm font-medium">
          Afficher les produits inactifs
        </span>
      </label>
    </div>
  )
}
