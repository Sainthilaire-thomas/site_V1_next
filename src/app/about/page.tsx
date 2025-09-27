// src/app/about/page.tsx - Version avec Sanity
import Link from 'next/link'
import UnifiedHeader from '@/components/layout/UnifiedHeader'
import RichTextRenderer from '@/components/common/RichTextRenderer'
import { sanityClient } from '@/lib/sanity.client'
import { PAGE_QUERY } from '@/lib/queries'

export const revalidate = 60

interface PageData {
  _id: string
  title: string
  slug: { current: string }
  content?: any[]
  seo?: {
    title?: string
    description?: string
    image?: any
  }
}

async function getAboutPage(): Promise<PageData | null> {
  try {
    const data = await sanityClient.fetch(PAGE_QUERY, { slug: 'a-propos' })
    return data || null
  } catch (error) {
    console.error('Erreur lors du fetch de la page À propos:', error)
    return null
  }
}

export default async function AboutPage() {
  const pageData = await getAboutPage()

  return (
    <div className="min-h-screen bg-white">
      <UnifiedHeader variant="default" showNavigation={true} />

      <main className="pt-6">
        {/* Hero */}
        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
              {pageData?.title || 'À Propos'}
            </h1>
            {pageData?.seo?.description && (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {pageData.seo.description}
              </p>
            )}
            {!pageData?.seo?.description && (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                .blancherenaudin est née de la passion pour la mode
                contemporaine et l'artisanat d'exception. Chaque pièce est
                pensée pour sublimer la femme moderne.
              </p>
            )}
          </div>
        </section>

        {/* Contenu depuis Sanity */}
        {pageData?.content ? (
          <section className="py-12 px-6">
            <div className="container mx-auto max-w-4xl">
              <RichTextRenderer
                content={pageData.content}
                className="text-gray-600"
              />
            </div>
          </section>
        ) : (
          // Contenu de fallback si pas de données Sanity
          <>
            {/* Histoire */}
            <section className="py-20 px-6 bg-gray-50">
              <div className="container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <h2 className="text-3xl font-light text-gray-900 mb-8">
                      Notre Histoire
                    </h2>
                    <div className="space-y-6 text-gray-600 leading-relaxed">
                      <p>
                        Fondée en 2020, .blancherenaudin puise son inspiration
                        dans l'héritage de la haute couture française tout en
                        embrassant une vision résolument contemporaine.
                      </p>
                      <p>
                        Notre atelier parisien perpétue les techniques
                        traditionnelles du savoir-faire français, adaptées aux
                        besoins de la femme d'aujourd'hui qui recherche
                        l'élégance sans compromis.
                      </p>
                      <p>
                        Chaque création est le fruit d'un travail minutieux où
                        se rencontrent innovation et tradition, modernité et
                        intemporalité.
                      </p>
                    </div>
                  </div>
                  <div className="aspect-[4/5] rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=800&fit=crop"
                      alt="Atelier .blancherenaudin"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Philosophie */}
            <section className="py-20 px-6">
              <div className="container mx-auto text-center">
                <h2 className="text-3xl font-light text-gray-900 mb-12">
                  Notre Philosophie
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      title: 'Savoir-faire',
                      description:
                        'Chaque pièce est confectionnée dans notre atelier parisien par des artisans expérimentés.',
                    },
                    {
                      title: 'Qualité',
                      description:
                        'Nous sélectionnons avec soin les plus belles matières pour garantir durabilité et confort.',
                    },
                    {
                      title: 'Élégance',
                      description:
                        'Nos créations subliment la silhouette féminine avec raffinement et modernité.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="p-8">
                      <h3 className="text-xl font-medium text-gray-900 mb-4">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* CTA */}
        <section className="py-20 px-6 bg-violet-50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              Découvrez nos Collections
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Explorez l'univers .blancherenaudin et trouvez les pièces qui
              révéleront votre style unique.
            </p>
            <Link
              href="/collections"
              className="inline-flex items-center px-8 py-3 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
            >
              Voir les Collections
            </Link>
          </div>
        </section>

        {/* Message pour l'admin */}
        {!pageData && (
          <section className="py-8 px-6 bg-yellow-50 border-t border-yellow-200">
            <div className="container mx-auto text-center">
              <p className="text-sm text-yellow-800">
                <strong>Admin :</strong> Créez une page "À Propos" dans Sanity
                Studio avec le slug "a-propos" pour personnaliser ce contenu.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
