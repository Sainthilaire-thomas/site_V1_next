// src/app/silhouettes/page.tsx
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

export default async function SilhouettesPage() {
  const lookbooks = await getLookbooks()

  return (
    <div className="min-h-screen bg-white">
      <HeaderMinimal />

      <main>
        {/* Hero */}
        <section className="py-16">
          <div className="max-w-[1920px] mx-auto px-8 text-center">
            <h1 className="text-[11px] tracking-[0.15em] lowercase text-black/70">
              .silhouettes
            </h1>
          </div>
        </section>

        {/* Défilement horizontal */}
        <section className="pb-24">
          <div className="max-w-[1920px] mx-auto px-8">
            {lookbooks.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-grey-medium text-[15px] mb-6">
                  Aucune silhouette disponible pour le moment.
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
              <div className="flex gap-0 overflow-x-auto snap-x snap-mandatory pb-4">
                {lookbooks.map((lb) => {
                  const displayImage = lb.coverImage || lb.images?.[0]
                  return (
                    <Link
                      key={lb._id}
                      href={`/silhouettes/${lb.slug.current}`}
                      className="group block flex-none snap-start"
                    >
                      <div className="relative w-[400px] aspect-[3/4] overflow-hidden">
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

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                        {/* Titre normal, centré verticalement, aligné à droite */}
                        <div className="absolute inset-y-0 right-6 flex items-center">
                          <h3
                            className="text-[28px] text-white text-right"
                            style={{ fontFamily: 'var(--font-archivo-black)' }}
                          >
                            {lb.title}
                          </h3>
                        </div>
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
