'use client'

import { useEffect, useState } from 'react'
import { ProductImage } from '@/components/products/ProductImage'

type ProductImageData = {
  id: string
  alt: string | null
  is_primary: boolean
  sort_order: number
  width: number | null
  height: number | null
  storage_original: string
  storage_master: string | null
}

type Props = {
  productId: string | null
}

export function MediaGridClient({ productId }: Props) {
  const [images, setImages] = useState<ProductImageData[]>([])
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function refresh() {
    if (!productId) {
      setImages([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`/api/products/${productId}/images`, {
        cache: 'no-store',
      })
      if (!r.ok) throw new Error(await r.text())
      const json = await r.json()
      setImages(json.images ?? [])
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors du chargement des images')
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  async function onUpload(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault()
    if (!productId) return
    if (!files || !files.length) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const fd = new FormData()
      Array.from(files).forEach((f) => fd.append('files', f))
      fd.append('productId', productId)

      const res = await fetch('/api/admin/product-images/upload', {
        method: 'POST',
        body: fd,
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Upload échoué (${res.status})`)
      }

      const data = await res.json()
      const successCount = data.results?.filter((r: any) => r.ok).length ?? 0

      setSuccess(`${successCount} image(s) importée(s) avec succès`)
      setFiles(null)

      // Reset input file
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement
      if (fileInput) fileInput.value = ''

      await refresh()
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de l'upload")
    } finally {
      setLoading(false)
    }
  }

  async function setPrimary(id: string) {
    if (!productId) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const r = await fetch(`/api/products/${productId}/images/set-primary`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ imageId: id }),
      })
      if (!r.ok) throw new Error(await r.text())
      setSuccess('Image principale définie')
      await refresh()
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors du changement de principale')
    } finally {
      setLoading(false)
    }
  }

  async function updateAlt(id: string, alt: string) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const r = await fetch(`/api/admin/product-images/${id}/alt`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ alt }),
      })
      if (!r.ok) {
        const text = await r.text()
        throw new Error(text || `Erreur ${r.status}`)
      }
      setSuccess('Texte alternatif mis à jour')
      await refresh()
    } catch (e: any) {
      console.error('Erreur updateAlt:', e)
      setError(e?.message ?? "Erreur lors de la mise à jour de l'alt")
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cette image ?')) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const r = await fetch(`/api/admin/product-images/${id}`, {
        method: 'DELETE',
      })
      if (!r.ok) throw new Error(await r.text())
      setSuccess('Image supprimée')
      await refresh()
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  async function saveOrder(next: ProductImageData[]) {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`/api/admin/product-images/reorder`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          orders: next.map((img, i) => ({ id: img.id, sort_order: i })),
        }),
      })
      if (!r.ok) throw new Error(await r.text())
      await refresh()
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de l'enregistrement de l'ordre")
    } finally {
      setLoading(false)
    }
  }

  function move(index: number, dir: -1 | 1) {
    const copy = [...images]
    const j = index + dir
    if (j < 0 || j >= copy.length) return
    ;[copy[index], copy[j]] = [copy[j], copy[index]]
    setImages(copy)
    void saveOrder(copy)
  }

  // Auto-hide success after 3s
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded">
          ✓ {success}
        </div>
      )}

      {/* Upload */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
        <h3 className="font-medium mb-3">Importer des images</h3>

        <div className="space-y-3">
          {/* Input file stylisé */}
          <label className="block">
            <span className="sr-only">Choisir des fichiers</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFiles(e.target.files)}
              disabled={!productId || loading}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:me-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-violet/10 file:text-violet
                hover:file:bg-violet/20
                file:disabled:opacity-50 file:disabled:cursor-not-allowed
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </label>

          {/* Info sur les fichiers sélectionnés */}
          {files && files.length > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              📎 {files.length} fichier{files.length > 1 ? 's' : ''} sélectionné
              {files.length > 1 ? 's' : ''}
            </div>
          )}

          {/* Bouton d'import */}
          <button
            type="button"
            onClick={onUpload}
            disabled={!productId || !files || loading}
            className="w-full px-4 py-2 rounded font-medium
              bg-violet text-white
              hover:bg-violet/90
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            {loading ? 'Import en cours...' : 'Importer les images'}
          </button>

          {/* Message si pas de produit sélectionné */}
          {!productId && (
            <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded">
              ⚠️ Sélectionnez un produit pour pouvoir importer des images
            </div>
          )}
        </div>
      </div>

      {/* Liste des images */}
      {loading && !error ? (
        <div className="text-center py-8 text-gray-500">Chargement…</div>
      ) : !productId ? (
        <div className="text-center py-8 text-gray-500">
          Aucun produit sélectionné
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucune image pour ce produit. Importez-en une ci-dessus.
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <li
              key={img.id}
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-3 bg-white dark:bg-gray-800"
            >
              {/* En-tête */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>#{i + 1}</span>
                {img.is_primary && (
                  <span className="px-2 py-0.5 bg-violet/10 text-violet rounded font-medium">
                    ★ Principale
                  </span>
                )}
              </div>

              {/* ✅ Image avec composant ProductImage */}
              {productId && (
                <ProductImage
                  productId={productId}
                  imageId={img.id}
                  alt={img.alt || ''}
                  size="md"
                  className="w-full h-48 object-cover rounded"
                />
              )}

              {/* Dimensions */}
              {img.width && img.height && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {img.width} × {img.height}px
                </div>
              )}

              {/* Alt text */}
              <input
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-violet focus:border-transparent"
                placeholder="Texte alternatif"
                defaultValue={img.alt ?? ''}
                onBlur={(e) => {
                  if (e.target.value !== img.alt) {
                    updateAlt(img.id, e.target.value)
                  }
                }}
              />

              {/* Actions */}
              <div className="space-y-2">
                {/* Réordonnancement */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0 || loading}
                    className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1 || loading}
                    className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ↓
                  </button>
                </div>

                {/* Définir principale */}
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(img.id)}
                    disabled={loading}
                    className="w-full px-3 py-1.5 border border-violet text-violet rounded text-sm hover:bg-violet hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Définir principale
                  </button>
                )}

                {/* Supprimer */}
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  disabled={loading}
                  className="w-full px-3 py-1.5 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded text-sm hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
