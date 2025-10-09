// src/app/silhouettes/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import { sanityClient } from '@/lib/sanity.client'
import { LOOKBOOK_QUERY } from '@/lib/queries'
import { urlFor } from '@/lib/sanity.image'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 60

interface LookbookDetail {
  _id: string
  title: string
  subtitle?: string
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

export default async function SilhouetteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const lookbook = await getLookbook(slug)
  if (!lookbook) return notFound()

  return (
    <>
      <HeaderMinimal />

      {/* Fil d'ariane + Titre */}
      <div className="bg-white">
        <div className="border-b">
          <div className="max-w-[1920px] mx-auto px-8 py-4">
            <Link
              href="/silhouettes"
              className="inline-flex items-center text-black/70 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              .silhouettes
            </Link>
          </div>
        </div>
        <section className="py-8">
          <div className="max-w-[1920px] mx-auto px-8 text-right">
            <h1
              className="text-[32px] md:text-[48px] text-black"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              {lookbook.title}
            </h1>
            {lookbook.subtitle && (
              <p className="mt-4 text-[15px] tracking-[0.02em] text-grey-medium">
                {lookbook.subtitle}
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Galerie pleine largeur */}
      {lookbook.images?.length ? (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
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
            </div>
          ))}
        </div>
      ) : null}

      {/* CTA */}
      <div className="bg-white py-8">
        <div className="max-w-[1920px] mx-auto px-8 text-center">
          <Link
            href="/products"
            className="text-[13px] tracking-[0.05em] font-semibold lowercase text-black/70 hover:text-black"
          >
            Tous les produits →
          </Link>
        </div>
      </div>

      <FooterMinimal />
    </>
  )
}
