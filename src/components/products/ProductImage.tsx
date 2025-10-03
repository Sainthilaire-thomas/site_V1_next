// src/components/products/ProductImage.tsx
'use client'

import { useEffect, useState } from 'react'

type ImageSize = 'sm' | 'md' | 'lg' | 'xl'
type ImageFormat = 'avif' | 'webp' | 'jpg'

interface ProductImageProps {
  productId: string
  imageId: string
  alt: string
  size?: ImageSize
  className?: string
  priority?: boolean
}

export function ProductImage({
  productId,
  imageId,
  alt,
  size = 'lg',
  className = '',
  priority = false,
}: ProductImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchSignedUrl() {
      setIsLoading(true)
      try {
        const format = await detectBestFormat()

        const res = await fetch(
          `/api/admin/product-images/${imageId}/signed-url?variant=${size}&format=${format}&mode=json`,
          { cache: 'no-store' }
        )

        if (!res.ok) {
          console.error('API Error:', res.status, await res.text())
          throw new Error(`Failed to get signed URL: ${res.status}`)
        }

        const data = await res.json()

        if (!cancelled && data.signedUrl) {
          setSignedUrl(data.signedUrl)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Error fetching signed URL:', err)
        if (!cancelled) {
          setError(true)
          setIsLoading(false)
        }
      }
    }

    fetchSignedUrl()

    return () => {
      cancelled = true
    }
  }, [imageId, size])

  // ✅ Skeleton loader animé
  if (isLoading) {
    return (
      <div
        className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}
      >
        <div className="h-full w-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400 dark:text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    )
  }

  // ✅ État d'erreur
  if (error || !signedUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
      >
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            Image indisponible
          </span>
        </div>
      </div>
    )
  }

  // ✅ Image chargée
  return (
    <img
      src={signedUrl}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      onError={() => setError(true)}
    />
  )
}

/**
 * Composant responsive avec <picture> pour toutes les tailles
 */
export function ResponsiveProductImage({
  productId,
  imageId,
  alt,
  className = '',
}: Omit<ProductImageProps, 'size'>) {
  const [urls, setUrls] = useState<Record<ImageSize, string> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchAllUrls() {
      setIsLoading(true)
      try {
        const format = await detectBestFormat()
        const sizes: ImageSize[] = ['sm', 'md', 'lg', 'xl']

        const urlPromises = sizes.map(async (size) => {
          try {
            const res = await fetch(
              `/api/admin/product-images/${imageId}/signed-url?variant=${size}&format=${format}&mode=json`,
              { cache: 'no-store' }
            )
            if (!res.ok) throw new Error('Failed')
            const data = await res.json()
            return { size, url: data.signedUrl }
          } catch {
            return { size, url: null }
          }
        })

        const results = await Promise.all(urlPromises)
        const newUrls = results.reduce(
          (acc, { size, url }) => {
            if (url) acc[size] = url
            return acc
          },
          {} as Record<ImageSize, string>
        )

        if (!cancelled) {
          if (Object.keys(newUrls).length === 0) {
            setError(true)
          } else {
            setUrls(newUrls)
          }
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Error fetching URLs:', err)
        if (!cancelled) {
          setError(true)
          setIsLoading(false)
        }
      }
    }

    fetchAllUrls()

    return () => {
      cancelled = true
    }
  }, [imageId])

  // ✅ Skeleton loader
  if (isLoading) {
    return (
      <div
        className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}
      >
        <div className="h-full w-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400 dark:text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    )
  }

  // ✅ État d'erreur
  if (error || !urls) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
      >
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            Image indisponible
          </span>
        </div>
      </div>
    )
  }

  // ✅ Picture avec fallback
  return (
    <picture>
      {urls.sm && <source media="(max-width: 640px)" srcSet={urls.sm} />}
      {urls.md && <source media="(max-width: 1024px)" srcSet={urls.md} />}
      {urls.lg && <source media="(max-width: 1536px)" srcSet={urls.lg} />}
      <img
        src={urls.xl || urls.lg || urls.md || urls.sm}
        alt={alt}
        className={className}
        loading="lazy"
        onError={(e) => {
          console.error('Image failed to load')
          setError(true)
        }}
      />
    </picture>
  )
}

/**
 * Détecte le meilleur format d'image supporté par le navigateur
 */
async function detectBestFormat(): Promise<ImageFormat> {
  // Support AVIF
  if (await supportsFormat('avif')) return 'avif'
  // Support WebP
  if (await supportsFormat('webp')) return 'webp'
  // Fallback JPEG
  return 'jpg'
}

/**
 * Teste si le navigateur supporte un format d'image
 */
function supportsFormat(format: ImageFormat): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img.width > 0 && img.height > 0)
    img.onerror = () => resolve(false)

    const testImages: Record<ImageFormat, string> = {
      avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=',
      webp: 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=',
      jpg: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wAAA/9k=',
    }

    img.src = testImages[format]
  })
}
