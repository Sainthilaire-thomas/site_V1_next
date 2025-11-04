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
  const [imageLoaded, setImageLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchSignedUrl() {
      setIsLoading(true)
      setImageLoaded(false)

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

  // ✅ Pendant chargement initial
  if (isLoading && !signedUrl) {
    return <div className={`bg-gray-50 ${className}`} />
  }

  // ✅ État d'erreur
  if (error) {
    return (
      <div
        className={`relative bg-white ${className} flex items-center justify-center`}
      >
        <span className="text-gray-400 text-xs">Image indisponible</span>
      </div>
    )
  }

  // ✅ Image avec fade-in
  return (
    <div className={`relative bg-white ${className}`}>
      {signedUrl && (
        <img
          src={signedUrl}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setImageLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
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
  const [imageLoaded, setImageLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchAllUrls() {
      setIsLoading(true)
      setImageLoaded(false)

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

  // ✅ Pendant chargement initial
  if (isLoading && !urls) {
    return <div className={`bg-gray-50 ${className}`} />
  }

  // ✅ État d'erreur
  if (error) {
    return (
      <div
        className={`relative bg-white ${className} flex items-center justify-center`}
      >
        <span className="text-gray-400 text-xs">Image indisponible</span>
      </div>
    )
  }

  // ✅ Picture avec fade-in
  return (
    <div className={`relative bg-white ${className}`}>
      {urls && (
        <picture>
          {urls.sm && <source media="(max-width: 640px)" srcSet={urls.sm} />}
          {urls.md && <source media="(max-width: 1024px)" srcSet={urls.md} />}
          {urls.lg && <source media="(max-width: 1536px)" srcSet={urls.lg} />}
          <img
            src={urls.xl || urls.lg || urls.md || urls.sm}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              console.error('Image failed to load')
              setError(true)
            }}
          />
        </picture>
      )}
    </div>
  )
}

/**
 * Détecte le meilleur format d'image supporté par le navigateur
 */
async function detectBestFormat(): Promise<ImageFormat> {
  if (await supportsFormat('avif')) return 'avif'
  if (await supportsFormat('webp')) return 'webp'
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
