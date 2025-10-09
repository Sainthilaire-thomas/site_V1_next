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
import { getSortedImages } from '@/lib/types'

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

function isColorKey(name?: string) {
  const n = (name || '').trim().toLowerCase()
  return ['color', 'couleur', 'colorway', 'couleurs'].includes(n)
}

function isSizeKey(name?: string) {
  const n = (name || '').trim().toLowerCase()
  return ['size', 'taille', 'sizes', 'tailles'].includes(n)
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
  out.sizes = uniq(sizes.map((r) => String(r.value)))

  colors.forEach((r) =>
    out.modByColor.set(String(r.value), r.price_modifier ?? 0)
  )
  sizes.forEach((r) =>
    out.modBySize.set(String(r.value), r.price_modifier ?? 0)
  )

  // Regroupement par SKU
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

  // Fallback si aucun SKU croisé
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

// ✅ Pattern de disposition des images : 1, 2, 1, 2, 1...
function getLayoutPattern(images: any[]) {
  const rows = []
  let index = 0

  while (index < images.length) {
    // Première ligne = 1 photo, puis alternance 2, 1, 2, 1...
    if (rows.length % 2 === 0) {
      // Ligne avec 1 photo
      rows.push([images[index]])
      index++
    } else {
      // Ligne avec 2 photos
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')

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
      return toast.error('Choisissez une couleur')
    if (sizes.length > 0 && !selectedSize)
      return toast.error('Choisissez une taille')
    if (!inStock) return toast.error('Produit non disponible')

    addItem({
      id: `${product.id}${selectedColor ? `:${selectedColor}` : ''}${selectedSize ? `:${selectedSize}` : ''}`,
      name:
        product.name +
        [
          selectedColor ? ` — ${selectedColor}` : '',
          selectedSize ? ` / ${selectedSize}` : '',
        ].join(''),
      price: displayPrice,
      image: '/placeholder.jpg',
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    })

    toast.success(`${product.name} ajouté au panier`)
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

  // ✅ Organisation des images selon le pattern
  const imageRows = getLayoutPattern(sortedImages)

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] text-gray-400 mb-6">
        <Link href="/" className="hover:text-gray-900">
          Accueil
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-gray-900">
          Produits
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_500px] gap-8 lg:gap-20">
        {/* ✅ GALERIE - Photos collées */}
        <div>
          {sortedImages.length > 0 ? (
            <div className="space-y-0">
              {imageRows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`grid gap-0 ${row.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
                >
                  {row.map((image, colIndex) => {
                    // Calculer l'index global
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
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          priority={globalIndex === 0}
                        />

                        {/* Badge stock sur première image */}
                        {globalIndex === 0 && inStock && (
                          <Badge className="absolute top-2 left-2 bg-white/95 text-black text-[10px] font-normal border-0 px-2 py-0.5">
                            <Check className="w-2.5 h-2.5 mr-1" />
                            En stock
                          </Badge>
                        )}

                        {/* Overlay hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Pas d'image</span>
            </div>
          )}
        </div>

        {/* Colonne droite - Infos produit */}
        <div className="space-y-6 lg:pt-2 lg:sticky lg:top-4">
          {product.category?.name && (
            <span className="text-[10px] tracking-[0.15em] text-gray-400 uppercase block">
              {product.category.name}
            </span>
          )}

          <h1 className="text-2xl font-light text-gray-900 leading-tight -mt-3">
            {product.name}
          </h1>

          {product.short_description && (
            <p className="text-[13px] text-gray-600 leading-relaxed -mt-2">
              {product.short_description}
            </p>
          )}

          {/* Couleurs */}
          {colors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-light text-gray-900">
                  {selectedColor || 'Couleur'}
                </span>
              </div>
              <div className="flex gap-1.5">
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

          {/* Tailles */}
          {sizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-light text-gray-900">
                  Taille
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((size) => {
                  const selected = selectedSize === size
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-1.5 text-[13px] border transition ${
                        selected
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Bouton panier */}
          <div className="space-y-0">
            <Button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-900 h-12 text-[12px] font-normal tracking-[0.08em] uppercase transition disabled:opacity-40 disabled:cursor-not-allowed rounded-none"
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-2" />
              {inStock ? `Ajouter au panier` : 'Produit épuisé'}
              <span className="ml-auto font-normal">{displayPrice} EUR</span>
            </Button>
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed underline cursor-pointer hover:text-gray-900 text-center">
            Voir la disponibilité et prendre un rendez-vous en boutique
          </p>

          {/* Détails produit - Version condensée */}
          <div className="pt-6 space-y-6 text-[12px] border-t border-gray-200">
            {/* Composition */}
            {product.composition && (
              <div className="space-y-2">
                <h3 className="text-[13px] font-light text-gray-900 uppercase tracking-wider">
                  Composition
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.composition}
                </p>
              </div>
            )}

            {/* Entretien */}
            {product.care && (
              <div className="space-y-2">
                <h3 className="text-[13px] font-light text-gray-900 uppercase tracking-wider">
                  Entretien
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.care}
                </p>
              </div>
            )}

            {/* Impact */}
            {product.impact && (
              <div className="space-y-2">
                <h3 className="text-[13px] font-light text-gray-900 uppercase tracking-wider">
                  Impact
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.impact}
                </p>
              </div>
            )}

            {/* Artisanat */}
            {product.craftsmanship && (
              <div className="space-y-2">
                <h3 className="text-[13px] font-light text-gray-900 uppercase tracking-wider">
                  Artisanat
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.craftsmanship}
                </p>
              </div>
            )}

            {/* Référence produit */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Référence</span>
                <span className="text-gray-900 font-mono">
                  BR-{String(product.id).slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox reste en bas de page */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Bouton fermer */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation précédent */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigateLightbox('prev')
            }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          {/* Image */}
          <div
            className="max-w-5xl max-h-[90vh] mx-auto px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <ProductImage
              productId={product.id}
              imageId={sortedImages[lightboxIndex].id}
              alt={sortedImages[lightboxIndex].alt || product.name}
              size="xl"
              className="max-w-full max-h-[85vh] object-contain"
            />

            {/* Compteur */}
            <div className="text-center text-white mt-4 text-sm">
              {lightboxIndex + 1} / {sortedImages.length}
            </div>
          </div>

          {/* Navigation suivant */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigateLightbox('next')
            }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronRight className="w-12 h-12" />
          </button>
        </div>
      )}
    </div>
  )
}
