// src/app/products/[category]/page.tsx
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import ProductGridJacquemus from '@/components/products/ProductGridJacquemus'
import { getServerSupabase } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 60 * 60 * 24 * 30
export const dynamicParams = false

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
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const def = CATEGORY_DEFS.find((c) => c.slug === category)
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

  const { data: parentCategory, error: catErr } = await supabase
    .from('categories')
    .select('id, slug, name')
    .eq('slug', categorySlug)
    .eq('is_active', true)
    .single()

  if (catErr || !parentCategory) return []

  const { data: childCategories } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', parentCategory.id)
    .eq('is_active', true)

  const categoryIds = [
    parentCategory.id,
    ...(childCategories?.map((c) => c.id) || []),
  ]

  const { data } = await supabase
    .from('products')
    .select(
      `
      *,
      images:product_images(*),
      category:categories(id, slug, name, parent_id)
    `
    )
    .eq('is_active', true)
    .in('category_id', categoryIds)
    .order('created_at', { ascending: false })
    .limit(60)

  return (data ?? []) as Product[]
}

export default async function ProductsByCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const def = CATEGORY_DEFS.find((c) => c.slug === category)
  if (!def) notFound()

  const products = await getProductsForCategory(category)

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

      <main className="pt-8 pb-12">
        {/* Ligne de séparation fine sous le header */}
        <div className="border-b border-black/20 mb-8" />
        {/* Titre centré style Jacquemus */}
        <div className="text-center mb-8 px-4">
          <h1 className="text-[11px] font-light tracking-[0.2em] uppercase text-black mb-2">
            {def.title}
          </h1>
          <p className="text-[13px] text-black/40 font-light">
            {products.length} {products.length > 1 ? 'produits' : 'produit'}
          </p>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {products.length > 0 ? (
            <ProductGridJacquemus products={products} />
          ) : (
            <div className="text-center py-32">
              <p className="text-[11px] tracking-[0.15em] uppercase text-black/40 mb-3">
                Aucun produit disponible
              </p>
              <p className="text-[13px] text-black/30 font-light">
                Revenez bientôt pour découvrir nos nouveautés
              </p>
            </div>
          )}
        </div>
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
