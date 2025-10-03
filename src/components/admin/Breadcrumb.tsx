// src/components/admin/Breadcrumb.tsx
'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

type BreadcrumbItem = {
  label: string
  href: string
  icon?: string
}

type Props = {
  productName?: string
  productId?: string
}

export function Breadcrumb({ productName, productId }: Props = {}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Accueil', href: '/admin', icon: '🏠' },
    ]

    // Parse pathname
    const segments = pathname.split('/').filter(Boolean)

    // Remove 'admin' depuis les segments car déjà dans items
    const adminIndex = segments.indexOf('admin')
    if (adminIndex !== -1) {
      segments.splice(adminIndex, 1)
    }

    // Construire les breadcrumbs
    let currentPath = '/admin'

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const prevSegment = i > 0 ? segments[i - 1] : null
      currentPath += `/${segment}`

      // Logique de labeling intelligente
      let label = segment.charAt(0).toUpperCase() + segment.slice(1)
      let icon: string | undefined

      // Cas spéciaux
      if (segment === 'products') {
        label = 'Produits'
        icon = '📦'
      } else if (segment === 'media') {
        label = 'Médias'
        icon = '🖼️'
        // Si on a un product_id dans les params, ajouter le contexte produit
        const prodId = searchParams.get('product_id')
        if (prodId && productName) {
          // Insérer le breadcrumb produit avant média
          items.push({
            label: 'Produits',
            href: '/admin/products',
            icon: '📦',
          })
          items.push({
            label: productName,
            href: `/admin/products/${prodId}`,
          })
        }
      } else if (segment === 'new') {
        label = 'Nouveau'
        icon = '➕'
      } else if (segment === 'orders') {
        label = 'Commandes'
        icon = '🛒'
      } else if (segment === 'customers') {
        label = 'Clients'
        icon = '👥'
      } else if (segment === 'settings') {
        label = 'Paramètres'
        icon = '⚙️'
      } else if (segment.match(/^[0-9a-f-]{36}$/i)) {
        // UUID - afficher le nom du produit si disponible
        if (prevSegment === 'products' && productName) {
          label = productName
        } else {
          label = 'Détail'
        }
      }

      items.push({ label, href: currentPath, icon })
    }

    return items
  }, [pathname, searchParams, productName])

  // Ne rien afficher si on est sur la page d'accueil admin
  if (breadcrumbs.length <= 1) return null

  return (
    <nav aria-label="Fil d'Ariane" className="mb-6 text-sm">
      <ol className="flex items-center gap-2 flex-wrap">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <li
              key={`${item.href}-${index}`}
              className="flex items-center gap-2"
            >
              {index > 0 && (
                <span className="text-gray-400 dark:text-gray-600 select-none">
                  /
                </span>
              )}

              {isLast ? (
                <span className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  {item.icon && <span className="text-base">{item.icon}</span>}
                  <span className="max-w-[200px] truncate" title={item.label}>
                    {item.label}
                  </span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-violet hover:underline transition-colors flex items-center gap-1.5"
                >
                  {item.icon && <span className="text-base">{item.icon}</span>}
                  <span className="max-w-[150px] truncate" title={item.label}>
                    {item.label}
                  </span>
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
