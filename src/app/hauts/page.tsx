// src/app/hauts/page.tsx
import { getServerSupabase } from '@/lib/supabase-server'
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import ProductGridMinimal from '@/components/products/ProductGridMinimal'

export const revalidate = 0

type Product = {
  id: string
  name: string
  short_description: string | null
  price: number
  sale_price: number | null
  stock_quantity: number | null
  images?: Array<{ url: string; alt_text: string | null }>
  category?: { name: string } | null
}

async function getHauts(): Promise<Product[]> {
  const supabase = await getServerSupabase()

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      images:product_images(*),
      category:categories(*)
    `
    )
    .eq('is_active', true)
    .in('category.name', ['Hauts', 'Chemises', 'T-shirts', 'Pulls', 'Blouses'])
    .order('created_at', { ascending: false })
    .limit(60)

  if (error) {
    console.error('Error fetching hauts:', error)
    return []
  }

  return (data ?? []) as Product[]
}

export default async function HautsPage() {
  const products = await getHauts()

  return (
    <div className="min-h-screen bg-white">
      <HeaderMinimal />

      {/* Hero simple avec titre */}
      <section className="pt-32 pb-16 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-hero mb-4">HAUTS</h1>
          <p className="text-body text-grey-medium max-w-md">
            Collection complète de nos pièces essentielles
          </p>
        </div>
      </section>

      {/* Filtres minimalistes - Sticky */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-grey-light py-4 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex gap-6 overflow-x-auto">
            <FilterButton active>TOUT</FilterButton>
            <FilterButton>CHEMISES</FilterButton>
            <FilterButton>T-SHIRTS</FilterButton>
            <FilterButton>PULLS</FilterButton>
            <FilterButton>BLOUSES</FilterButton>
          </div>

          <button className="text-product text-grey-medium hover:text-black transition-colors flex items-center gap-2 flex-shrink-0">
            TRIER PAR
            <svg
              className="w-4 h-4"
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
          </button>
        </div>
      </div>

      {/* Grille produits */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {products.length > 0 ? (
            <ProductGridMinimal products={products} />
          ) : (
            <div className="text-center py-20">
              <p className="text-body text-grey-medium mb-8">
                Aucun produit disponible pour le moment.
              </p>
              <a href="/collections" className="btn-primary">
                DÉCOUVRIR LES COLLECTIONS
              </a>
            </div>
          )}
        </div>
      </section>

      <FooterMinimal />
    </div>
  )
}

// Composant FilterButton
function FilterButton({
  children,
  active = false,
}: {
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <button
      className={`text-product transition-colors whitespace-nowrap ${
        active ? 'text-black' : 'text-grey-medium hover:text-black'
      }`}
    >
      {children}
    </button>
  )
}
