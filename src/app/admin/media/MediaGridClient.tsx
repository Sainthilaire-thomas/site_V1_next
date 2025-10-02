'use client'

import { useEffect, useState } from 'react'

type ProductImage = {
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
  const [images, setImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)
  const [error, setError] = useState<string | null>(null)

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

    const fd = new FormData()
    Array.from(files).forEach((f) => fd.append('files', f))
    // ⬇️ CHANGER ICI : la route attend "productId" (pas "product_id")
    fd.append('productId', productId)

    const res = await fetch('/api/admin/product-images/upload', {
      method: 'POST',
      body: fd, // ne mets pas de Content-Type, le browser gère le multipart
    })
    if (!res.ok) {
      const msg = await res.text()
      throw new Error(msg || `Upload échoué (${res.status})`)
    }
    setFiles(null)
    await refresh()
  }

  async function setPrimary(id: string) {
    if (!productId) return
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`/api/products/${productId}/images/set-primary`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ imageId: id }),
      })
      if (!r.ok) throw new Error(await r.text())
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
    try {
      const r = await fetch(`/api/admin/product-images/${id}/alt`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ alt }),
      })
      if (!r.ok) throw new Error(await r.text())
      await refresh()
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de la mise à jour de l'alt")
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cette image ?')) return
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`/api/admin/product-images/${id}`, {
        method: 'DELETE',
      })
      if (!r.ok) throw new Error(await r.text())
      await refresh()
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  async function saveOrder(next: ProductImage[]) {
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

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="flex items-center gap-3">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(e.target.files)}
          disabled={!productId || loading}
        />
        <button
          type="button"
          onClick={onUpload}
          className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
          disabled={!productId || !files || loading}
          title={!productId ? 'Sélectionne un produit' : undefined}
        >
          Importer
        </button>
      </div>

      {!productId && (
        <div className="text-sm text-yellow-600">
          Aucun <code>product_id</code> fourni — impossible de lister ou
          d’uploader des images.
        </div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {loading ? (
        <div>Chargement…</div>
      ) : !productId ? (
        <div>—</div>
      ) : images.length === 0 ? (
        <div>Aucune image pour ce produit.</div>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <li key={img.id} className="border rounded p-2 space-y-2">
              <div className="text-xs text-gray-500">
                #{i} {img.is_primary && '• Principale'}
              </div>
              <img
                src={`/api/admin/product-images/${img.id}/signed-url?variant=original`}
                alt={img.alt ?? ''}
                className="w-full h-40 object-cover rounded"
              />
              <input
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="Texte alternatif"
                defaultValue={img.alt ?? ''}
                onBlur={(e) => updateAlt(img.id, e.target.value)}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    className="px-2 py-1 border rounded"
                  >
                    &uarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    className="px-2 py-1 border rounded"
                  >
                    &darr;
                  </button>
                </div>
                <div className="flex gap-2">
                  {!img.is_primary && (
                    <button
                      type="button"
                      onClick={() => setPrimary(img.id)}
                      className="px-2 py-1 border rounded"
                    >
                      Définir principale
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(img.id)}
                    className="px-2 py-1 border rounded text-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
