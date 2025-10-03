// src/components/admin/AdminNav.tsx
'use client'

import Link from 'next/link'

export function AdminNav() {
  return (
    <nav className="hidden md:flex items-center gap-6 text-sm">
      <Link
        href="/admin/products"
        className="hover:text-violet transition-colors"
      >
        Produits
      </Link>
      <Link
        href="/admin/products"
        className="hover:text-violet transition-colors"
      >
        Catégories
      </Link>
      <Link href="/admin/media" className="hover:text-violet transition-colors">
        Médias
      </Link>
      <button
        className="hover:text-violet transition-colors opacity-50 cursor-not-allowed"
        disabled
      >
        Commandes
      </button>
      <button
        className="hover:text-violet transition-colors opacity-50 cursor-not-allowed"
        disabled
      >
        Clients
      </button>
    </nav>
  )
}
