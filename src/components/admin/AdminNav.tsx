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
      <Link
        href="/admin/customers"
        className={`px-3 py-2 rounded transition-colors ${
          pathname.startsWith('/admin/customers')
            ? 'bg-violet text-white'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        Clients
      </Link>
      <Link
        href="/admin/email-preview"
        className={`px-3 py-2 rounded transition-colors ${
          pathname.startsWith('/admin/email-preview')
            ? 'bg-violet text-white'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        Emails preview
      </Link>
      <Link
        href="/admin/launch-notifications"
        className={`px-3 py-2 rounded transition-colors ${
          pathname.startsWith('/admin/launch-notifications')
            ? 'bg-violet text-white'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        Preclients launch
      </Link>
      {/* 🎯 NOUVEAU: Lien Analytics */}
      <Link
        href="/admin/analytics"
        className={`px-3 py-2 rounded transition-colors ${
          pathname.startsWith('/admin/analytics')
            ? 'bg-violet text-white'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        Analytics
      </Link>
    </nav>
  )
}
