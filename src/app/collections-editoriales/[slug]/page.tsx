// src/app/collections-editoriales/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import UnifiedHeader from '@/components/layout/UnifiedHeader'
import { sanityClient } from '@/lib/sanity.client'
import { COLLECTION_EDITORIALE_QUERY } from '@/lib/queries'
import { urlFor } from '@/lib/sanity.image'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 60

interface CollectionEditorialeDetail {
  _id: string
  name: string
  slug: { current: string }
  intro?: any[]
  gallery?: any[]
  seo?: {
    title?: string
    description?: string
    image?: any
  }
}

async function getCollectionEditoriale(
  slug: string
): Promise<CollectionEditorialeDetail | null> {
  try {
    const data = await sanityClient.fetch(COLLECTION_EDITORIALE_QUERY, { slug })
    return data || null
  } catch (error) {
    console.error('Erreur lors du fetch de la collection éditoriale:', error)
    return null
  }
}

// Composant pour rendre le contenu riche de Sanity
function RichTextRenderer({ content }: { content: any[] }) {
  if (!content) return null

  return (
    <div className="prose prose-lg max-w-none">
      {content.map((block, index) => {
        if (block._type === 'block') {
          const children = block.children?.map(
            (child: any, childIndex: number) => (
              <span
                key={childIndex}
                className={
                  child.marks?.includes('strong') ? 'font-semibold' : ''
                }
              >
                {child.text}
              </span>
            )
          )

          switch (block.style) {
            case 'h2':
              return (
                <h2
                  key={index}
                  className="text-3xl font-light text-gray-900 mb-6"
                >
                  {children}
                </h2>
              )
            case 'h3':
              return (
                <h3
                  key={index}
                  className="text-2xl font-light text-gray-900 mb-4"
                >
                  {children}
                </h3>
              )
            default:
              return (
                <p key={index} className="text-gray-600 mb-6 leading-relaxed">
                  {children}
                </p>
              )
          }
        }

        if (block._type === 'image') {
          return (
            <div key={index} className="my-8">
              <img
                src={urlFor(block).width(800).height(600).url()}
                alt={block.alt || ''}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

export default async function CollectionEditorialeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collection = await getCollectionEditoriale(slug)

  if (!collection) {
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
              href="/collections-editoriales"
              className="inline-flex items-center text-violet-600 hover:text-violet-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Collections éditoriales
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="py-12 px-6">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
                {collection.name}
              </h1>

              {collection.intro && (
                <div className="text-lg text-gray-600 mb-12">
                  <RichTextRenderer content={collection.intro} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Gallery */}
        {collection.gallery && collection.gallery.length > 0 && (
          <section className="py-12 px-6">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collection.gallery.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-[4/5] relative overflow-hidden rounded-lg group"
                  >
                    <img
                      src={urlFor(image).width(800).height(1000).url()}
                      alt={`${collection.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Navigation vers autres collections */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl font-light text-gray-900 mb-8">
              Découvrir plus
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/collections-editoriales"
                className="px-6 py-3 border border-gray-300 text-gray-700 hover:border-violet-600 hover:text-violet-600 transition-colors rounded-lg"
              >
                Toutes les collections éditoriales
              </Link>
              <Link
                href="/lookbooks"
                className="px-6 py-3 border border-gray-300 text-gray-700 hover:border-violet-600 hover:text-violet-600 transition-colors rounded-lg"
              >
                Voir les lookbooks
              </Link>
              <Link
                href="/collections"
                className="px-6 py-3 bg-violet-600 text-white hover:bg-violet-700 transition-colors rounded-lg"
              >
                Collections produits
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
