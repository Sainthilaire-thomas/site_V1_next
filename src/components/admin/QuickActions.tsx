// src/components/admin/QuickActions.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function QuickActions() {
  const pathname = usePathname()

  // Ne pas afficher sur la page d'accueil admin
  if (pathname === '/admin') return null

  const actions = [
    {
      label: 'Nouveau produit',
      href: '/admin/products/new',
      icon: '➕',
      show: pathname.includes('/products'),
    },
    {
      label: 'Tous les produits',
      href: '/admin/products',
      icon: '📋',
      show: pathname.includes('/products') && pathname !== '/admin/products',
    },
    {
      label: 'Médias',
      href: '/admin/media',
      icon: '🖼️',
      show: pathname.includes('/products/') && !pathname.includes('/media'),
    },
  ].filter((action) => action.show)

  if (actions.length === 0) return null

  return (
    <div className="mb-6 flex gap-2 flex-wrap">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:border-violet hover:text-violet transition-colors"
        >
          <span>{action.icon}</span>
          <span>{action.label}</span>
        </Link>
      ))}
    </div>
  )
}
