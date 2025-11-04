'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/useCartStore'
import { ShoppingBag, Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { ProductImage } from '@/components/products/ProductImage'
import type { ProductWithRelations, ProductVariant } from '@/lib/types'
import { getSortedImages, getPrimaryImage } from '@/lib/types'
import { getProductImageUrl } from '@/lib/image-helpers'

const toHex = (c?: string) => {
  const map: Record<string, string> = {
    blanc: '#ffffff',
    white: '#ffffff',
    'off-white': '#faf9f6',
    noir: '#000000',
    black: '#000000',
    marine: '#0c1e3d',
    'dark navy': '#0c1e3d',
    bleu: '#1e3a8a',
  }
  const k = (c || '').trim().toLowerCase()
  return map[k] || (/#|rgb|hsl/.test(k) ? k : '#d1d5db')
}

const isLight = (hex: string) => {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16) || 0
  const g = parseInt(h.slice(2, 4), 16) || 0
  const b = parseInt(h.slice(4, 6), 16) || 0
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 190
}

const translateCategory = (category?: string) => {
  const translations: Record<string, string> = {
    BAS: 'bottoms',
    HAUT: 'tops',
    HAUTS: 'tops',
    ACCESSOIRES: 'accessories',
    CHAUSSURES: 'shoes',
    ROBES: 'dresses',
    MANTEAUX: 'coats',
    VESTES: 'jackets',
    JUPES: 'skirts',
    JUPE: 'skirts',
  }

  if (!category) return category
  const upper = category.toUpperCase()
  return translations[upper] || category.toLowerCase()
}

function isColorKey(name?: string) {
  const n = (name || '').trim().toLowerCase()
  return ['color', 'couleur', 'colorway', 'couleurs'].includes(n)
}

function isSizeKey(name?: string) {
  const n = (name || '').trim().toLowerCase()
  return ['size', 'taille', 'sizes', 'tailles'].includes(n)
}

// ✅ NOUVEAU : Ordre constant des tailles
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const indexA = SIZE_ORDER.indexOf(a.toUpperCase())
    const indexB = SIZE_ORDER.indexOf(b.toUpperCase())
    
    // Si les deux sont dans SIZE_ORDER, utiliser cet ordre
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }
    
    // Si seulement a est dans SIZE_ORDER, il vient en premier
    if (indexA !== -1) return -1
    
    // Si seulement b est dans SIZE_ORDER, il vient en premier
    if (indexB !== -1) return 1
    
    // Sinon, ordre alphabétique
    return a.localeCompare(b)
  })
}

function parseVariants(rows: ProductVariant[] | null | undefined) {
  const out = {
    colors: [] as string[],
    sizes: [] as string[],
    stockByCombo: new Map<string, number>(),
    modByColor: new Map<string, number>(),
    modBySize: new Map<string, number>(),
  }
  if (!rows?.length) return out

  const colors = rows.filter((r) => isColorKey(r.name) && r.is_active !== false)
  const sizes = rows.filter((r) => isSizeKey(r.name) && r.is_active !== false)

  const uniq = <T,>(arr: T[]) => Array.from(new Set(arr))
  out.colors = uniq(colors.map((r) => String(r.value)))
  
  // ✅ MODIFICATION : Trier les tailles avec l'ordre constant
  const rawSizes = uniq(sizes.map((r) => String(r.value)))
  out.sizes = sortSizes(rawSizes)

  colors.forEach((r) =>
    out.modByColor.set(String(r.value), r.price_modifier ?? 0)
  )
  sizes.forEach((r) =>
    out.modBySize.set(String(r.value), r.price_modifier ?? 0)
  )

  const skuGroups = new Map<
    string,
    { color?: string; size?: string; stock: number }
  >()
  rows.forEach((r) => {
    if (!r.sku) return
    if (!skuGroups.has(r.sku)) skuGroups.set(r.sku, { stock: 0 })
    const g = skuGroups.get(r.sku)!
    if (isColorKey(r.name)) g.color = String(r.value)
    if (isSizeKey(r.name)) g.size = String(r.value)
    if (typeof r.stock_quantity === 'number')
      g.stock = Math.max(g.stock, r.stock_quantity)
  })
  skuGroups.forEach((g) => {
    if (!out.colors.length && g.size) {
      out.stockByCombo.set(`${g.size}`, g.stock)
    } else if (g.color && g.size) {
      out.stockByCombo.set(`${g.color}|${g.size}`, g.stock)
    }
  })

  if (out.stockByCombo.size === 0) {
    if (!out.colors.length) {
      sizes.forEach((s) => {
        out.stockByCombo.set(
          `${String(s.value)}`,
          Math.max(0, s.stock_quantity ?? 0)
        )
      })
    } else {
      colors.forEach((c) => {
        sizes.forEach((s) => {
          const stock = Math.min(
            Math.max(0, c.stock_quantity ?? 0),
            Math.max(0, s.stock_quantity ?? 0)
          )
          out.stockByCombo.set(`${String(c.value)}|${String(s.value)}`, stock)
        })
      })
    }
  }

  return out
}

