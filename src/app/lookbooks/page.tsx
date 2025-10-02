// src/app/lookbooks/page.tsx
import Link from 'next/link'
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import { sanityClient } from '@/lib/sanity.client'
import { LOOKBOOKS_QUERY } from '@/lib/queries'
import { urlFor } from '@/lib/sanity.image'

export const revalidate = 60

interface Lookbook {
  _id: string
  title: string
  season: string
  slug: { current: string }
  coverImage?: any
  images?: any[]
  seo?: { title?: string; description?: string }
}

async function getLookbooks(): Promise<Lookbook[]> {
  try {
    const data = await sanityClient.fetch(LOOKBOOKS_QUERY)
    return data || []
  } catch (e) {
    console.error('Erreur lookbooks:', e)
    return []
  }
}

export default async function LookbooksPage() {
  const lookbooks = await getLookbooks()

  return (
    <div className="min-h-screen bg-white">
      <HeaderMinimal />

      <main>
        {/* Hero sobre aligné avec le site */}
        <section className="py-16">
          <div className="max-w-[1920px] mx-auto px-8 text-center">
            <h1 className="text-section text-black mb-3">Lookbooks</h1>
            <p className="text-[15px] tracking-[0.02em] text-grey-medium">
              Source d’inspiration & façons de porter nos pièces.
            </p>
          </div>
        </section>

        {/* Grille */}
        <section className="pb-24">
          <div className="max-w-[1920px] mx-auto px-8">
            {lookbooks.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-grey-medium text-[15px] mb-6">
                  Aucun lookbook disponible pour le moment.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link href="/collections" className="btn-primary">
                    Voir les collections
                  </Link>
                  <Link
                    href="/products"
                    className="text-[13px] tracking-[0.05em] font-semibold lowercase text-black/70 hover:text-black"
                  >
                    Tous les produits →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {lookbooks.map((lb) => {
                  const displayImage = lb.coverImage || lb.images?.[0]
                  return (
                    <Link
                      key={lb._id}
                      href={`/lookbooks/${lb.slug.current}`}
                      className="group block"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden">
                        {displayImage ? (
                          <img
                            src={urlFor(displayImage)
                              .width(900)
                              .height(1200)
                              .url()}
                            alt={lb.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100" />
                        )}

                        {/* Léger overlay au hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                        {/* Légende bas */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
                          <h3 className="text-product text-white">
                            {lb.title}
                          </h3>
                          <p className="text-[12px] tracking-wide text-white/80 mt-1">
                            {lb.season}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[13px] tracking-[0.05em] font-semibold lowercase text-black/70 group-hover:text-black transition-colors">
                          découvrir →
                        </span>
                        {lb.images && (
                          <span className="text-[12px] text-grey-medium">
                            {lb.images.length} looks
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

      <FooterMinimal />
    </div>
  )
}
