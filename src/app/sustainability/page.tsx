// src/app/sustainability/page.tsx
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import Link from 'next/link'

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderMinimal />

      {/* Hero image avec manifeste */}
      <section className="relative h-screen w-full">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&h=1080&fit=crop"
            alt="Sustainability"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 flex h-full items-center justify-center px-8">
          <div className="max-w-3xl text-center text-white">
            <h1 className="text-hero mb-8">
              MODE
              <br />
              RESPONSABLE
            </h1>
            <p className="text-body text-white/90 text-xl leading-relaxed">
              Notre engagement pour une mode plus durable, respectueuse des
              artisans et de l'environnement.
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

      {/* Section 1: Nos engagements */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-section mb-8">NOS ENGAGEMENTS</h2>
              <div className="space-y-8">
                <CommitmentItem
                  number="01"
                  title="Matières responsables"
                  description="100% de nos tissus sont certifiés bio ou recyclés"
                />
                <CommitmentItem
                  number="02"
                  title="Production locale"
                  description="Fabrication française dans nos ateliers partenaires"
                />
                <CommitmentItem
                  number="03"
                  title="Transparence totale"
                  description="Traçabilité complète de nos produits"
                />
                <CommitmentItem
                  number="04"
                  title="Économie circulaire"
                  description="Programme de reprise et recyclage de vos pièces"
                />
              </div>
            </div>

            <div className="aspect-[3/4] bg-grey-light overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1066&fit=crop"
                alt="Nos engagements"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Nos matières */}
      <section className="py-24 px-8 bg-grey-light">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-section mb-16 text-center">NOS MATIÈRES</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <MaterialCard
              image="https://images.unsplash.com/photo-1615912227703-64f98f437fc7?w=800&h=800&fit=crop"
              title="COTON BIO"
              description="Cultivé sans pesticides, certifié GOTS"
            />
            <MaterialCard
              image="https://images.unsplash.com/photo-1544441892-794166f1e3be?w=800&h=800&fit=crop"
              title="LIN EUROPÉEN"
              description="Cultivé en France et Belgique"
            />
            <MaterialCard
              image="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop"
              title="LAINE RESPONSABLE"
              description="Certifiée RWS, traçabilité garantie"
            />
          </div>
        </div>
      </section>

      {/* Section 3: Notre impact */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-section mb-16 text-center">
            NOTRE IMPACT EN 2024
          </h2>

          <div className="grid md:grid-cols-4 gap-12">
            <ImpactStat number="100%" label="Matières responsables" />
            <ImpactStat number="-40%" label="Émissions CO2" />
            <ImpactStat number="15" label="Artisans partenaires" />
            <ImpactStat number="1000+" label="Pièces recyclées" />
          </div>
        </div>
      </section>

      {/* Section 4: Le processus - Timeline */}
      <section className="py-24 px-8 bg-grey-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-section mb-16 text-center">NOTRE PROCESSUS</h2>

          <div className="space-y-16">
            <ProcessStep
              number="01"
              title="SOURCING"
              description="Sélection rigoureuse de matières premières auprès de fournisseurs certifiés en Europe"
              image="https://images.unsplash.com/photo-1558769132-92e717d613cd?w=1200&h=800&fit=crop"
              reverse={false}
            />
            <ProcessStep
              number="02"
              title="CONCEPTION"
              description="Design et patronage dans notre studio parisien avec nos équipes créatives"
              image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop"
              reverse={true}
            />
            <ProcessStep
              number="03"
              title="FABRICATION"
              description="Production artisanale dans nos ateliers partenaires en France et au Portugal"
              image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&h=800&fit=crop"
              reverse={false}
            />
            <ProcessStep
              number="04"
              title="DISTRIBUTION"
              description="Emballages éco-responsables et livraison neutre en carbone"
              image="https://images.unsplash.com/photo-1558769132-92667e95d8e5?w=1200&h=800&fit=crop"
              reverse={true}
            />
          </div>
        </div>
      </section>

      {/* Section 5: Nos certifications */}
      <section className="py-24 px-8 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-section mb-16 text-center">CERTIFICATIONS</h2>

          <div className="flex flex-wrap justify-center gap-16">
            <CertificationBadge name="GOTS" />
            <CertificationBadge name="RWS" />
            <CertificationBadge name="OEKO-TEX" />
            <CertificationBadge name="B CORP" />
          </div>

          <p className="text-body text-white/70 text-center mt-12 max-w-2xl mx-auto">
            Toutes nos certifications sont vérifiées annuellement par des
            organismes indépendants pour garantir notre engagement continu.
          </p>
        </div>
      </section>

      {/* Section 6: Notre atelier (grande image) */}
      <section className="relative h-[80vh] w-full">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558769132-92e717d613cd?w=1920&h=1080&fit=crop"
            alt="Notre atelier"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 flex h-full items-center justify-center px-8">
          <div className="max-w-3xl text-center text-white">
            <h2 className="text-section mb-6">NOTRE ATELIER PARISIEN</h2>
            <p className="text-body text-white/90 text-lg leading-relaxed">
              Situé dans le Marais, notre atelier est le cœur battant de la
              maison. C'est ici que naissent toutes nos collections, dans le
              respect des techniques traditionnelles de la haute couture
              française.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Rejoignez le mouvement */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-section mb-8">
                REJOIGNEZ
                <br />
                LE MOUVEMENT
              </h2>
              <p className="text-body text-grey-medium mb-8 leading-relaxed">
                Ensemble, créons une mode plus responsable. Découvrez nos
                initiatives et comment vous pouvez participer à ce changement.
              </p>

              <div className="space-y-6">
                <ActionItem
                  title="Programme de recyclage"
                  description="Ramenez vos anciennes pièces en boutique"
                />
                <ActionItem
                  title="Réparation gratuite"
                  description="Service de réparation à vie pour nos créations"
                />
                <ActionItem
                  title="Seconde main"
                  description="Revendez vos pièces sur notre plateforme"
                />
              </div>
            </div>

            <div className="aspect-square bg-grey-light overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=800&h=800&fit=crop"
                alt="Rejoignez le mouvement"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-8 bg-grey-light">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-section mb-8">
            DÉCOUVREZ NOS COLLECTIONS RESPONSABLES
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/hauts" className="btn-primary">
              VOIR LA COLLECTION
            </Link>
            <Link href="/contact" className="btn-secondary">
              NOUS CONTACTER
            </Link>
          </div>
        </div>
      </section>

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
      <div className="aspect-square mb-4 bg-white overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
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
        className={`aspect-[4/3] bg-white overflow-hidden ${reverse ? 'md:col-start-1' : ''}`}
      >
        <img src={image} alt={title} className="w-full h-full object-cover" />
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
