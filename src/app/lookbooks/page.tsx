// src/app/lookbooks/page.tsx - Version corrigée
import Link from 'next/link'
import UnifiedHeader from '@/components/layout/UnifiedHeader'
import { sanityClient } from '@/lib/sanity.client'
import { LOOKBOOKS_QUERY } from '@/lib/queries'
import { urlFor } from '@/lib/sanity.image'

export const revalidate = 60

interface Lookbook {
  _id: string
  title: string
  season: string
  slug: { current: string }
  coverImage?: any // ✅ Nouveau champ
  images?: any[]
  seo?: {
    title?: string
    description?: string
  }
}

async function getLookbooks(): Promise<Lookbook[]> {
  try {
    const data = await sanityClient.fetch(LOOKBOOKS_QUERY)
    return data || []
  } catch (error) {
    console.error('Erreur lors du fetch des lookbooks:', error)
    return []
  }
}

export default async function LookbooksPage() {
  const lookbooks = await getLookbooks()

  return (
    <div className="min-h-screen bg-white">
      <UnifiedHeader variant="default" showNavigation={true} />

      <main className="pt-6">
        {/* Hero */}
        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
              Lookbooks
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Source d'inspiration et de style. Découvrez comment porter et
              associer nos pièces à travers nos lookbooks saisonniers.
            </p>
          </div>
        </section>

        {/* Lookbooks Grid */}
        <section className="py-12 px-6">
          <div className="container mx-auto">
            {lookbooks.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg mb-8">
                  Aucun lookbook disponible pour le moment.
                </p>
                <p className="text-sm text-gray-400">
                  Consultez nos{' '}
                  <Link
                    href="/collections"
                    className="text-violet-600 hover:text-violet-800"
                  >
                    collections
                  </Link>{' '}
                  ou nos{' '}
                  <Link
                    href="/collections-editoriales"
                    className="text-violet-600 hover:text-violet-800"
                  >
                    collections éditoriales
                  </Link>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {lookbooks.map((lookbook) => {
                  // ✅ Utiliser coverImage en priorité, sinon fallback sur la première image
                  const displayImage =
                    lookbook.coverImage || lookbook.images?.[0]

                  return (
                    <Link
                      key={lookbook._id}
                      href={`/lookbooks/${lookbook.slug.current}`}
                      className="group block"
                    >
                      <div className="aspect-[3/4] relative overflow-hidden rounded-lg mb-6">
                        {displayImage ? (
                          <img
                            src={urlFor(displayImage)
                              .width(600)
                              .height(800)
                              .url()}
                            alt={lookbook.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <div className="text-center">
                              <span className="text-gray-400 text-xl font-light block mb-2">
                                {lookbook.title}
                              </span>
                              <span className="text-gray-300 text-sm">
                                {lookbook.season}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>

                        {/* Overlay avec titre */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                          <h3 className="text-white text-xl font-light mb-1">
                            {lookbook.title}
                          </h3>
                          <p className="text-white/80 text-sm">
                            {lookbook.season}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-violet-600 group-hover:text-violet-800 font-medium">
                          Découvrir →
                        </span>
                        {lookbook.images && (
                          <span className="text-sm text-gray-500">
                            {lookbook.images.length} looks
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Section inspiration */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              Style et Inspiration
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Nos lookbooks sont conçus pour vous inspirer et vous montrer les
              infinies possibilités de style avec nos créations.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/collections"
                className="px-6 py-3 bg-violet-600 text-white hover:bg-violet-700 transition-colors rounded-lg"
              >
                Voir les collections
              </Link>
              <Link
                href="/products"
                className="px-6 py-3 border border-gray-300 text-gray-700 hover:border-violet-600 hover:text-violet-600 transition-colors rounded-lg"
              >
                Tous les produits
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

// ================================================================================================
