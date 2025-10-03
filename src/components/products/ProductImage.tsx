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
  const [signedUrl, setSignedUrl] = useState<string>('/placeholder.jpg')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchSignedUrl() {
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

  if (error) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
      >
        <span className="text-gray-400 text-sm">Image indisponible</span>
      </div>
    )
  }

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      style={isLoading ? { opacity: 0.5 } : {}}
    />
  )
}

// ... reste du code (ResponsiveProductImage, detectBestFormat, etc.)

/**
 * Composant responsive avec <picture> pour toutes les tailles
 */
export function ResponsiveProductImage({
  productId,
  imageId,
  alt,
  className = '',
}: Omit<ProductImageProps, 'size'>) {
  const [urls, setUrls] = useState<Record<ImageSize, string>>({
    sm: '/placeholder.jpg',
    md: '/placeholder.jpg',
    lg: '/placeholder.jpg',
    xl: '/placeholder.jpg',
  })

  useEffect(() => {
    async function fetchAllUrls() {
      const format = await detectBestFormat()
      const sizes: ImageSize[] = ['sm', 'md', 'lg', 'xl']

      const urlPromises = sizes.map(async (size) => {
        try {
          const res = await fetch(
            `/api/admin/product-images/${imageId}/signed-url?variant=${size}&format=${format}`,
            { cache: 'no-store' }
          )
          return { size, url: res.ok ? res.url : '/placeholder.jpg' }
        } catch {
          return { size, url: '/placeholder.jpg' }
        }
      })

      const results = await Promise.all(urlPromises)
      const newUrls = results.reduce(
        (acc, { size, url }) => {
          acc[size] = url
          return acc
        },
        {} as Record<ImageSize, string>
      )

      setUrls(newUrls)
    }

    fetchAllUrls()
  }, [imageId])

  return (
    <picture>
      <source media="(max-width: 640px)" srcSet={urls.sm} />
      <source media="(max-width: 1024px)" srcSet={urls.md} />
      <source media="(max-width: 1536px)" srcSet={urls.lg} />
      <img src={urls.xl} alt={alt} className={className} loading="lazy" />
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
