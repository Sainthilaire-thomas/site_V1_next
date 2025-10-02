// src/app/lookbooks/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
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
  seo?: { title?: string; description?: string; image?: any }
}

async function getLookbook(slug: string): Promise<LookbookDetail | null> {
  try {
    const data = await sanityClient.fetch(LOOKBOOK_QUERY, { slug })
    return data || null
  } catch (e) {
    console.error('Erreur lookbook:', e)
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
  if (!lookbook) return notFound()

  return (
    <div className="min-h-screen bg-white">
      <HeaderMinimal />

      <main>
        {/* Fil d’ariane */}
        <div className="border-b">
          <div className="max-w-[1920px] mx-auto px-8 py-4">
            <Link
              href="/lookbooks"
              className="inline-flex items-center text-black/70 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Lookbooks
            </Link>
          </div>
        </div>

        {/* En-tête */}
        <section className="py-12">
          <div className="max-w-[1920px] mx-auto px-8 text-center">
            <div className="flex items-center justify-center gap-2 text-black/70 mb-3">
              <Calendar className="w-4 h-4" />
              <span className="text-[12px] tracking-wide uppercase">
                {lookbook.season}
              </span>
            </div>
            <h1 className="text-section text-black mb-2">{lookbook.title}</h1>
            {lookbook.images && (
              <p className="text-[15px] tracking-[0.02em] text-grey-medium">
                {lookbook.images.length} looks à découvrir
              </p>
            )}
          </div>
        </section>

        {/* Galerie */}
        {lookbook.images?.length ? (
          <section className="pb-20">
            <div className="max-w-[1920px] mx-auto px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {lookbook.images.map((image, index) => (
                  <div
                    key={index}
                    className={[
                      'relative overflow-hidden group',
                      'aspect-[3/4]',
                      index === 0 ? 'md:col-span-2 md:row-span-2' : '',
                      (index + 1) % 7 === 0 ? 'lg:col-span-2' : '',
                    ].join(' ')}
                  >
                    <img
                      src={urlFor(image).width(1000).height(1334).url()}
                      alt={`${lookbook.title} - Look ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full grid place-items-center">
                      <span className="text-[12px] font-medium text-black">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* CTA & liens */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-[1920px] mx-auto px-8 text-center">
            <h2 className="text-product text-black mb-4">À propos</h2>
            <p className="text-[15px] tracking-[0.02em] text-grey-medium max-w-2xl mx-auto mb-8">
              {lookbook.title} met en scène notre vision pour la saison{' '}
              {lookbook.season.toLowerCase()}.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/collections" className="btn-primary">
                Découvrir les collections
              </Link>
              <Link
                href="/products"
                className="text-[13px] tracking-[0.05em] font-semibold lowercase text-black/70 hover:text-black"
              >
                Tous les produits →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <FooterMinimal />
    </div>
  )
}
