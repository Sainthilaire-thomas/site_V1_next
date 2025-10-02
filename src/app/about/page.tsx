// src/app/about/page.tsx — Version alignée, sans CTA, image carrée
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import RichTextRenderer from '@/components/common/RichTextRenderer'
import { sanityClient } from '@/lib/sanity.client'
import { PAGE_QUERY } from '@/lib/queries'

export const revalidate = 60

interface PageData {
  _id: string
  title: string
  slug: { current: string }
  content?: any[]
  seo?: { title?: string; description?: string; image?: any }
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
      <HeaderMinimal />

      <main>
        {/* Hero sobre aligné */}
        <section className="py-16">
          <div className="max-w-[1920px] mx-auto px-8 text-center">
            <h1 className="text-section text-black mb-3">
              {pageData?.title || 'À propos'}
            </h1>
            {pageData?.seo?.description ? (
              <p className="text-[15px] tracking-[0.02em] text-grey-medium max-w-3xl mx-auto">
                {pageData.seo.description}
              </p>
            ) : (
              <p className="text-[15px] tracking-[0.02em] text-grey-medium max-w-3xl mx-auto">
                .blancherenaudin est née de la passion pour la mode
                contemporaine et l’artisanat d’exception. Chaque pièce est
                pensée pour sublimer la femme moderne.
              </p>
            )}
          </div>
        </section>

        {/* Contenu Sanity (si présent) */}
        {pageData?.content ? (
          <section className="pb-20">
            <div className="max-w-[1920px] mx-auto px-8">
              {/* On évite toute classe rounded sur un parent de médias */}
              <div className="max-w-3xl mx-auto prose prose-neutral">
                <RichTextRenderer
                  content={pageData.content}
                  className="text-[15px] tracking-[0.02em] text-black/80"
                />
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Fallback Histoire — image carrée sans coins arrondis */}
            <section className="py-20 bg-gray-50">
              <div className="max-w-[1920px] mx-auto px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <h2 className="text-product text-black mb-6">
                      Notre histoire
                    </h2>
                    <div className="space-y-5 text-[15px] tracking-[0.02em] text-grey-medium">
                      <p>
                        Fondée en 2020, .blancherenaudin puise son inspiration
                        dans l’héritage de la haute couture française tout en
                        embrassant une vision résolument contemporaine.
                      </p>
                      <p>
                        Notre atelier parisien perpétue des techniques de
                        savoir-faire adaptées aux besoins de la femme
                        d’aujourd’hui qui recherche l’élégance sans compromis.
                      </p>
                      <p>
                        Chaque création est le fruit d’un travail minutieux,
                        entre innovation et tradition.
                      </p>
                    </div>
                  </div>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&h=1200&fit=crop"
                      alt="Atelier .blancherenaudin"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Fallback Philosophie */}
            <section className="py-20">
              <div className="max-w-[1920px] mx-auto px-8 text-center">
                <h2 className="text-product text-black mb-10">
                  Notre philosophie
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
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
                    <div key={item.title} className="px-2">
                      <h3 className="text-[16px] font-semibold tracking-[0.05em] lowercase text-black mb-3">
                        {item.title}
                      </h3>
                      <p className="text-[15px] tracking-[0.02em] text-grey-medium">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <FooterMinimal />
    </div>
  )
}
