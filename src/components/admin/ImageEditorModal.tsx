// src/components/admin/ImageEditorModal.tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

type Props = {
  imageId: string
  productId: string
  originalUrl: string
  onClose: () => void
  onSave: () => void
}

const ASPECT_RATIOS = {
  free: { value: 0, label: 'Libre' },
  square: { value: 1, label: '1:1 (Carré)' },
  portrait: { value: 4 / 5, label: '4:5 (Portrait)' },
  landscape: { value: 16 / 9, label: '16:9 (Paysage)' },
}

export function ImageEditorModal({
  imageId,
  productId,
  originalUrl,
  onClose,
  onSave,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [aspect, setAspect] = useState<number>(ASPECT_RATIOS.free.value)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [generatingPreview, setGeneratingPreview] = useState(false)
  const [previewOutdated, setPreviewOutdated] = useState(false) // ✅ Nouveau

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
    setPreviewOutdated(true) // ✅ Marquer comme obsolète au lieu de supprimer
  }, [])

  async function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.src = url
    })
  }

  async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    rotation: number = 0
  ): Promise<string> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Canvas context indisponible')
    }

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    canvas.width = safeArea
    canvas.height = safeArea

    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-safeArea / 2, -safeArea / 2)

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    )

    const data = ctx.getImageData(0, 0, safeArea, safeArea)

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    )

    return canvas.toDataURL('image/jpeg', 0.9)
  }

  async function generatePreview() {
    if (!croppedAreaPixels) {
      setError('Aucune zone de crop définie')
      return
    }

    setGeneratingPreview(true)
    setError(null)

    try {
      console.log('🎨 Génération preview...')

      const response = await fetch(originalUrl)
      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)

      const croppedImage = await getCroppedImg(
        imageUrl,
        croppedAreaPixels,
        rotation
      )

      // ✅ Cleanup de l'ancienne preview
      if (previewUrl && previewUrl.startsWith('data:')) {
        // Les data URLs n'ont pas besoin de cleanup
      }

      setPreviewUrl(croppedImage)
      setShowPreview(true)
      setPreviewOutdated(false) // ✅ Marquer comme à jour

      URL.revokeObjectURL(imageUrl)

      console.log('✅ Preview générée')
    } catch (err: any) {
      console.error('❌ Erreur génération preview:', err)
      setError('Erreur lors de la génération: ' + err.message)
    } finally {
      setGeneratingPreview(false)
    }
  }

  async function handleSave() {
    if (!croppedAreaPixels) {
      setError('Aucune zone de crop définie')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/product-images/edit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          imageId,
          productId,
          crop: croppedAreaPixels,
          rotation,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Erreur ${res.status}`)
      }

      onSave()
      onClose()
    } catch (err: any) {
      console.error('❌ Erreur sauvegarde:', err)
      setError(err.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Éditer l'image</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded text-sm">
            {error}
          </div>
        )}

        {/* Zone principale */}
        <div className="flex-1 flex overflow-hidden">
          {/* Éditeur */}
          <div
            className={`relative bg-black ${showPreview ? 'w-1/2' : 'w-full'} min-h-[400px]`}
          >
            <Cropper
              image={originalUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect || undefined}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  backgroundColor: '#000',
                },
              }}
            />
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="w-1/2 bg-gray-100 dark:bg-gray-900 flex flex-col">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Aperçu du résultat
                  </span>
                  {previewOutdated && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">
                      Obsolète
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                {previewUrl ? (
                  <div className="relative max-w-full max-h-full">
                    <img
                      src={previewUrl}
                      alt="Aperçu"
                      className="max-w-full max-h-full object-contain rounded shadow-lg"
                    />
                    {previewOutdated && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded">
                        <span className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded text-sm">
                          Cliquez sur "Actualiser aperçu"
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">Aucun aperçu</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {/* Aspect ratio */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-sm font-medium">Ratio:</span>
            {Object.entries(ASPECT_RATIOS).map(([key, { value, label }]) => (
              <button
                key={key}
                onClick={() => {
                  setAspect(value)
                  setPreviewOutdated(true) // ✅ Marquer obsolète
                }}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  aspect === value
                    ? 'bg-violet text-white border-violet'
                    : 'border-gray-300 dark:border-gray-600 hover:border-violet'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Rotation */}
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-sm font-medium">Rotation:</span>
            <button
              onClick={() => {
                setRotation((r) => (r + 90) % 360)
                setPreviewOutdated(true)
              }}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 hover:border-violet"
            >
              +90°
            </button>
            <button
              onClick={() => {
                setRotation((r) => (r - 90 + 360) % 360)
                setPreviewOutdated(true)
              }}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 hover:border-violet"
            >
              -90°
            </button>
            <button
              onClick={() => {
                setRotation(0)
                setPreviewOutdated(true)
              }}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 hover:border-violet"
            >
              Réinitialiser
            </button>
            <span className="text-sm text-gray-500">({rotation}°)</span>
          </div>

          {/* Zoom */}
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Zoom:</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => {
                setZoom(Number(e.target.value))
                setPreviewOutdated(true)
              }}
              className="flex-1"
            />
            <span className="text-sm text-gray-500 w-12 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-between pt-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Annuler
            </button>

            <div className="flex gap-2">
              <button
                onClick={generatePreview}
                disabled={saving || generatingPreview || !croppedAreaPixels}
                className="px-4 py-2 border border-violet text-violet rounded hover:bg-violet/10 disabled:opacity-50"
              >
                {generatingPreview
                  ? 'Génération...'
                  : previewOutdated
                    ? 'Actualiser aperçu'
                    : 'Aperçu'}
              </button>

              <button
                onClick={handleSave}
                disabled={saving || !croppedAreaPixels}
                className="px-4 py-2 bg-violet text-white rounded hover:bg-violet/90 disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
