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

  // Helper pour obtenir l'URL d'une image de manière sécurisée avec hotspot
  const getImageUrl = (
    image: any,
    width?: number,
    height?: number,
    fallback: string = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&h=1080&fit=crop'
  ): string => {
    if (!image) return fallback
    try {
      let builder = urlFor(image)

      // Appliquer les dimensions si spécifiées
      if (width) builder = builder.width(width)
      if (height) builder = builder.height(height)

      const url = builder.url()
      return url || fallback
    } catch (error) {
      console.error("Erreur lors de la génération de l'URL image:", error)
      return fallback
    }
  }

  // Helper pour obtenir la position du hotspot
  const getHotspotStyle = (image: any): React.CSSProperties => {
    if (!image?.hotspot) {
      return { objectPosition: 'center' }
    }

    const { x, y } = image.hotspot
    // Convertir les coordonnées Sanity (0-1) en pourcentages CSS
    const percentX = Math.round(x * 100)
    const percentY = Math.round(y * 100)

    return {
      objectPosition: `${percentX}% ${percentY}%`,
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
            src={getImageUrl(hero?.image, 1920, 1080)}
            alt={hero?.title || 'Hero'}
            className="h-full w-full object-cover"
            style={getHotspotStyle(hero?.image)}
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Texte superposé - TITRE CENTRÉ VERTICALEMENT, RESTE EN DESSOUS */}
        <div className="relative z-10 h-full flex flex-col justify-center items-end px-8 md:px-16 lg:px-24">
          <div className="max-w-2xl text-right">
            {/* Titre centré verticalement */}
            <h1
              className="text-hero text-white mb-8"
              style={{ whiteSpace: 'pre-line' }}
            >
              {hero?.title || 'NOUVELLE\nCOLLECTION'}
            </h1>
          </div>

          {/* Sous-titre et bouton en dessous du titre */}
          <div className="max-w-2xl text-right">
            <p className="text-body text-white/90 mb-8 text-lg ml-auto max-w-md">
              {hero?.subtitle ||
                'Découvrez les pièces essentielles de la saison'}
            </p>
            <div className="flex justify-end">
              <Link
                href={hero?.ctaLink || '/products/hauts'}
                className="btn-primary"
              >
                {hero?.ctaLabel || 'DÉCOUVRIR'}
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="text-white w-6 h-6" />
        </div>
      </section>

      {/* Grille de catégories - Asymétrique style Jacquemus */}
      <section className="bg-white relative z-10">
        <div className="max-w-[1920px] mx-auto">
          <div className="grid grid-cols-12">
            {/* Grande image - HAUTS */}
            <div className="col-span-12 md:col-span-8 md:row-span-2">
              <CategoryCard
                image={getImageUrl(zoneHauts?.image, 1600, 1200)}
                imageData={zoneHauts?.image}
                title={zoneHauts?.title || 'HAUTS'}
                subtitle={zoneHauts?.subtitle}
                link={zoneHauts?.link || '/hauts'}
                size="large"
              />
            </div>

            {/* Petite image - BAS */}
            <div className="col-span-6 md:col-span-4">
              <CategoryCard
                image={getImageUrl(zoneBas?.image, 800, 1066)}
                imageData={zoneBas?.image}
                title={zoneBas?.title || 'BAS'}
                subtitle={zoneBas?.subtitle}
                link={zoneBas?.link || '/bas'}
                size="small"
              />
            </div>

            {/* Petite image - ACCESSOIRES */}
            <div className="col-span-6 md:col-span-4">
              <CategoryCard
                image={getImageUrl(zoneAccessoires?.image, 800, 1066)}
                imageData={zoneAccessoires?.image}
                title={zoneAccessoires?.title || 'ACCESSOIRES'}
                subtitle={zoneAccessoires?.subtitle}
                link={zoneAccessoires?.link || '/accessoires'}
                size="small"
              />
            </div>

            {/* Moyenne image - LOOKBOOKS */}
            <div className="col-span-12 md:col-span-6">
              <CategoryCard
                image={getImageUrl(zoneLookbooks?.image, 1200, 900)}
                imageData={zoneLookbooks?.image}
                title={zoneLookbooks?.title || 'LOOKBOOKS'}
                subtitle={zoneLookbooks?.subtitle}
                link={zoneLookbooks?.link || '/lookbooks'}
                size="medium"
              />
            </div>

            {/* Moyenne image - SUSTAINABILITY */}
            <div className="col-span-12 md:col-span-6">
              <CategoryCard
                image={getImageUrl(zoneSustainability?.image, 1200, 900)}
                imageData={zoneSustainability?.image}
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
  imageData: any
  title: string
  subtitle?: string
  link: string
  size: 'small' | 'medium' | 'large'
}

function CategoryCard({
  image,
  imageData,
  title,
  subtitle,
  link,
  size,
}: CategoryCardProps) {
  // Hauteurs fixes pour aligner les images horizontalement
  const heights = {
    small: 'h-[50vh]',
    medium: 'h-[50vh]',
    large: 'h-[100vh]',
  }

  // Calcul du hotspot pour cette image
  const getHotspotStyle = (): React.CSSProperties => {
    if (!imageData?.hotspot) {
      return { objectPosition: 'center' }
    }

    const { x, y } = imageData.hotspot
    const percentX = Math.round(x * 100)
    const percentY = Math.round(y * 100)

    return {
      objectPosition: `${percentX}% ${percentY}%`,
    }
  }

  return (
    <Link href={link} className="group block relative overflow-hidden">
      <div className={`relative ${heights[size]} w-full`}>
        {/* Image avec hotspot appliqué */}
        <img
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={getHotspotStyle()}
        />

        {/* Overlay noir au hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />

        {/* Titre aligné à droite et centré verticalement - visible au HOVER uniquement */}
        <div className="absolute inset-0 flex items-center justify-end pr-8 md:pr-12 lg:pr-16">
          <div className="text-right opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
            <h2
              className="text-section text-white"
              style={{
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-body text-white/90 mt-2 max-w-md ml-auto">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
