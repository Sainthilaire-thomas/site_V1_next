// src/app/page.tsx - VERSION CROSSFADE AVEC PRÉCHARGEMENT
'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Homepage from '../components/layout/Homepage'
import { sanityClient } from '@/lib/sanity.client'
import { HOMEPAGE_QUERY } from '@/lib/queries'

const DURATIONS = {
  arrangeMs: 800,
  staggerMs: 90,
  holdMs: 1200,
  fadeOutMs: 600,
}
const LINE_SPACING_PCT = 2.8

// Types
interface HomepageData {
  hero: {
    title: string
    subtitle: string
    image: any
    ctaLabel: string
    ctaLink: string
  }
  zoneHauts: CategoryZone
  zoneBas: CategoryZone
  zoneAccessoires: CategoryZone
  zoneLookbooks: CategoryZone
  zoneSustainability: CategoryZone
  seo?: {
    title?: string
    description?: string
    image?: any
  }
}

interface CategoryZone {
  image: any
  title: string
  subtitle?: string
  link: string
}

const InteractiveEntry = ({
  onEnter,
  homepageData,
}: {
  onEnter: () => void
  homepageData: HomepageData | null
}) => {
  const brandName = '.blancherenaudin'
  const [letters, setLetters] = useState<
    Array<{
      char: string
      id: string
      x: number
      y: number
      originalX: number
      originalY: number
      delay: number
      rotation: number
    }>
  >([])
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isArranging, setIsArranging] = useState(false)
  const [hideCenter, setHideCenter] = useState(false)
  const [isFading, setIsFading] = useState(false)
  const [imagesPreloaded, setImagesPreloaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // ✅ PRÉCHARGEMENT DES IMAGES DE LA HOMEPAGE
  useEffect(() => {
    if (!homepageData) return

    const preloadImages = async () => {
      const images = [
        homepageData.hero?.image,
        homepageData.zoneHauts?.image,
        homepageData.zoneBas?.image,
        homepageData.zoneAccessoires?.image,
        homepageData.zoneLookbooks?.image,
        homepageData.zoneSustainability?.image,
      ].filter(Boolean)

      // Créer un tableau de promesses pour charger toutes les images
      const imagePromises = images.map((imageData) => {
        return new Promise((resolve) => {
          if (!imageData) {
            resolve(null)
            return
          }

          const img = new Image()

          // Construire l'URL Sanity
          try {
            const imageUrl =
              imageData.asset?.url ||
              `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${imageData.asset?._ref?.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}`

            img.onload = () => resolve(img)
            img.onerror = () => resolve(null)
            img.src = imageUrl
          } catch (error) {
            resolve(null)
          }
        })
      })

      await Promise.all(imagePromises)
      setImagesPreloaded(true)
      console.log('✅ Images préchargées')
    }

    preloadImages()
  }, [homepageData])

  const generateLetters = useCallback(() => {
    const chars = brandName.split('')
    setLetters(
      chars.map((char, index) => {
        const x = Math.random() * 80 + 10
        const y = Math.random() * 80 + 10
        const rotation = Math.random() * 40 - 20
        return {
          char,
          id: `letter-${index}`,
          x,
          y,
          originalX: x,
          originalY: y,
          delay: index * 0.06,
          rotation,
        }
      })
    )
  }, [brandName])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || isArranging) return
      const rect = containerRef.current.getBoundingClientRect()
      const mouseX = ((e.clientX - rect.left) / rect.width) * 100
      const mouseY = ((e.clientY - rect.top) / rect.height) * 100
      setMousePosition({ x: mouseX, y: mouseY })

      setLetters((prev) =>
        prev.map((letter) => {
          const dx = mouseX - letter.originalX
          const dy = mouseY - letter.originalY
          const distance = Math.sqrt(dx * dx + dy * dy)
          const repulsionRadius = 25

          if (distance < repulsionRadius) {
            const force = (repulsionRadius - distance) / repulsionRadius
            const angle = Math.atan2(
              letter.originalY - mouseY,
              letter.originalX - mouseX
            )
            const repulsionDistance = force * 15
            const newX = letter.originalX + Math.cos(angle) * repulsionDistance
            const newY = letter.originalY + Math.sin(angle) * repulsionDistance
            const dynamicRotation = letter.rotation + force * 20

            return {
              ...letter,
              x: Math.max(5, Math.min(95, newX)),
              y: Math.max(5, Math.min(95, newY)),
              rotation: dynamicRotation,
            }
          }
          return {
            ...letter,
            x: letter.originalX,
            y: letter.originalY,
            rotation: letter.rotation,
          }
        })
      )
    },
    [isArranging]
  )

  useEffect(() => {
    generateLetters()
  }, [generateLetters])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('mousemove', handleMouseMove)
    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const handleCenterClick = () => {
    if (isArranging) return
    setHideCenter(true)
    setIsArranging(true)

    const n = brandName.length
    const mid = (n - 1) / 2

    // Phase 1: Éclatement
    setLetters((prev) =>
      prev.map((l) => ({
        ...l,
        x: 50 + (Math.random() - 0.5) * 60,
        y: 50 + (Math.random() - 0.5) * 60,
        rotation: (Math.random() - 0.5) * 180,
      }))
    )

    // Phase 2: Alignement après 200ms
    setTimeout(() => {
      setLetters((prev) =>
        prev.map((l, i) => ({
          ...l,
          x: 50 + (i - mid) * LINE_SPACING_PCT,
          y: 50,
          rotation: 0,
        }))
      )
    }, 200)

    const totalMs =
      DURATIONS.arrangeMs + DURATIONS.staggerMs * (n - 1) + DURATIONS.holdMs

    // ✅ CROSSFADE: Démarrer le fade ET la homepage EN MÊME TEMPS
    window.setTimeout(() => {
      setIsFading(true)
      // Délai minimal pour que le fade commence avant la homepage
      setTimeout(() => onEnter(), 50)
    }, totalMs)
  }

  const handleCenterKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCenterClick()
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-white overflow-hidden"
    >
      {letters.map((letter, index) => {
        const isAligned = isArranging && !isFading

        return (
          <div
            key={letter.id}
            className="pointer-events-none"
            style={{
              position: 'absolute',
              left: `${letter.x}%`,
              top: `${letter.y}%`,
              transform: `translate(-50%, -50%) rotate(${letter.rotation}deg)`,
              fontSize: 'clamp(1.6rem, 5vw, 3rem)',
              fontFamily: 'var(--font-archivo-narrow)',
              fontWeight: 600,
              color: isArranging ? 'hsl(271 74% 37%)' : 'hsl(0 0% 0%)',
              opacity: 0,
              animation: `letter-appear 0.35s ease-out ${letter.delay}s forwards${
                isAligned ? ', brand-pulse 2s ease-in-out infinite' : ''
              }`,
              animationDelay: isAligned
                ? `${letter.delay}s, ${DURATIONS.arrangeMs + index * DURATIONS.staggerMs + 200}ms`
                : `${letter.delay}s`,
              willChange: 'left, top, opacity, transform, color',
              transition: `
                left ${DURATIONS.arrangeMs}ms cubic-bezier(0.34, 1.56, 0.64, 1), 
                top ${DURATIONS.arrangeMs}ms cubic-bezier(0.34, 1.56, 0.64, 1), 
                opacity ${DURATIONS.fadeOutMs}ms ease,
                color ${DURATIONS.arrangeMs}ms ease,
                transform ${DURATIONS.arrangeMs}ms cubic-bezier(0.34, 1.56, 0.64, 1)
              `,
              transitionDelay: isArranging
                ? `${index * DURATIONS.staggerMs}ms`
                : '0ms',
              ...(isFading ? { opacity: 0 } : {}),
            }}
          >
            {letter.char}
          </div>
        )
      })}

      {!hideCenter && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <button
            aria-label="Entrer sur le site"
            title="Entrer"
            onClick={handleCenterClick}
            onKeyDown={handleCenterKey}
            className="transition-all duration-300 hover:scale-110 hover:shadow-lg"
            style={{
              width: 44,
              height: 44,
              background: 'black',
              borderRadius: 0,
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          />
        </div>
      )}

      {!isArranging && !isFading && (
        <div
          className="pointer-events-none"
          style={{
            position: 'fixed',
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: 'translate(-50%, -50%)',
            width: 10,
            height: 10,
            borderRadius: '9999px',
            background: 'rgba(111, 76, 255, 0.9)',
            zIndex: 40,
            boxShadow: '0 0 20px rgba(111, 76, 255, 0.6)',
          }}
        />
      )}

      {/* Indicateur de préchargement (optionnel - pour debug) */}
      {!imagesPreloaded && (
        <div className="fixed bottom-4 right-4 text-xs text-gray-400 opacity-50">
          Préchargement...
        </div>
      )}

      <style jsx>{`
        @keyframes letter-appear {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.88) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1)
              rotate(var(--rotation, 0deg));
          }
        }

        @keyframes brand-pulse {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            filter: brightness(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.03) rotate(0deg);
            filter: brightness(1.1);
          }
        }
      `}</style>
    </div>
  )
}

