// src/components/admin/AdminNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AdminNav() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname.startsWith(path)

  return (
    <nav className="hidden md:flex items-center gap-6 text-sm">
      <Link
        href="/admin/products"
        className={`hover:text-violet transition-colors ${
          isActive('/admin/products') ? 'text-violet font-medium' : ''
        }`}
      >
        Produits
      </Link>
      <Link
        href="/admin/categories"
        className={`hover:text-violet transition-colors ${
          isActive('/admin/categories') ? 'text-violet font-medium' : ''
        }`}
      >
        Catégories
      </Link>
      <Link
        href="/admin/orders"
        className={`hover:text-violet transition-colors ${
          isActive('/admin/orders') ? 'text-violet font-medium' : ''
        }`}
      >
        Commandes
      </Link>
      <button
        className="hover:text-violet transition-colors opacity-50 cursor-not-allowed"
        disabled
      >
        Clients
      </button>
    </nav>
  )
}
