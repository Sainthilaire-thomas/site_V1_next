// src/app/products/[category]/page.tsx
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import ProductGridMinimal from '@/components/products/ProductGridMinimal'
import { getServerSupabase } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 60 * 60 * 24 * 30 // ~30 jours
export const dynamicParams = false

// Slugs canoniques que tu souhaites exposer
const CATEGORY_DEFS = [
  {
    slug: 'hauts',
    title: 'Hauts',
    description: 'Chemises, t-shirts, pulls et blouses.',
  },
  {
    slug: 'bas',
    title: 'Bas',
    description: 'Pantalons, jeans, jupes et shorts.',
  },
  {
    slug: 'accessoires',
    title: 'Accessoires',
    description: 'Sacs, ceintures, bijoux et plus.',
  },
] as const

type Product = {
  id: string
  name: string
  short_description: string | null
  price: number
  sale_price: number | null
  stock_quantity: number | null
  images?: Array<{ url: string; alt_text: string | null }>
  category?: {
    id: string
    slug: string
    name: string
    parent_id: string | null
  } | null
}

export async function generateStaticParams() {
  return CATEGORY_DEFS.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { category: string }
}): Promise<Metadata> {
  const def = CATEGORY_DEFS.find((c) => c.slug === params.category)
  if (!def) return {}
  const title = `${def.title} | .blancherenaudin`
  const description = `Découvrez nos ${def.title.toLowerCase()} — ${def.description}`
  return {
    title,
    description,
    alternates: { canonical: `/products/${def.slug}` },
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  }
}

async function getProductsForCategory(
  categorySlug: string
): Promise<Product[]> {
  const supabase = await getServerSupabase()

  // 1) Catégorie parent par slug
  const { data: parent, error: catErr } = await supabase
    .from('categories')
    .select('id, slug')
    .eq('slug', categorySlug)
    .single()

  if (catErr || !parent) return []

  // 2) Produits de la catégorie OU de ses enfants (parent_id)
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      images:product_images(*),
      category:categories!inner(id, slug, name, parent_id)
    `
    )
    .eq('is_active', true)
    .or(`category.slug.eq.${parent.slug},category.parent_id.eq.${parent.id}`)
    .order('created_at', { ascending: false })
    .limit(60)

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return (data ?? []) as Product[]
}

export default async function ProductsByCategoryPage({
  params,
}: {
  params: { category: string }
}) {
  const def = CATEGORY_DEFS.find((c) => c.slug === params.category)
  if (!def) notFound()

  const products = await getProductsForCategory(params.category)

  // JSON-LD ItemList (SEO)
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `/product/${p.id}`,
      name: p.name,
    })),
  }

  return (
    <div className="min-h-screen bg-white">
      <HeaderMinimal />
      {/* H1 accessible mais masqué visuellement */}
      <h1 className="sr-only">{def.title}</h1>

      <main className="pt-6">
        <section className="py-6 sm:py-8">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
            {/* Sous-titre discret (optionnel) */}
            <p className="mb-6 text-black/50 text-[13px] tracking-[0.05em] font-semibold lowercase">
              {def.title.toLowerCase()}
            </p>

            {products.length > 0 ? (
              <ProductGridMinimal products={products} />
            ) : (
              <div className="text-center py-20">
                <p className="text-black/60 text-sm tracking-[0.05em] font-semibold lowercase">
                  aucun produit trouvé
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />

      <FooterMinimal />
    </div>
  )
}
