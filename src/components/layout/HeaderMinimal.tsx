// src/components/layout/HeaderMinimal.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function HeaderMinimal() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { totalItems } = useCartStore()
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Bloquer le scroll quand le menu est ouvert
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

  const nav = [
    { label: 'hauts', href: '/hauts' },
    { label: 'bas', href: '/bas' },
    { label: 'accessoires', href: '/accessoires' },
    { label: 'lookbooks', href: '/lookbooks' },
    { label: 'sustainability', href: '/sustainability' },
    { label: 'à propos', href: '/about', nowrap: true },
    { label: 'contact', href: '/contact' },
  ]

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
        {/* Conteneur principal */}
        <div className="max-w-[1920px] mx-auto h-[108px] pl-6 pr-8 sm:pl-10 sm:pr-12 lg:pl-16 lg:pr-20 flex items-center justify-between gap-8">
          {/* GAUCHE : logo + nav rapprochée */}
          <div className="flex items-center gap-6 flex-1">
            <Link
              href="/"
              aria-label="Accueil .blancherenaudin"
              className="shrink-0"
            >
              <Image
                src="/logo-blancherenaudin3.png"
                alt=".blancherenaudin"
                width={150}
                height={40}
                priority
                className="h-10 w-auto"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'text-[13px] tracking-[0.05em] font-semibold lowercase text-black/70 hover:text-black transition-colors',
                    item.nowrap ? 'whitespace-nowrap' : '',
                    pathname === item.href ? 'text-black' : '',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* DROITE : icônes avec espacement comme Jacquemus */}
          <div className="flex items-center gap-6">
            <Link
              href="/search"
              aria-label="Rechercher"
              className="hidden lg:inline-block hover:opacity-60 transition-opacity"
            >
              <Search
                className="w-[18px] h-[18px] text-black"
                strokeWidth={1.4}
              />
            </Link>
            <Link
              href="/account"
              aria-label="Compte"
              className="hidden lg:inline-block hover:opacity-60 transition-opacity"
            >
              <User
                className="w-[18px] h-[18px] text-black"
                strokeWidth={1.4}
              />
            </Link>
            <Link
              href="/cart"
              aria-label="Panier"
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
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden text-black hover:opacity-60 transition-opacity"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.4} />
            </button>
          </div>
        </div>
      </header>

      {/* Spacer égal à la hauteur du header */}
      <div aria-hidden className="h-[108px]" />

      {/* Menu mobile overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Menu mobile drawer */}
      <div
        className={[
          'fixed top-0 right-0 bottom-0 z-[70] w-full max-w-lg bg-white shadow-2xl lg:hidden overflow-y-auto',
          'transform transition-transform duration-300 ease-in-out',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Header du menu avec logo */}
        <div className="flex items-center justify-between px-12 py-6 ">
          <span className="text-sm font-bold tracking-[0.15em] uppercase text-black">
            .BLANCHERENAUDIN
          </span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-black hover:opacity-60 transition-opacity"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="px-8 pb-8">
          <div className="flex items-center gap-3 border border-black/20 px-4 py-3">
            <Search
              className="w-4 h-4 text-black/40 shrink-0"
              strokeWidth={1.5}
            />
            <input
              type="text"
              placeholder="Votre recherche..."
              className="flex-1 text-sm focus:outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Navigation principale */}
        <nav className="px-8 pb-8 space-y-1">
          <Link
            href="/hauts"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2.5 text-[15px] font-normal text-black hover:opacity-60 transition-opacity"
          >
            Hauts
          </Link>
          <Link
            href="/bas"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2.5 text-[15px] font-normal text-black hover:opacity-60 transition-opacity"
          >
            Bas
          </Link>
          <Link
            href="/accessoires"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2.5 text-[15px] font-normal text-black hover:opacity-60 transition-opacity"
          >
            Accessoires
          </Link>
          <Link
            href="/lookbooks"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2.5 text-[15px] font-normal text-black hover:opacity-60 transition-opacity"
          >
            Lookbooks
          </Link>
          <Link
            href="/sustainability"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2.5 text-[15px] font-normal text-black hover:opacity-60 transition-opacity"
          >
            Sustainability
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2.5 text-[15px] font-normal text-black hover:opacity-60 transition-opacity"
          >
            À propos
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2.5 text-[15px] font-normal text-black hover:opacity-60 transition-opacity"
          >
            Contact
          </Link>
        </nav>

        {/* Footer fixe */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-black/10">
          <div className="px-8 py-6 space-y-6">
            <div className="flex items-center gap-8">
              <Link
                href="/account"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-black hover:opacity-60 transition-opacity"
              >
                <User className="w-4 h-4" strokeWidth={1.5} />
                <span>Compte</span>
              </Link>
              <Link
                href="/cart"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-black hover:opacity-60 transition-opacity"
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                <span>Panier</span>
              </Link>
            </div>

            <div className="text-xs text-black/60 leading-relaxed">
              <p className="mb-1 font-medium text-black">Service client</p>
              <p>Du lundi au vendredi</p>
              <p>9h - 18h (GMT+1)</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
