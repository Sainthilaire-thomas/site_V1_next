// src/components/admin/AdminProductImage.tsx
'use client'

import { useEffect, useState } from 'react'

type ImageSize = 'sm' | 'md' | 'lg' | 'xl'

interface AdminProductImageProps {
  productId: string
  imageId: string
  alt: string
  size?: ImageSize
  className?: string
  refreshKey?: number // Pour forcer le refresh
}

export function AdminProductImage({
  productId,
  imageId,
  alt,
  size = 'md',
  className = '',
  refreshKey = 0,
}: AdminProductImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchSignedUrl() {
      setIsLoading(true)
      setError(false)

      try {
        // ✅ Cache-buster avec timestamp
        const cacheBuster = Date.now()
        const res = await fetch(
          `/api/admin/product-images/${imageId}/signed-url?variant=${size}&format=webp&mode=json&t=${cacheBuster}`,
          { cache: 'no-store' }
        )

        if (!res.ok) {
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
  }, [imageId, size, refreshKey]) // ✅ refreshKey déclenche le reload

  if (isLoading) {
    return (
      <div
        className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}
      >
        <div className="h-full w-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
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

  if (error || !signedUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
      >
        <span className="text-gray-400 text-xs">Image indisponible</span>
      </div>
    )
  }

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setError(true)}
    />
  )
}
