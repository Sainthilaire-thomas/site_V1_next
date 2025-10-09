'use client'

import { useEffect, useState } from 'react'
import { AdminProductImage } from '@/components/admin/AdminProductImage'
import { ImageEditorModal } from '@/components/admin/ImageEditorModal'
import { GripVertical } from 'lucide-react'

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
  const [editingImage, setEditingImage] = useState<{
    id: string
    url: string
  } | null>(null)
  const [loadingEditor, setLoadingEditor] = useState(false)

  // ✅ États pour le drag & drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // ✅ Clé pour forcer le re-render des images après édition
  const [imageRefreshKey, setImageRefreshKey] = useState(0)

  async function refresh() {
    if (!productId) {
      setImages([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`/api/admin/products/${productId}/images`, {
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
      const r = await fetch(
        `/api/admin/products/${productId}/images/set-primary`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ imageId: id }),
        }
      )
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

  async function saveOrder(newImages: ProductImageData[]) {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`/api/admin/product-images/reorder`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          orders: newImages.map((img, i) => ({ id: img.id, sort_order: i })),
        }),
      })
      if (!r.ok) throw new Error(await r.text())
      setSuccess('Ordre enregistré')
      await refresh()
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de l'enregistrement de l'ordre")
      // Rollback en cas d'erreur
      await refresh()
    } finally {
      setLoading(false)
    }
  }

  async function openEditor(imageId: string) {
    setLoadingEditor(true)
    try {
      // ✅ Ajouter un timestamp pour éviter le cache
      const cacheBuster = Date.now()
      const res = await fetch(
        `/api/admin/product-images/${imageId}/signed-url?variant=original&format=jpg&mode=json&t=${cacheBuster}`,
        { cache: 'no-store' }
      )

      if (!res.ok) {
        throw new Error("Impossible de récupérer l'image")
      }

      const data = await res.json()

      if (!data.signedUrl) {
        throw new Error('URL signée manquante')
      }

      setEditingImage({
        id: imageId,
        url: data.signedUrl,
      })
    } catch (err: any) {
      console.error("Erreur lors de l'ouverture de l'éditeur:", err)
      setError(err.message || "Erreur lors de l'ouverture de l'éditeur")
    } finally {
      setLoadingEditor(false)
    }
  }

  // ✅ DRAG & DROP HANDLERS - Version fonctionnelle
  const handleDragStart = (
    e: React.DragEvent<HTMLLIElement>,
    index: number
  ) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML)
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (draggedIndex === null || draggedIndex === index) return

    setDragOverIndex(index)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault()
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    // Réorganiser le tableau
    const newImages = [...images]
    const [draggedImage] = newImages.splice(draggedIndex, 1)
    newImages.splice(dropIndex, 0, draggedImage)

    // Mise à jour optimiste de l'UI
    setImages(newImages)

    // Sauvegarde en base
    saveOrder(newImages)

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault()
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Auto-hide success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // ✅ Pattern de disposition : 1, 2, 1, 2, 1...
  const getLayoutPattern = () => {
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

  const imageRows = getLayoutPattern()

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

          {files && files.length > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              📎 {files.length} fichier{files.length > 1 ? 's' : ''} sélectionné
              {files.length > 1 ? 's' : ''}
            </div>
          )}

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

          {!productId && (
            <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded">
              ⚠️ Sélectionnez un produit pour pouvoir importer des images
            </div>
          )}
        </div>
      </div>

      {/* ✅ Preview de la disposition - Version compacte */}
      {images.length > 0 && (
        <div className="border border-blue-300 dark:border-blue-600 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                📐 Aperçu de la disposition
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Pattern : 1 photo → 2 photos → 1 photo (glissez les cartes
                ci-dessous pour réorganiser)
              </p>
            </div>
          </div>
          <div className="space-y-0 border border-gray-300 dark:border-gray-600 overflow-hidden rounded max-w-md">
            {imageRows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`grid gap-0 ${row.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}
              >
                {row.map((img) => {
                  const globalIndex = images.indexOf(img)
                  return (
                    <div
                      key={img.id}
                      className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-700 overflow-hidden"
                    >
                      {productId && (
                        <AdminProductImage
                          productId={productId}
                          imageId={img.id}
                          alt={img.alt || ''}
                          size="sm"
                          className="w-full h-full object-cover"
                          refreshKey={imageRefreshKey}
                        />
                      )}
                      <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                        #{globalIndex + 1}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des images avec drag & drop FONCTIONNEL */}
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
              draggable={!loading}
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              className={`
                border rounded-lg p-3 space-y-3 
                bg-white dark:bg-gray-800 
                transition-all
                ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-move'}
                ${draggedIndex === i ? 'opacity-40 scale-95' : ''}
                ${dragOverIndex === i ? 'ring-2 ring-violet border-violet scale-105' : 'border-gray-300 dark:border-gray-600'}
              `}
            >
              {/* En-tête avec poignée drag */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">#{i + 1}</span>
                </div>
                {img.is_primary && (
                  <span className="px-2 py-0.5 bg-violet/10 text-violet rounded font-medium text-[10px]">
                    ★ Principale
                  </span>
                )}
              </div>

              {/* Image */}
              {productId && (
                <div className="relative rounded overflow-hidden">
                  <AdminProductImage
                    productId={productId}
                    imageId={img.id}
                    alt={img.alt || ''}
                    size="md"
                    className="w-full h-48 object-cover"
                    refreshKey={imageRefreshKey}
                  />
                </div>
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
                disabled={loading}
              />

              {/* Actions */}
              <div className="space-y-2">
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
                <button
                  type="button"
                  onClick={() => openEditor(img.id)}
                  disabled={loading || loadingEditor}
                  className="w-full px-3 py-1.5 border border-violet text-violet rounded text-sm hover:bg-violet hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingEditor ? '⏳ Chargement...' : '✂️ Éditer'}
                </button>
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

      {editingImage && productId && (
        <ImageEditorModal
          imageId={editingImage.id}
          productId={productId}
          originalUrl={editingImage.url}
          onClose={() => setEditingImage(null)}
          onSave={async () => {
            setEditingImage(null)
            setSuccess('Image recadrée avec succès')

            // ✅ Attendre que les variantes soient régénérées
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // ✅ Incrémenter la clé pour forcer le re-render
            setImageRefreshKey((prev) => prev + 1)

            // ✅ Recharger les données
            await refresh()
          }}
        />
      )}
    </div>
  )
}
