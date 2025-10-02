// src/app/products/[category]/page.tsx
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import ProductGridMinimal from '@/components/products/ProductGridMinimal'
import { getServerSupabase } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 60 * 60 * 24 * 30 // ~30 jours
export const dynamicParams = false

// ✅ Slugs basés sur votre base Supabase actuelle
// ✅ Catégories principales du site
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

  // 1) Récupérer la catégorie parent
  const { data: parentCategory, error: catErr } = await supabase
    .from('categories')
    .select('id, slug, name')
    .eq('slug', categorySlug)
    .eq('is_active', true)
    .single()

  if (catErr || !parentCategory) {
    console.error('❌ Category not found:', categorySlug, catErr)
    return []
  }

  console.log('✅ Found category:', parentCategory)

  // 2) Récupérer les IDs des sous-catégories (si elles existent)
  const { data: childCategories, error: childErr } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', parentCategory.id)
    .eq('is_active', true)

  if (childErr) {
    console.error('⚠️ Error fetching child categories:', childErr)
  }

  // Collecter tous les IDs de catégories (parent + enfants)
  const categoryIds = [
    parentCategory.id,
    ...(childCategories?.map((c) => c.id) || []),
  ]

  console.log('🔍 Looking for products in category IDs:', categoryIds)

  // 3) Récupérer les produits correspondants
  // ✅ CORRECTION : Utiliser category_id au lieu de category.slug
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      images:product_images(*),
      category:categories(id, slug, name, parent_id)
    `
    )
    .eq('is_active', true)
    .in('category_id', categoryIds) // ✅ CORRECTION ICI
    .order('created_at', { ascending: false })
    .limit(60)

  if (error) {
    console.error('❌ Error fetching products:', error)
    return []
  }

  console.log(`✅ Found ${data?.length || 0} products`)

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
                <p className="text-black/60 text-sm tracking-[0.05em] font-semibold lowercase mb-4">
                  aucun produit trouvé dans "{def.title}"
                </p>
                <p className="text-xs text-black/40 max-w-md mx-auto">
                  Vérifiez que vos produits ont bien une catégorie avec le slug
                  "{params.category}" ou une sous-catégorie de celle-ci dans
                  Supabase.
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
