// src/app/collections-editoriales/page.tsx - Version corrigée
import Link from 'next/link'
import UnifiedHeader from '@/components/layout/UnifiedHeader'
import { sanityClient } from '@/lib/sanity.client'
import { COLLECTIONS_EDITORIALES_QUERY } from '@/lib/queries'
import { urlFor } from '@/lib/sanity.image'

export const revalidate = 60

interface CollectionEditoriale {
  _id: string
  name: string
  slug: { current: string }
  coverImage?: any // ✅ Nouveau champ
  intro?: any[]
  gallery?: any[]
  seo?: {
    title?: string
    description?: string
  }
}

async function getCollectionsEditoriales(): Promise<CollectionEditoriale[]> {
  try {
    const data = await sanityClient.fetch(COLLECTIONS_EDITORIALES_QUERY)
    return data || []
  } catch (error) {
    console.error('Erreur lors du fetch des collections éditoriales:', error)
    return []
  }
}

export default async function CollectionsEditorialesPage() {
  const collections = await getCollectionsEditoriales()

  return (
    <div className="min-h-screen bg-white">
      <UnifiedHeader variant="default" showNavigation={true} />

      <main className="pt-6">
        {/* Hero */}
        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
              Collections Éditoriales
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez l'univers et l'inspiration derrière nos créations.
              Chaque collection raconte une histoire, porte une vision.
            </p>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="py-12 px-6">
          <div className="container mx-auto">
            {collections.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg mb-8">
                  Aucune collection éditoriale disponible pour le moment.
                </p>
                <p className="text-sm text-gray-400">
                  Consultez nos{' '}
                  <Link
                    href="/collections"
                    className="text-violet-600 hover:text-violet-800"
                  >
                    collections produits
                  </Link>{' '}
                  ou nos{' '}
                  <Link
                    href="/lookbooks"
                    className="text-violet-600 hover:text-violet-800"
                  >
                    lookbooks
                  </Link>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collections.map((collection) => {
                  // ✅ Utiliser coverImage en priorité, sinon fallback sur la première image de la galerie
                  const displayImage =
                    collection.coverImage || collection.gallery?.[0]
                  const description =
                    collection.intro?.[0]?.children?.[0]?.text || ''

                  return (
                    <Link
                      key={collection._id}
                      href={`/collections-editoriales/${collection.slug.current}`}
                      className="group block"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden rounded-lg mb-6">
                        {displayImage ? (
                          <img
                            src={urlFor(displayImage)
                              .width(800)
                              .height(600)
                              .url()}
                            alt={collection.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xl font-light">
                              {collection.name}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                      </div>

                      <h3 className="text-2xl font-light text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">
                        {collection.name}
                      </h3>

                      {description && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {description.substring(0, 120)}
                          {description.length > 120 ? '...' : ''}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-violet-600 group-hover:text-violet-800 font-medium">
                          Découvrir →
                        </span>
                        {collection.gallery && (
                          <span className="text-sm text-gray-500">
                            {collection.gallery.length} images
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
      </main>
    </div>
  )
}
