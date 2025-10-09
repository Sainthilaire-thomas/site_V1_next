// src/app/impact/page.tsx
import { sanityClient } from '@/lib/sanity.client'
import { urlFor } from '@/lib/sanity.image'
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import Link from 'next/link'
import Image from 'next/image'

// Query GROQ pour récupérer toutes les données de la page Impact
const query = `*[_type == "impactPage" && _id == "impact-singleton"][0]{
  seo,
  hero,
  commitments,
  materials,
  impact,
  process,
  certifications,
  workshop,
  movement,
  cta
}`

export default async function ImpactPage() {
  const data = await sanityClient.fetch(query)

  // Fallback si pas de données
  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Page Impact en cours de configuration...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <HeaderMinimal />

      {/* Hero Section */}
      {/* Hero Section */}
      {data.hero && (
        <section className="relative h-screen w-full">
          <div className="absolute inset-0">
            {data.hero.image && (
              <Image
                src={urlFor(data.hero.image).width(1920).height(1080).url()}
                alt={data.hero.title || 'Impact'}
                fill
                className="object-cover"
                priority
              />
            )}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10 h-full flex items-center justify-end px-8 md:px-16 lg:px-24">
            <div className="max-w-2xl text-right text-white">
              <h1 className="text-hero mb-8">{data.hero.title}</h1>
              <p className="text-body text-white/90 text-xl leading-relaxed">
                {data.hero.subtitle}
              </p>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </section>
      )}

      {/* Section 1: Nos engagements */}
      {data.commitments && (
        <section className="py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-section mb-8">
                  {data.commitments.sectionTitle}
                </h2>
                <div className="space-y-8">
                  {data.commitments.items?.map((item: any, idx: number) => (
                    <CommitmentItem
                      key={idx}
                      number={item.number}
                      title={item.title}
                      description={item.description}
                    />
                  ))}
                </div>
              </div>

              <div className="aspect-[3/4] bg-grey-light overflow-hidden relative">
                {data.commitments.image && (
                  <Image
                    src={urlFor(data.commitments.image)
                      .width(800)
                      .height(1066)
                      .url()}
                    alt="Nos engagements"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 2: Nos matières */}
      {data.materials && (
        <section className="py-24 px-8 bg-grey-light">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-section mb-16 text-center">
              {data.materials.sectionTitle}
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {data.materials.items?.map((item: any, idx: number) => (
                <MaterialCard
                  key={idx}
                  image={
                    item.image
                      ? urlFor(item.image).width(800).height(800).url()
                      : ''
                  }
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Notre impact */}
      {data.impact && (
        <section className="py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-section mb-16 text-center">
              {data.impact.sectionTitle} {data.impact.year}
            </h2>

            <div className="grid md:grid-cols-4 gap-12">
              {data.impact.stats?.map((stat: any, idx: number) => (
                <ImpactStat key={idx} number={stat.number} label={stat.label} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 4: Le processus */}
      {data.process && (
        <section className="py-24 px-8 bg-grey-light">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-section mb-16 text-center">
              {data.process.sectionTitle}
            </h2>

            <div className="space-y-16">
              {data.process.steps?.map((step: any, idx: number) => (
                <ProcessStep
                  key={idx}
                  number={step.number}
                  title={step.title}
                  description={step.description}
                  image={
                    step.image
                      ? urlFor(step.image).width(1200).height(800).url()
                      : ''
                  }
                  reverse={idx % 2 !== 0}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 5: Certifications */}
      {data.certifications && (
        <section className="py-24 px-8 bg-black text-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-section mb-16 text-center">
              {data.certifications.sectionTitle}
            </h2>

            <div className="flex flex-wrap justify-center gap-16">
              {data.certifications.badges?.map((badge: any, idx: number) => (
                <CertificationBadge key={idx} name={badge.name} />
              ))}
            </div>

            {data.certifications.description && (
              <p className="text-body text-white/70 text-center mt-12 max-w-2xl mx-auto">
                {data.certifications.description}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Section 6: Notre atelier */}
      {data.workshop && (
        <section className="relative h-[80vh] w-full">
          <div className="absolute inset-0">
            {data.workshop.image && (
              <Image
                src={urlFor(data.workshop.image).width(1920).height(1080).url()}
                alt={data.workshop.title}
                fill
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/30" />
          </div>

          <div className="relative z-10 flex h-full items-center justify-center px-8">
            <div className="max-w-3xl text-center text-white">
              <h2 className="text-section mb-6">{data.workshop.title}</h2>
              <p className="text-body text-white/90 text-lg leading-relaxed">
                {data.workshop.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Section 7: Rejoignez le mouvement */}
      {data.movement && (
        <section className="py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-section mb-8">
                  {data.movement.sectionTitle}
                </h2>
                <p className="text-body text-grey-medium mb-8 leading-relaxed">
                  {data.movement.description}
                </p>

                <div className="space-y-6">
                  {data.movement.actions?.map((action: any, idx: number) => (
                    <ActionItem
                      key={idx}
                      title={action.title}
                      description={action.description}
                    />
                  ))}
                </div>
              </div>

              <div className="aspect-square bg-grey-light overflow-hidden relative">
                {data.movement.image && (
                  <Image
                    src={urlFor(data.movement.image)
                      .width(800)
                      .height(800)
                      .url()}
                    alt="Rejoignez le mouvement"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      {data.cta && (
        <section className="py-24 px-8 bg-grey-light">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-section mb-8">{data.cta.title}</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {data.cta.primaryButton && (
                <Link
                  href={data.cta.primaryButton.link}
                  className="btn-primary"
                >
                  {data.cta.primaryButton.text}
                </Link>
              )}
              {data.cta.secondaryButton && (
                <Link
                  href={data.cta.secondaryButton.link}
                  className="btn-secondary"
                >
                  {data.cta.secondaryButton.text}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      <FooterMinimal />
    </div>
  )
}

// ========== COMPOSANTS ==========

function CommitmentItem({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="flex gap-6">
      <span className="text-section text-grey-light flex-shrink-0">
        {number}
      </span>
      <div>
        <h3 className="text-product mb-2">{title}</h3>
        <p className="text-body text-grey-medium leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}

function MaterialCard({
  image,
  title,
  description,
}: {
  image: string
  title: string
  description: string
}) {
  return (
    <div className="group">
      <div className="aspect-square mb-4 bg-white overflow-hidden relative">
        {image && (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )}
      </div>
      <h3 className="text-product mb-2">{title}</h3>
      <p className="text-body text-grey-medium">{description}</p>
    </div>
  )
}

function ImpactStat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-hero text-black mb-2">{number}</div>
      <p className="text-product text-grey-medium">{label}</p>
    </div>
  )
}

function ProcessStep({
  number,
  title,
  description,
  image,
  reverse,
}: {
  number: string
  title: string
  description: string
  image: string
  reverse: boolean
}) {
  return (
    <div
      className={`grid md:grid-cols-2 gap-8 items-center ${
        reverse ? 'md:grid-flow-dense' : ''
      }`}
    >
      <div className={reverse ? 'md:col-start-2' : ''}>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-section text-grey-medium">{number}</span>
          <h3 className="text-product">{title}</h3>
        </div>
        <p className="text-body text-grey-medium leading-relaxed">
          {description}
        </p>
      </div>

      <div
        className={`aspect-[4/3] bg-white overflow-hidden relative ${reverse ? 'md:col-start-1' : ''}`}
      >
        {image && (
          <Image src={image} alt={title} fill className="object-cover" />
        )}
      </div>
    </div>
  )
}

function CertificationBadge({ name }: { name: string }) {
  return (
    <div className="w-32 h-32 border border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors">
      <span className="text-product">{name}</span>
    </div>
  )
}

function ActionItem({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="border-l-2 border-black pl-6">
      <h4 className="text-product mb-2">{title}</h4>
      <p className="text-body text-grey-medium">{description}</p>
    </div>
  )
}