function HomeContent() {
  const [showHomepage, setShowHomepage] = useState(false)
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()

  // Fetch des données Sanity au chargement
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await sanityClient.fetch(HOMEPAGE_QUERY)
        setHomepageData(data)
      } catch (error) {
        console.error('Erreur lors du fetch Sanity:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const skipIntro = searchParams.get('skip-intro')
    const hasVisited =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('hasVisitedHomepage')
    if (skipIntro === 'true' || hasVisited === 'true') setShowHomepage(true)
  }, [searchParams])

  const handleEnterHomepage = () => {
    try {
      sessionStorage.setItem('hasVisitedHomepage', 'true')
    } catch {}
    setShowHomepage(true)
  }

  // Affichage du loader pendant le fetch
  if (isLoading) {
    return <div className="w-full h-screen bg-white animate-pulse" />
  }

  // Si pas de données Sanity
  if (!homepageData) {
    return (
      <div className="w-full h-screen flex items-center justify-center px-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Configuration requise</h1>
          <p className="text-grey-medium mb-4">
            Aucune donnée disponible. Veuillez configurer la homepage dans
            Sanity Studio.
          </p>
          <a
            href="/studio"
            className="inline-block px-6 py-3 bg-black text-white hover:bg-grey-dark transition-colors"
          >
            Ouvrir Sanity Studio
          </a>
        </div>
      </div>
    )
  }

  // ✅ CROSSFADE: Afficher les deux composants en même temps pendant la transition
  return (
    <div className="relative w-full h-screen">
      {/* Intro - disparaît en premier */}
      {!showHomepage && (
        <div className="absolute inset-0 z-20">
          <InteractiveEntry
            onEnter={handleEnterHomepage}
            homepageData={homepageData}
          />
        </div>
      )}

      {/* Homepage - apparaît en fondu */}
      {showHomepage && (
        <div
          className="absolute inset-0 z-10"
          style={{
            animation: 'homepage-fadein 600ms ease-out forwards',
            opacity: 0,
          }}
        >
          <Homepage data={homepageData} />
        </div>
      )}

      <style jsx>{`
        @keyframes homepage-fadein {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense
      fallback={<div className="w-full h-screen bg-white animate-pulse" />}
    >
      <HomeContent />
    </Suspense>
  )
}
