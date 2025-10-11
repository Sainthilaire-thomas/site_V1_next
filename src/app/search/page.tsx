'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import ProductGridJacquemus from '@/components/products/ProductGridJacquemus'
import { SlidersHorizontal, Search, X } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { ProductWithRelations } from '@/lib/types'
import Link from 'next/link'

type Category = {
  id: string
  name: string
  slug: string
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [products, setProducts] = useState<ProductWithRelations[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [hasSearched, setHasSearched] = useState(!!initialQuery)

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [sortBy, setSortBy] = useState<string>('newest')
  const [inStockOnly, setInStockOnly] = useState(false)

  // Navigation rapide
  const quickLinks = [
    { label: '.tops', href: '/products/hauts' },
    { label: '.bottoms', href: '/products/bas' },
    { label: '.accessories', href: '/products/accessoires' },
    { label: '.silhouettes', href: '/silhouettes' },
    { label: '.impact', href: '/impact' },
  ]

  // Charger les catégories
  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabaseBrowser
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name')

      if (data) setCategories(data)
    }
    loadCategories()
  }, [])

  // Recherche de produits
  const searchProducts = useCallback(async () => {
    if (!searchQuery.trim()) {
      setProducts([])
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      let query = supabaseBrowser
        .from('products')
        .select(
          `
          *,
          images:product_images(*),
          category:categories(id, slug, name, parent_id)
        `
        )
        .eq('is_active', true)

      // Filtre de recherche textuelle
      if (searchQuery.trim()) {
        query = query.or(
          `name.ilike.%${searchQuery}%,short_description.ilike.%${searchQuery}%`
        )
      }

      // Filtre catégorie
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }

      // Filtre prix
      query = query.gte('price', priceRange[0]).lte('price', priceRange[1])

      // Filtre stock
      if (inStockOnly) {
        query = query.gt('stock_quantity', 0)
      }

      // Tri
      switch (sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true })
          break
        case 'price_desc':
          query = query.order('price', { ascending: false })
          break
        case 'name':
          query = query.order('name', { ascending: true })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error('Search error:', error)
        setProducts([])
      } else if (data) {
        setProducts(data as ProductWithRelations[])
      }
    } catch (err) {
      console.error('Search error:', err)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, selectedCategory, priceRange, sortBy, inStockOnly])

  // Rechercher au chargement si query présente
  useEffect(() => {
    if (initialQuery) {
      searchProducts()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Rechercher quand les filtres changent (SEULEMENT si on a déjà fait une recherche)
  useEffect(() => {
    if (hasSearched && searchQuery.trim()) {
      searchProducts()
    }
  }, [selectedCategory, priceRange, sortBy, inStockOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  // Soumettre la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`, {
        scroll: false,
      })
      searchProducts()
    }
  }

  // Clear search et retour à l'état initial
  const handleClearSearch = () => {
    setSearchQuery('')
    setProducts([])
    setHasSearched(false)
    resetFilters()
    router.push('/search', { scroll: false })
  }

  // Recherche suggérée
  const handleSuggestedSearch = (term: string) => {
    setSearchQuery(term)
    router.push(`/search?q=${encodeURIComponent(term)}`, { scroll: false })

    setTimeout(() => {
      const query = supabaseBrowser
        .from('products')
        .select(
          `
          *,
          images:product_images(*),
          category:categories(id, slug, name, parent_id)
        `
        )
        .eq('is_active', true)
        .or(`name.ilike.%${term}%,short_description.ilike.%${term}%`)
        .order('created_at', { ascending: false })

      setIsLoading(true)
      setHasSearched(true)

      query.then(({ data, error }) => {
        if (error) {
          console.error('Search error:', error)
          setProducts([])
        } else if (data) {
          setProducts(data as ProductWithRelations[])
        }
        setIsLoading(false)
      })
    }, 100)
  }

  // Reset des filtres
  const resetFilters = () => {
    setSelectedCategory('')
    setPriceRange([0, 1000])
    setSortBy('newest')
    setInStockOnly(false)
  }

  const hasActiveFilters =
    selectedCategory !== '' ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 1000 ||
    sortBy !== 'newest' ||
    inStockOnly

  return (
    <div className="min-h-screen bg-white">
      <HeaderMinimal />

      <main className="max-w-[1920px] mx-auto px-6 py-12 sm:px-10 lg:px-16">
        {/* Barre de recherche principale */}
        <div className="mb-16">
          <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
            <Search
              className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/30"
              strokeWidth={1.5}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search..."
              autoFocus
              className="w-full pl-5 pr-8 py-2 text-[14px] font-light lowercase tracking-tight outline-none ring-0 focus:outline-none focus:ring-0 bg-transparent border-b border-gray-300 focus:border-gray-500 transition-colors placeholder:text-black/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center hover:opacity-60 transition-opacity"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            )}
          </form>

          {/* Hint */}
          {searchQuery.trim() && !hasSearched && (
            <p className="text-[9px] text-black/25 mt-2 text-center tracking-wide">
              Appuyez sur Entrée pour rechercher
            </p>
          )}
        </div>

        {/* Contenu : Avant recherche OU Résultats */}
        {!hasSearched || !searchQuery.trim() ? (
          /* État initial - Quick access (style Jacquemus) */
          <div className="max-w-5xl mx-auto">
            <div>
              <h2 className="text-[11px] tracking-[0.1em] text-black/40 mb-6 text-center">
                .explore by category
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group aspect-[4/3] border border-black/10 hover:border-black transition-colors flex items-center justify-center relative overflow-hidden"
                  >
                    <span className="text-[15px] lowercase tracking-[0.05em] group-hover:scale-105 transition-transform relative z-10">
                      {link.label}
                    </span>
                    {/* Effet hover subtil */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Résultats de recherche */
          <>
            {/* En-tête résultats */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`border px-6 py-3 flex items-center gap-2 text-[13px] lowercase tracking-[0.05em] transition-colors ${
                      showFilters || hasActiveFilters
                        ? 'border-black bg-black text-white'
                        : 'border-black/10 hover:border-black'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
                    <span>filters</span>
                    {hasActiveFilters && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </button>

                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-[13px] lowercase tracking-[0.05em] hover:opacity-60 transition-opacity"
                    >
                      reset all
                    </button>
                  )}
                </div>

                <div className="text-[11px] uppercase tracking-[0.1em] text-black/40">
                  {isLoading ? 'loading...' : `${products.length} products`}
                </div>
              </div>
            </div>

            {/* Panneau de filtres */}
            {showFilters && (
              <div className="mb-12 border-t border-black/10 pt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Catégorie */}
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.1em] mb-4 text-black/60">
                    category
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`block w-full text-left text-[13px] lowercase py-1.5 transition-colors ${
                        selectedCategory === ''
                          ? 'text-black font-medium'
                          : 'text-black/40 hover:text-black'
                      }`}
                    >
                      all
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`block w-full text-left text-[13px] lowercase py-1.5 transition-colors ${
                          selectedCategory === cat.id
                            ? 'text-black font-medium'
                            : 'text-black/40 hover:text-black'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prix */}
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.1em] mb-4 text-black/60">
                    price
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) =>
                          setPriceRange([Number(e.target.value), priceRange[1]])
                        }
                        className="w-full border border-black/10 px-3 py-2 text-[13px] focus:outline-none focus:border-black"
                        placeholder="min"
                      />
                      <span className="text-black/40">—</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([priceRange[0], Number(e.target.value)])
                        }
                        className="w-full border border-black/10 px-3 py-2 text-[13px] focus:outline-none focus:border-black"
                        placeholder="max"
                      />
                    </div>
                  </div>
                </div>

                {/* Tri */}
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.1em] mb-4 text-black/60">
                    sort by
                  </h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-black/10 px-3 py-2 text-[13px] lowercase focus:outline-none focus:border-black bg-white"
                  >
                    <option value="newest">newest</option>
                    <option value="price_asc">price: low to high</option>
                    <option value="price_desc">price: high to low</option>
                    <option value="name">name: a-z</option>
                  </select>
                </div>

                {/* Disponibilité */}
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.1em] mb-4 text-black/60">
                    availability
                  </h3>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 border-black/20"
                    />
                    <span className="text-[13px] lowercase">in stock only</span>
                  </label>
                </div>
              </div>
            )}

            {/* Résultats */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="aspect-[3/4] bg-black/5 animate-pulse" />
                    <div className="h-3 bg-black/5 animate-pulse w-3/4" />
                    <div className="h-3 bg-black/5 animate-pulse w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <h2 className="text-[18px] font-light mb-2 lowercase">
                  no results found
                </h2>
                <p className="text-[13px] text-black/40 mb-6">
                  try adjusting your filters or search term
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="border border-black px-8 py-3 text-[13px] lowercase tracking-[0.05em] hover:bg-black hover:text-white transition-colors"
                  >
                    reset filters
                  </button>
                )}
              </div>
            ) : (
              <ProductGridJacquemus products={products} />
            )}
          </>
        )}
      </main>

      <FooterMinimal />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-[13px] lowercase tracking-[0.05em] text-black/40">
            loading...
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
