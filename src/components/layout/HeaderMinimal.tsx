// src/components/layout/HeaderMinimal.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react'
import { useEffect, useState, useCallback, memo } from 'react'

// Composant NavLink mémorisé pour éviter les re-renders inutiles
const NavLink = memo(
  ({
    href,
    label,
    isActive,
    nowrap,
  }: {
    href: string
    label: string
    isActive: boolean
    nowrap?: boolean
  }) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
      <Link
        href={href}
        className={[
          'text-[13px] tracking-[0.05em] font-semibold lowercase transition-all duration-200',
          nowrap ? 'whitespace-nowrap' : '',
          isActive
            ? 'text-black/40'
            : isHovered
              ? 'font-bold'
              : 'text-black/70 hover:font-bold',
        ].join(' ')}
        style={
          isHovered && !isActive ? { color: 'hsl(271 74% 37%)' } : undefined
        }
        onMouseEnter={() => !isActive && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {label}
      </Link>
    )
  }
)

NavLink.displayName = 'NavLink'

// Composant MobileNavLink mémorisé
const MobileNavLink = memo(
  ({
    href,
    label,
    isActive,
    onClick,
  }: {
    href: string
    label: string
    isActive: boolean
    onClick: () => void
  }) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
      <Link
        href={href}
        onClick={onClick}
        className={[
          'block py-2.5 text-[15px] transition-all duration-200',
          isActive
            ? 'text-black/40 font-normal'
            : isHovered
              ? 'font-bold'
              : 'text-black font-normal hover:font-bold',
        ].join(' ')}
        style={
          isHovered && !isActive ? { color: 'hsl(271 74% 37%)' } : undefined
        }
        onMouseEnter={() => !isActive && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {label}
      </Link>
    )
  }
)

MobileNavLink.displayName = 'MobileNavLink'

export default function HeaderMinimal() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { totalItems } = useCartStore()
  const pathname = usePathname()

  // Optimisation du scroll listener avec useCallback
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 4)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  // Navigation items
  const nav = [
    { label: '.tops', href: '/products/hauts' },
    { label: '.bottoms', href: '/products/bas' },
    { label: '.accessories', href: '/products/accessoires' },
    { label: '.silhouettes', href: '/silhouettes' },
    { label: '.impact', href: '/impact' },
    { label: '.essence', href: '/about', nowrap: true },
    { label: '.contact', href: '/contact' },
  ]

  // Fonction pour déterminer si un lien est actif
  const isActive = useCallback(
    (href: string) => {
      if (!pathname) return false
      return (
        pathname === href ||
        pathname.startsWith(href + '/') ||
        pathname.startsWith(href + '?')
      )
    },
    [pathname]
  )

  const closeMenu = useCallback(() => setIsMenuOpen(false), [])
  const openMenu = useCallback(() => setIsMenuOpen(true), [])

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80',
          isScrolled
            ? 'border-b border-black/10'
            : 'border-b border-transparent',
          'transition-[border-color,background] duration-200',
        ].join(' ')}
      >
        <div className="max-w-[1920px] mx-auto h-[96px] lg:h-[108px] pl-6 pr-8 sm:pl-10 sm:pr-12 lg:pl-16 lg:pr-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-6 flex-1">
            <Link
              href="/"
              aria-label="Home .blancherenaudin"
              className="shrink-0"
            >
              {/* Solution 1: Image avec Next.js Image (recommandé) */}
              <Image
                src="/blancherenaudin-ajuste.svg"
                alt=".blancherenaudin"
                width={150}
                height={40}
                priority
                className="h-[calc(100%-16px)] w-auto max-h-[92px]"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {nav.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  isActive={isActive(item.href)}
                  nowrap={item.nowrap}
                />
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/search"
              className="hover:opacity-60 transition-opacity"
              aria-label="Search"
            >
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className="hidden lg:inline-block hover:opacity-60 transition-opacity"
            >
              <User
                className="w-[18px] h-[18px] text-black"
                strokeWidth={1.4}
              />
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative hover:opacity-60 transition-opacity"
            >
              <ShoppingBag
                className="w-[18px] h-[18px] text-black"
                strokeWidth={1.4}
              />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-medium w-4 h-4 rounded-full grid place-items-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={openMenu}
              className="lg:hidden text-black hover:opacity-60 transition-opacity"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.4} />
            </button>
          </div>
        </div>
      </header>

      <div aria-hidden className="h-[96px] lg:h-[108px]" />

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={[
          'fixed top-0 right-0 bottom-0 z-[70] w-full max-w-lg bg-white shadow-2xl lg:hidden overflow-y-auto',
          'transform transition-transform duration-300 ease-in-out',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-12 py-6">
          <span
            className="text-sm font-bold tracking-[0.15em]"
            style={{ color: 'hsl(271 74% 37%)' }}
          >
            .blancherenaudin
          </span>
          <button
            onClick={closeMenu}
            className="text-black hover:opacity-60 transition-opacity"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="px-8 pb-8 space-y-1">
          {nav.map((item) => (
            <MobileNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              isActive={isActive(item.href)}
              onClick={closeMenu}
            />
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-black/10">
          <div className="px-8 py-6 space-y-6">
            <div className="flex items-center gap-8">
              <Link
                href="/account"
                onClick={closeMenu}
                className="flex items-center gap-2 text-sm text-black hover:opacity-60 transition-opacity"
              >
                <User className="w-4 h-4" strokeWidth={1.5} />
                <span>Account</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
