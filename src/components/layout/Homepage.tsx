'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import HeaderMinimal from './HeaderMinimal'
import FooterMinimal from './FooterMinimal'
import { urlFor } from '@/lib/sanity.image'

// Types pour les données Sanity
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
}

interface CategoryZone {
  image: any
  title: string
  subtitle?: string
  link: string
}

interface HomepageProps {
  data: HomepageData
}

export default function Homepage({ data }: HomepageProps) {
  // Protection contre data undefined
  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-grey-medium">Chargement...</p>
      </div>
    )
  }

  const {
    hero,
    zoneHauts,
    zoneBas,
    zoneAccessoires,
    zoneLookbooks,
    zoneSustainability,
  } = data

  // Helper pour obtenir l'URL d'une image de manière sécurisée
  const getImageUrl = (
    image: any,
    fallback: string = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&h=1080&fit=crop'
  ): string => {
    if (!image) return fallback
    try {
      const url = urlFor(image)?.url()
      return url || fallback
    } catch (error) {
      console.error("Erreur lors de la génération de l'URL image:", error)
      return fallback
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header avec position absolue pour overlay sur le hero */}
      <div className="relative z-50">
        <HeaderMinimal />
      </div>

      {/* Hero Section - Plein écran SOUS le header */}
      <section className="relative w-full -mt-20" style={{ height: '100vh' }}>
        {/* Image de fond */}
        <div className="absolute inset-0">
          <img
            src={getImageUrl(hero?.image)}
            alt={hero?.title || 'Hero'}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Texte superposé */}
        <div className="relative z-10 flex h-full items-end pb-16 px-8">
          <div className="max-w-4xl">
            <h1
              className="text-hero text-white mb-4"
              style={{ whiteSpace: 'pre-line' }}
            >
              {hero?.title || 'NOUVELLE\nCOLLECTION'}
            </h1>
            <p className="text-body text-white/90 max-w-md mb-8 text-lg">
              {hero?.subtitle ||
                'Découvrez les pièces essentielles de la saison'}
            </p>
            <Link href={hero?.ctaLink || '/hauts'} className="btn-primary">
              {hero?.ctaLabel || 'DÉCOUVRIR'}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="text-white w-6 h-6" />
        </div>
      </section>

      {/* Grille de catégories - Asymétrique style Jacquemus */}
      <section className="py-24 px-8 bg-white relative z-10">
        <div className="max-w-[1920px] mx-auto">
          <div className="grid grid-cols-12 gap-4">
            {/* Grande image - HAUTS */}
            <div className="col-span-12 md:col-span-8 md:row-span-2">
              <CategoryCard
                image={getImageUrl(
                  zoneHauts?.image,
                  'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1600&h=1200&fit=crop'
                )}
                title={zoneHauts?.title || 'HAUTS'}
                subtitle={zoneHauts?.subtitle}
                link={zoneHauts?.link || '/hauts'}
                size="large"
              />
            </div>

            {/* Petite image - BAS */}
            <div className="col-span-6 md:col-span-4">
              <CategoryCard
                image={getImageUrl(
                  zoneBas?.image,
                  'https://images.unsplash.com/photo-1624206112918-f140f087f9f5?w=800&h=1066&fit=crop'
                )}
                title={zoneBas?.title || 'BAS'}
                subtitle={zoneBas?.subtitle}
                link={zoneBas?.link || '/bas'}
                size="small"
              />
            </div>

            {/* Petite image - ACCESSOIRES */}
            <div className="col-span-6 md:col-span-4">
              <CategoryCard
                image={getImageUrl(
                  zoneAccessoires?.image,
                  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=1066&fit=crop'
                )}
                title={zoneAccessoires?.title || 'ACCESSOIRES'}
                subtitle={zoneAccessoires?.subtitle}
                link={zoneAccessoires?.link || '/accessoires'}
                size="small"
              />
            </div>

            {/* Moyenne image - LOOKBOOKS */}
            <div className="col-span-12 md:col-span-6">
              <CategoryCard
                image={getImageUrl(
                  zoneLookbooks?.image,
                  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&h=900&fit=crop'
                )}
                title={zoneLookbooks?.title || 'LOOKBOOKS'}
                subtitle={zoneLookbooks?.subtitle}
                link={zoneLookbooks?.link || '/lookbooks'}
                size="medium"
              />
            </div>

            {/* Moyenne image - SUSTAINABILITY */}
            <div className="col-span-12 md:col-span-6">
              <CategoryCard
                image={getImageUrl(
                  zoneSustainability?.image,
                  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&h=900&fit=crop'
                )}
                title={zoneSustainability?.title || 'SUSTAINABILITY'}
                subtitle={zoneSustainability?.subtitle}
                link={zoneSustainability?.link || '/sustainability'}
                size="medium"
              />
            </div>
          </div>
        </div>
      </section>

      <FooterMinimal />
    </div>
  )
}

// Composant CategoryCard
interface CategoryCardProps {
  image: string
  title: string
  subtitle?: string
  link: string
  size: 'small' | 'medium' | 'large'
}

function CategoryCard({
  image,
  title,
  subtitle,
  link,
  size,
}: CategoryCardProps) {
  const aspectRatios = {
    small: 'aspect-[3/4]',
    medium: 'aspect-[4/3]',
    large: 'aspect-[3/2]',
  }

  return (
    <Link href={link} className="group block relative overflow-hidden">
      <div className={`relative ${aspectRatios[size]} w-full`}>
        {/* Image */}
        <img
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Overlay noir au hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />

        {/* Titre au centre (visible au hover sur desktop) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6">
            <h2 className="text-section text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              {title}
            </h2>
            {subtitle && (
              <p className="text-body text-white/90 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Titre permanent en bas (version mobile) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500">
          <h3 className="text-product text-white">{title}</h3>
          {subtitle && <p className="text-sm text-white/80 mt-1">{subtitle}</p>}
        </div>
      </div>
    </Link>
  )
}
