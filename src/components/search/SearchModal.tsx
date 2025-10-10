// src/components/search/SearchModal.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

type SearchModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isNavigating, setIsNavigating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Navigation rapide
  const quickLinks = [
    { label: '.tops', href: '/products/hauts' },
    { label: '.bottoms', href: '/products/bas' },
    { label: '.accessories', href: '/products/accessoires' },
    { label: '.silhouettes', href: '/silhouettes' },
    { label: '.impact', href: '/impact' },
  ]

  // Focus automatique sur l'input quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Gestion de la recherche - soumettre avec Enter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      onClose()
    }
  }

  // Gestion de la touche ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Gérer les quick links
  const handleQuickLinkClick = (href: string) => {
    router.push(href)
    onClose()
  }

  // Recherche suggérée
  const handleSuggestedSearch = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] pointer-events-none">
        <div className="h-full w-full flex flex-col pointer-events-auto">
          {/* Header - Barre de recherche */}
          <div className="bg-white border-b border-black/10 animate-in slide-in-from-top duration-300">
            <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-16 py-6">
              <form onSubmit={handleSearch} className="flex items-center gap-4">
                {/* Input de recherche */}
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40"
                    strokeWidth={1.5}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="search..."
                    className="w-full pl-8 pr-4 text-[24px] sm:text-[32px] font-light lowercase tracking-tight focus:outline-none bg-transparent placeholder:text-black/20"
                  />
                </div>

                {/* Bouton fermer */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center hover:opacity-60 transition-opacity"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </form>

              {/* Hint pour Enter */}
              {searchQuery.trim() && (
                <p className="text-[11px] text-black/40 mt-3 pl-8">
                  Appuyez sur Entrée pour rechercher "{searchQuery}"
                </p>
              )}
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 bg-white overflow-y-auto">
            <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
              {/* Quick access */}
              <div>
                <h2 className="text-[11px] uppercase tracking-[0.1em] text-black/40 mb-6">
                  quick access
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {quickLinks.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => handleQuickLinkClick(link.href)}
                      className="group aspect-square border border-black/10 hover:border-black transition-colors flex items-center justify-center"
                    >
                      <span className="text-[15px] lowercase tracking-[0.05em] group-hover:scale-105 transition-transform">
                        {link.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Suggestions populaires */}
                <div className="mt-12">
                  <h2 className="text-[11px] uppercase tracking-[0.1em] text-black/40 mb-4">
                    popular searches
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {['bag', 'dress', 'shirt', 'shoes', 'hat'].map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSuggestedSearch(term)}
                        className="px-4 py-2 border border-black/10 hover:border-black text-[13px] lowercase tracking-[0.05em] transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