function getLayoutPattern(images: any[]) {
  const rows = []
  let index = 0

  while (index < images.length) {
    if (rows.length % 2 === 0) {
      rows.push([images[index]])
      index++
    } else {
      const pair = [images[index]]
      if (index + 1 < images.length) {
        pair.push(images[index + 1])
      }
      rows.push(pair)
      index += pair.length
    }
  }

  return rows
}

export default function ProductDetailClient({
  product,
}: {
  product: ProductWithRelations
}) {
  const { addItem } = useCartStore()
  const sortedImages = getSortedImages(product)
  const primaryImage = getPrimaryImage(product)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [showNotifyModal, setShowNotifyModal] = useState(false)

  const { colors, sizes, stockByCombo, modByColor, modBySize } = useMemo(
    () => parseVariants(product.variants),
    [product.variants]
  )

  if (colors.length === 1 && !selectedColor) setSelectedColor(colors[0])
  if (sizes.length === 1 && !selectedSize) setSelectedSize(sizes[0])

  const currentVariantStock = useMemo(() => {
    if (colors.length === 0 && selectedSize) {
      return stockByCombo.get(`${selectedSize}`) ?? 0
    }
    if (!selectedColor || !selectedSize) return 0
    return stockByCombo.get(`${selectedColor}|${selectedSize}`) ?? 0
  }, [colors.length, selectedColor, selectedSize, stockByCombo])

  const productStock = Math.max(0, product.stock_quantity ?? 0)
  const maxStock = Math.max(currentVariantStock, productStock)
  const inStock = maxStock > 0

  const basePrice = product.sale_price ?? product.price ?? 0
  const priceDelta =
    (modByColor.get(selectedColor) ?? 0) + (modBySize.get(selectedSize) ?? 0)
  const displayPrice = basePrice + priceDelta

  const canAddToCart =
    inStock &&
    (colors.length === 0 || !!selectedColor) &&
    (sizes.length === 0 || !!selectedSize)

  const handleAddToCart = () => {
    if (colors.length > 0 && !selectedColor)
      return toast.error('Please select a color')
    if (sizes.length > 0 && !selectedSize)
      return toast.error('Please select a size')
    if (!inStock) return toast.error('Product unavailable')

    // Récupérer l'URL de l'image principale
    let imageUrl = '/placeholder.jpg'
    if (primaryImage) {
      imageUrl = getProductImageUrl(primaryImage.id, 'sm')
    }

    addItem({
      id: `${product.id}${selectedColor ? `:${selectedColor}` : ''}${selectedSize ? `:${selectedSize}` : ''}`,
      name:
        product.name +
        (selectedColor || selectedSize ? ' - ' : '') +
        [selectedColor, selectedSize].filter(Boolean).join(' / '),
      price: displayPrice,
      productId: product.id,
      imageId: primaryImage?.id,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    })
    toast.success('Added to cart')
  }

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (lightboxIndex === null) return
    if (direction === 'prev') {
      setLightboxIndex(
        lightboxIndex > 0 ? lightboxIndex - 1 : sortedImages.length - 1
      )
    } else {
      setLightboxIndex(
        lightboxIndex < sortedImages.length - 1 ? lightboxIndex + 1 : 0
      )
    }
  }

  const imageRows = getLayoutPattern(sortedImages)

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] text-gray-400 mb-6">
        <Link href="/" className="hover:text-gray-900">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-gray-900">
          Products
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_500px] gap-8 lg:gap-20">
        {/* Gallery */}
        <div>
          {sortedImages.length > 0 ? (
            <div className="space-y-0">
              {imageRows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`grid gap-0 ${row.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
                >
                  {row.map((image, colIndex) => {
                    let globalIndex = 0
                    for (let i = 0; i < rowIndex; i++) {
                      globalIndex += imageRows[i].length
                    }
                    globalIndex += colIndex

                    return (
                      <button
                        key={image.id}
                        onClick={() => openLightbox(globalIndex)}
                        className="relative aspect-[3/4] bg-gray-100 overflow-hidden group cursor-zoom-in"
                      >
                        <ProductImage
                          productId={product.id}
                          imageId={image.id}
                          alt={image.alt || product.name}
                          size="xl"
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          priority={globalIndex === 0}
                        />

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-200" />
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </div>

        {/* Right column - Product info */}
        <div className="space-y-6 lg:pt-2 lg:sticky lg:top-4">
          <div className="text-right">
            <h1
              style={{ fontFamily: 'var(--font-archivo-black)' }}
              className="text-2xl text-gray-900 leading-tight lowercase"
            >
              {product.name}
            </h1>
          </div>

          {/* Colors */}
          {colors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-end">
                <span className="text-[13px] font-light text-gray-900">
                  {selectedColor || 'Color'}
                </span>
              </div>
              <div className="flex gap-1.5 justify-end">
                {colors.map((color) => {
                  const selected = selectedColor === color
                  const hex = toHex(color)
                  const light = isLight(hex)
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-full border transition ${
                        selected
                          ? 'border-gray-900 ring-1 ring-offset-1 ring-gray-900'
                          : light
                            ? 'border-gray-300 hover:border-gray-400'
                            : 'border-gray-300 hover:border-gray-900'
                      }`}
                      style={{ backgroundColor: hex }}
                      title={color}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3 justify-end">
                {sizes.map((size) => {
                  const selected = selectedSize === size
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`text-[13px] transition-all ${
                        selected
                          ? 'text-purple-600 font-semibold underline underline-offset-4'
                          : 'text-gray-400 hover:text-purple-600 hover:font-semibold'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Add to cart button */}
          <div className="space-y-0">
            <Button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-900 h-12 text-[12px] font-normal tracking-[0.08em] uppercase transition disabled:opacity-40 disabled:cursor-not-allowed rounded-none"
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-2" />
              {inStock ? `Add to cart` : 'Sold out'}
              <span className="ml-auto font-normal">{displayPrice} EUR</span>
            </Button>
          </div>

          {/* ✅ MODIFICATION : "Notify me when available" */}
          <p 
            onClick={() => setShowNotifyModal(true)}
            className="text-[11px] text-gray-400 leading-relaxed underline cursor-pointer hover:text-gray-900 text-right"
          >
            Notify me when available
          </p>

          {/* ✅ MODIFICATION : Texte centré à gauche avec max-w-2xl */}
          <div className="pt-6 space-y-6 text-[12px] border-t border-gray-200 max-w-2xl">
            {/* ✅ MODIFICATION : Ordre réorganisé - Impact en premier */}
            
            {/* Impact - PREMIER */}
            {product.impact && (
              <div className="space-y-2">
                <h3 className="font-brand text-[13px] text-gray-900 lowercase tracking-wider">
                  .impact
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.impact}
                </p>
              </div>
            )}

            {/* Artisanat - DEUXIÈME */}
            {product.craftsmanship && (
              <div className="space-y-2">
                <h3 className="font-brand text-[13px] text-gray-900 lowercase tracking-wider">
                  .artisanat
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.craftsmanship}
                </p>
              </div>
            )}

            {/* Composition - TROISIÈME */}
            {product.composition && (
              <div className="space-y-2">
                <h3 className="font-brand text-[13px] text-gray-900 lowercase tracking-wider">
                  .composition
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.composition}
                </p>
              </div>
            )}

            {/* Care - QUATRIÈME */}
            {product.care && (
              <div className="space-y-2">
                <h3 className="font-brand text-[13px] text-gray-900 lowercase tracking-wider">
                  .care
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.care}
                </p>
              </div>
            )}

            {/* ✅ SUPPRIMÉ : Product reference section complètement retirée */}
          </div>
        </div>
      </div>

      {/* Lightbox - ✅ MODIFICATION : Transitions plus rapides (duration-200) */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center transition-opacity duration-200"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200 z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              navigateLightbox('prev')
            }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors duration-200 z-10"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          <div
            className="max-w-5xl max-h-[90vh] mx-auto px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <ProductImage
              productId={product.id}
              imageId={sortedImages[lightboxIndex].id}
              alt={sortedImages[lightboxIndex].alt || product.name}
              size="xl"
              className="max-w-full max-h-[85vh] object-contain transition-opacity duration-200"
            />

            <div className="text-center text-white mt-4 text-sm">
              {lightboxIndex + 1} / {sortedImages.length}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              navigateLightbox('next')
            }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors duration-200 z-10"
          >
            <ChevronRight className="w-12 h-12" />
          </button>
        </div>
      )}

      {/* ✅ NOUVEAU : Modal "Notify me" (simple version) */}
      {showNotifyModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => setShowNotifyModal(false)}
        >
          <div
            className="bg-white p-8 max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-brand text-lg mb-4 lowercase">notify me when available</h3>
            <p className="text-sm text-gray-600 mb-6">
              Enter your email to be notified when this product is back in stock.
            </p>
            <input
              type="email"
              placeholder="your email"
              className="w-full border border-gray-300 px-4 py-2 mb-4 text-sm lowercase"
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  toast.success('You will be notified!')
                  setShowNotifyModal(false)
                }}
                className="flex-1 bg-black text-white py-2 text-sm lowercase hover:bg-gray-800 transition"
              >
                notify me
              </button>
              <button
                onClick={() => setShowNotifyModal(false)}
                className="flex-1 border border-gray-300 py-2 text-sm lowercase hover:bg-gray-50 transition"
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
