// src/components/account/AccountSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Heart, Settings, LogOut } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function AccountSidebar() {
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogoutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setShowConfirm(true)
  }

  const handleLogoutConfirm = async () => {
    setShowConfirm(false)
    setIsLoggingOut(true)

    const toastId = toast.loading('Déconnexion en cours...')

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la déconnexion')
      }

      toast.success('À bientôt ! 👋', { id: toastId })

      await new Promise((resolve) => setTimeout(resolve, 800))

      // ✅ Redirection vers la homepage au lieu de /auth/login
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Erreur lors de la déconnexion', { id: toastId })
      setIsLoggingOut(false)
    }
  }

  const links = [
    {
      href: '/account',
      label: "Vue d'ensemble",
      icon: null,
    },
    {
      href: '/account/orders',
      label: 'Mes commandes',
      icon: Package,
    },
    {
      href: '/account/wishlist',
      label: 'Mes favoris',
      icon: Heart,
    },
    {
      href: '/account/settings',
      label: 'Paramètres',
      icon: Settings,
    },
  ]

  return (
    <>
      <aside className="space-y-1">
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-3 px-4 py-3 text-[13px] tracking-[0.05em] lowercase transition-colors
                  ${
                    isActive
                      ? 'bg-grey-light text-black font-semibold'
                      : 'text-grey-medium hover:text-black hover:bg-grey-light/50'
                  }
                `}
              >
                {Icon && <Icon className="w-4 h-4" strokeWidth={1.5} />}
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* ✅ Changement des couleurs - plus de rouge */}
        <div className="pt-6 border-t border-grey-light">
          <Link
            href="#"
            onClick={handleLogoutClick}
            className={`
              flex items-center gap-3 px-4 py-3 text-[13px] tracking-[0.05em] lowercase transition-colors
              ${
                isLoggingOut
                  ? 'text-grey-medium cursor-not-allowed opacity-50'
                  : 'text-grey-medium hover:text-black hover:bg-grey-light'
              }
            `}
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Se déconnecter
          </Link>
        </div>
      </aside>

      {/* Modal de confirmation - Design minimaliste */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />

          {/* Dialog - Design épuré */}
          <div className="relative bg-white border border-grey-light rounded-none shadow-2xl max-w-md w-full p-8 space-y-6">
            <div className="space-y-3">
              <h3 className="text-[18px] font-light text-black">Déconnexion</h3>
              <p className="text-[13px] tracking-[0.05em] text-grey-medium">
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>
            </div>

            {/* ✅ Boutons sans rouge - Design minimaliste */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-6 py-3 text-[13px] tracking-[0.05em] lowercase font-medium text-grey-medium hover:text-black border border-grey-light hover:border-black transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 px-6 py-3 text-[13px] tracking-[0.05em] lowercase font-medium bg-black text-white hover:bg-grey-dark transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
