// src/components/layout/Homepage.tsx - VERSION AVEC UnifiedHeader
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { sanityClient } from '@/lib/sanity.client'
import { HOMEPAGE_QUERY } from '@/lib/queries'
import { urlFor } from '@/lib/sanity.image'
import UnifiedHeader from './UnifiedHeader'

// Types pour les données Sanity
interface SanityHomepageData {
  heroTitle?: string
  heroSubtitle?: string
  heroImage?: any
  sections?: Array<{
    _type: 'banner' | 'carousel' | 'editorialPicks'
    title?: string
    text?: string
    image?: any
    ctaLabel?: string
    ctaHref?: string
    images?: any[]
    productIds?: string[]
  }>
  seo?: {
    title?: string
    description?: string
    image?: any
  }
}

const Homepage = () => {
  const [isEasterEggActive, setIsEasterEggActive] = useState(false)
  const [sanityData, setSanityData] = useState<SanityHomepageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Charger les données Sanity
  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setIsLoading(true)
        const data = await sanityClient.fetch(HOMEPAGE_QUERY)
        setSanityData(data)
      } catch (error) {
        console.error('Erreur lors du chargement des données Sanity:', error)
        // Fallback vers des données par défaut si Sanity échoue
        setSanityData({
          heroTitle: '.blancherenaudin',
          heroSubtitle: "Mode contemporaine & savoir-faire d'exception",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchHomepageData()
  }, [])

  const handleLogoClick = () => {
    setIsEasterEggActive(true)
    setTimeout(() => setIsEasterEggActive(false), 3000)
  }

  const generateStrikeElements = () => {
    const elements = []
    for (let i = 0; i < 6; i++) {
      const randomX = Math.random() * 100
      const randomY = Math.random() * 100
      const randomRotation = Math.random() * 360
      const randomDelay = Math.random() * 0.5

      elements.push(
        <div
          key={i}
          className="fixed text-violet text-4xl md:text-6xl font-light pointer-events-none z-50 opacity-0 animate-pulse"
          style={{
            left: `${randomX}%`,
            top: `${randomY}%`,
            transform: `translate(-50%, -50%) rotate(${randomRotation}deg)`,
            animationDelay: `${randomDelay}s`,
            animationDuration: '0.6s',
          }}
        >
          BLANCHE
        </div>
      )
    }
    return elements
  }

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-light text-gray-800 tracking-tight mb-4">
            .blancherenaudin
          </div>
          <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      {/* Détails flottants plus discrets */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/6 w-0.5 h-0.5 bg-gray-100 rounded-full opacity-20 animate-subtle-float" />
        <div
          className="absolute bottom-1/3 right-1/5 w-0.5 h-0.5 bg-gray-100 rounded-full opacity-15 animate-subtle-float"
          style={{ animationDelay: '4s' }}
        />
      </div>

      {/* Easter Egg */}
      {isEasterEggActive && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {generateStrikeElements()}
        </div>
      )}

      {/* Header unifié */}
      <UnifiedHeader variant="transparent" showNavigation={true} />

      {/* Hero Section */}
      <section className="h-screen pt-20 px-8">
        <div className="container mx-auto h-full">
          {/* Hero avec image Sanity si disponible */}
          {sanityData?.heroImage ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={urlFor(sanityData.heroImage).width(1600).height(900).url()}
                alt={sanityData.heroTitle || 'Hero'}
                className="w-full h-full object-cover rounded-md"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-4xl md:text-6xl font-light mb-4 tracking-tight">
                    {sanityData.heroTitle || '.blancherenaudin'}
                  </h1>
                  {sanityData.heroSubtitle && (
                    <p className="text-lg md:text-xl font-light opacity-90">
                      {sanityData.heroSubtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Fallback vers la grille existante si pas d'image hero
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              <Link
                href="/collections"
                className="md:col-span-2 md:row-span-2 relative hover-subtle transition-all duration-300 group overflow-hidden rounded-md block"
              >
                <img
                  src="https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=1200&fit=crop&crop=center"
                  alt="Collection Automne"
                  className="w-full h-full object-cover filter brightness-105 contrast-95"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/15 transition-all duration-300"></div>
                <div className="absolute bottom-12 left-12">
                  <h2 className="text-white text-2xl md:text-3xl font-light mb-3 tracking-tight">
                    Collection Automne
                  </h2>
                  <p className="text-white/80 text-base font-light">
                    Découvrez nos dernières créations
                  </p>
                </div>
              </Link>
              <Link
                href="/products"
                className="relative hover-subtle transition-all duration-300 group overflow-hidden rounded-md block"
              >
                <img
                  src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop&crop=faces"
                  alt="Collection Femme"
                  className="w-full h-full object-cover filter brightness-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/15 transition-all duration-300"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white text-lg font-light tracking-tight">
                    Femme
                  </h3>
                </div>
              </Link>
              <Link
                href="/products"
                className="relative hover-subtle transition-all duration-300 group overflow-hidden rounded-md block"
              >
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces"
                  alt="Collection Homme"
                  className="w-full h-full object-cover filter brightness-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/15 transition-all duration-300"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white text-lg font-light tracking-tight">
                    Homme
                  </h3>
                </div>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Sections dynamiques depuis Sanity */}
      {sanityData?.sections &&
        sanityData.sections.map((section, index) => (
          <section key={index} className="py-24 px-8">
            <div className="container mx-auto">
              {section._type === 'banner' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {section.image && (
                    <div className="aspect-[4/3] rounded-lg overflow-hidden">
                      <img
                        src={urlFor(section.image)
                          .width(1200)
                          .height(900)
                          .url()}
                        alt={section.title || 'Banner'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    {section.title && (
                      <h2 className="text-3xl font-light text-gray-800 tracking-tight mb-6">
                        {section.title}
                      </h2>
                    )}
                    {section.text && (
                      <p className="text-gray-600 text-lg leading-relaxed mb-8">
                        {section.text}
                      </p>
                    )}
                    {section.ctaHref && (
                      <Link
                        href={section.ctaHref}
                        className="inline-block px-8 py-3 border border-violet text-violet hover:bg-violet hover:text-white transition-colors duration-300"
                      >
                        {section.ctaLabel || 'Découvrir'}
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {section._type === 'carousel' && section.images && (
                <div>
                  {section.title && (
                    <h2 className="text-3xl font-light text-center mb-20 text-gray-800 tracking-tight">
                      {section.title}
                    </h2>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {section.images.map((image, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="aspect-[3/4] rounded-lg overflow-hidden border border-gray-50"
                      >
                        <img
                          src={urlFor(image).width(800).height(1066).url()}
                          alt={`Carousel ${imgIndex + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {section._type === 'editorialPicks' && section.productIds && (
                <div>
                  {section.title && (
                    <h2 className="text-3xl font-light text-center mb-20 text-gray-800 tracking-tight">
                      {section.title}
                    </h2>
                  )}
                  <div className="text-center text-gray-500">
                    Sélection éditoriale - {section.productIds.length} produits
                    <br />
                    <small>
                      Connectez votre store Supabase pour afficher les produits
                    </small>
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}

      {/* Section produits par défaut si pas de sections Sanity */}
      {(!sanityData?.sections || sanityData.sections.length === 0) && (
        <section className="py-24 px-8">
          <div className="container mx-auto">
            <h2 className="text-3xl font-light text-center mb-20 text-gray-800 tracking-tight">
              Nos Créations
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {[
                {
                  id: 1,
                  image:
                    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop',
                  title: 'Blazer Signature',
                },
                {
                  id: 2,
                  image:
                    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop',
                  title: 'Robe Couture',
                },
                {
                  id: 3,
                  image:
                    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop',
                  title: 'Chemise Atelier',
                },
                {
                  id: 4,
                  image:
                    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop',
                  title: 'Veste Premium',
                },
              ].map((item) => (
                <Link
                  key={item.id}
                  href="/products"
                  className="aspect-[3/4] relative hover-subtle transition-all duration-200 group overflow-hidden rounded-md block border border-gray-50"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover filter brightness-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-200"></div>
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <h3 className="text-white text-xs font-light tracking-wide uppercase">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-16 px-8 border-t border-gray-50 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl text-gray-700 mb-3 font-light tracking-tight">
            {sanityData?.heroTitle || '.blancherenaudin'}
          </h2>
          <p className="text-gray-500 text-sm font-light mb-1">
            {sanityData?.heroSubtitle ||
              "Mode contemporaine & savoir-faire d'exception"}
          </p>
          <p className="text-gray-400 text-xs font-light">
            © 2024 .blancherenaudin - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Homepage
