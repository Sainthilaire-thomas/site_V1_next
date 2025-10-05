// src/components/account/AccountSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Package, Heart, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

const NAV_ITEMS = [
  { href: '/account', label: 'Dashboard', icon: User },
  { href: '/account/orders', label: 'Commandes', icon: Package },
  { href: '/account/wishlist', label: 'Favoris', icon: Heart },
  { href: '/account/settings', label: 'Paramètres', icon: Settings },
]

export default function AccountSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuthStore()

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-3 px-4 py-3 
              text-[13px] tracking-[0.05em] font-semibold lowercase
              transition-colors
              ${
                isActive
                  ? 'text-black bg-grey-light'
                  : 'text-grey-medium hover:text-black'
              }
            `}
          >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            {item.label}
          </Link>
        )
      })}

      <button
        onClick={() => signOut()}
        className="
          flex items-center gap-3 px-4 py-3 w-full
          text-[13px] tracking-[0.05em] font-semibold lowercase
          text-grey-medium hover:text-black
          transition-colors
        "
      >
        <LogOut className="w-4 h-4" strokeWidth={1.5} />
        Déconnexion
      </button>
    </nav>
  )
}
