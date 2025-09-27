// src/app/lookbooks/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import UnifiedHeader from '@/components/layout/UnifiedHeader'
import { sanityClient } from '@/lib/sanity.client'
import { LOOKBOOK_QUERY } from '@/lib/queries'
import { urlFor } from '@/lib/sanity.image'
import { ArrowLeft, Calendar } from 'lucide-react'

export const revalidate = 60

interface LookbookDetail {
  _id: string
  title: string
  season: string
  slug: { current: string }
  images?: any[]
  seo?: {
    title?: string
    description?: string
    image?: any
  }
}

async function getLookbook(slug: string): Promise<LookbookDetail | null> {
  try {
    const data = await sanityClient.fetch(LOOKBOOK_QUERY, { slug })
    return data || null
  } catch (error) {
    console.error('Erreur lors du fetch du lookbook:', error)
    return null
  }
}

export default async function LookbookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const lookbook = await getLookbook(slug)

  if (!lookbook) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <UnifiedHeader variant="default" showNavigation={true} />

      <main className="pt-6">
        {/* Breadcrumb */}
        <div className="px-6 py-4 border-b">
          <div className="container mx-auto">
            <Link
              href="/lookbooks"
              className="inline-flex items-center text-violet-600 hover:text-violet-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Lookbooks
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="py-12 px-6">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 text-violet-600 mb-4">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wide">
                  {lookbook.season}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-8">
                {lookbook.title}
              </h1>

              {lookbook.images && (
                <p className="text-lg text-gray-600">
                  {lookbook.images.length} looks à découvrir
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Images Gallery */}
        {lookbook.images && lookbook.images.length > 0 && (
          <section className="py-12 px-6">
            <div className="container mx-auto">
              {/* Layout responsive pour les images */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lookbook.images.map((image, index) => (
                  <div
                    key={index}
                    className={`
                      relative overflow-hidden rounded-lg group
                      ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}
                      ${(index + 1) % 7 === 0 ? 'lg:col-span-2' : ''}
                      aspect-[3/4]
                    `}
                  >
                    <img
                      src={urlFor(image).width(800).height(1066).url()}
                      alt={`${lookbook.title} - Look ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Numéro du look */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-900">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Section informations */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-light text-gray-900 mb-6">
                À propos de ce lookbook
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {lookbook.title} présente une sélection de looks pour la saison{' '}
                {lookbook.season.toLowerCase()}, mettant en valeur l'art de
                porter et d'associer nos créations. Chaque look raconte une
                histoire et propose une vision du style contemporain.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/collections"
                  className="px-6 py-3 bg-violet-600 text-white hover:bg-violet-700 transition-colors rounded-lg"
                >
                  Découvrir les collections
                </Link>
                <Link
                  href="/products"
                  className="px-6 py-3 border border-gray-300 text-gray-700 hover:border-violet-600 hover:text-violet-600 transition-colors rounded-lg"
                >
                  Voir tous les produits
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation vers autres lookbooks */}
        <section className="py-16 px-6">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl font-light text-gray-900 mb-8">
              Autres lookbooks
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/lookbooks"
                className="px-6 py-3 border border-gray-300 text-gray-700 hover:border-violet-600 hover:text-violet-600 transition-colors rounded-lg"
              >
                Tous les lookbooks
              </Link>
              <Link
                href="/collections-editoriales"
                className="px-6 py-3 border border-gray-300 text-gray-700 hover:border-violet-600 hover:text-violet-600 transition-colors rounded-lg"
              >
                Collections éditoriales
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
