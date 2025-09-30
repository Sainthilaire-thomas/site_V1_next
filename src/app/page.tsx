// src/app/page.tsx
'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Homepage from '../components/layout/Homepage'
import { sanityClient } from '@/lib/sanity.client'
import { HOMEPAGE_QUERY } from '@/lib/queries'

const DURATIONS = {
  arrangeMs: 600,
  staggerMs: 70,
  holdMs: 500,
  fadeOutMs: 300,
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

const InteractiveEntry = ({ onEnter }: { onEnter: () => void }) => {
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
    }>
  >([])
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isArranging, setIsArranging] = useState(false)
  const [hideCenter, setHideCenter] = useState(false)
  const [isFading, setIsFading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const generateLetters = useCallback(() => {
    const chars = brandName.split('')
    setLetters(
      chars.map((char, index) => {
        const x = Math.random() * 80 + 10
        const y = Math.random() * 80 + 10
        return {
          char,
          id: `letter-${index}`,
          x,
          y,
          originalX: x,
          originalY: y,
          delay: index * 0.06,
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
          const repulsionRadius = 20
          if (distance < repulsionRadius) {
            const force = (repulsionRadius - distance) / repulsionRadius
            const angle = Math.atan2(
              letter.originalY - mouseY,
              letter.originalX - mouseX
            )
            const repulsionDistance = force * 10
            const newX = letter.originalX + Math.cos(angle) * repulsionDistance
            const newY = letter.originalY + Math.sin(angle) * repulsionDistance
            return {
              ...letter,
              x: Math.max(5, Math.min(95, newX)),
              y: Math.max(5, Math.min(95, newY)),
            }
          }
          return { ...letter, x: letter.originalX, y: letter.originalY }
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
    setLetters((prev) =>
      prev.map((l, i) => ({
        ...l,
        x: 50 + (i - mid) * LINE_SPACING_PCT,
        y: 50,
      }))
    )

    const totalMs =
      DURATIONS.arrangeMs + DURATIONS.staggerMs * (n - 1) + DURATIONS.holdMs
    window.setTimeout(
      () => setIsFading(true),
      Math.max(0, totalMs - DURATIONS.fadeOutMs)
    )
    window.setTimeout(onEnter, totalMs)
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
      {letters.map((letter, index) => (
        <div
          key={letter.id}
          className="text-foreground pointer-events-none"
          style={{
            position: 'absolute',
            left: `${letter.x}%`,
            top: `${letter.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: 'clamp(1.6rem, 5vw, 3rem)',
            opacity: 0,
            animation: `letter-appear 0.35s ease-out ${letter.delay}s forwards`,
            willChange: 'left, top, opacity, transform',
            transition: `left ${DURATIONS.arrangeMs}ms ease, top ${DURATIONS.arrangeMs}ms ease, opacity ${DURATIONS.fadeOutMs}ms ease`,
            transitionDelay: isArranging
              ? `${index * DURATIONS.staggerMs}ms`
              : '0ms',
            ...(isFading ? { opacity: 0 } : {}),
          }}
        >
          {letter.char}
        </div>
      ))}

      {!hideCenter && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <button
            aria-label="Entrer sur le site"
            title="Entrer"
            onClick={handleCenterClick}
            onKeyDown={handleCenterKey}
            style={{
              width: 44,
              height: 44,
              background: 'black',
              borderRadius: 4,
              cursor: 'pointer',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.25) inset',
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
          }}
        />
      )}

      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-[${DURATIONS.fadeOutMs}ms]`}
        style={{
          background: 'white',
          opacity: isFading ? 1 : 0,
          zIndex: 60,
        }}
      />

      <style jsx>{`
        @keyframes letter-appear {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.88);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
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

  // Affichage de la homepage avec les données (on vérifie que homepageData existe bien)
  if (showHomepage && homepageData) {
    return <Homepage data={homepageData} />
  }

  // Affichage de l'intro interactive
  return <InteractiveEntry onEnter={handleEnterHomepage} />
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
