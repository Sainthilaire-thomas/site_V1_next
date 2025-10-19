// src/components/admin/AdminNav.tsx
// Version avec sous-menu déroulant

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  FolderOpen,
  ImageIcon,
  BarChart3,
  Instagram,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Link2,
  FileText,
  Mail, // ✅ AJOUTÉ
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: any
  badge?: string
  children?: NavItem[]
}

export function AdminNav() {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<string[]>(['Social Media'])

  const toggleSection = (label: string) => {
    setOpenSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    )
  }

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Produits',
      href: '/admin/products',
      icon: Package,
    },
    {
      label: 'Commandes',
      href: '/admin/orders',
      icon: ShoppingCart,
    },
    {
      label: 'Clients',
      href: '/admin/customers',
      icon: Users,
    },
    {
      label: 'Catégories',
      href: '/admin/categories',
      icon: FolderOpen,
    },
    {
      label: 'Médias',
      href: '/admin/media',
      icon: ImageIcon,
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
    // ⭐ NOUVEAU : Section Social Media avec sous-menu
    {
      label: 'Social Media',
      href: '/admin/social',
      icon: Instagram,
      badge: 'NEW',
      children: [
        {
          label: 'Dashboard',
          href: '/admin/social',
          icon: TrendingUp,
        },
        {
          label: 'Posts',
          href: '/admin/social/posts',
          icon: FileText,
        },
        {
          label: 'Comparaison',
          href: '/admin/social/compare',
          icon: BarChart3,
        },
        {
          label: 'Générateur de liens',
          href: '/admin/social/links',
          icon: Link2,
        },
      ],
    },
    // ✅ AJOUTÉ : Email Preview
    {
      label: 'Email Preview',
      href: '/admin/email-preview',
      icon: Mail,
    },
  ]

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isOpen = openSections.includes(item.label)
    const isActive =
      pathname === item.href ||
      (hasChildren &&
        item.children?.some(
          (child) =>
            pathname === child.href || pathname.startsWith(child.href + '/')
        ))

    if (hasChildren) {
      return (
        <div key={item.href} className="space-y-1">
          {/* Bouton parent */}
          <button
            onClick={() => toggleSection(item.label)}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="flex-1 text-left">{item.label}</span>

            {item.badge && (
              <span className="rounded-full bg-violet px-2 py-0.5 text-xs text-white">
                {item.badge}
              </span>
            )}

            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {/* Sous-menu */}
          {isOpen && item.children && (
            <div className="ml-4 space-y-1 border-l-2 border-border pl-2">
              {item.children.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    // Item simple (sans enfants)
    const isItemActive =
      pathname === item.href || pathname.startsWith(item.href + '/')

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          depth > 0 && 'text-sm',
          isItemActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <item.icon className="h-5 w-5" />
        <span>{item.label}</span>

        {item.badge && (
          <span className="ml-auto rounded-full bg-violet px-2 py-0.5 text-xs text-white">
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <nav className="space-y-1">
      {navItems.map((item) => renderNavItem(item))}
    </nav>
  )
}
