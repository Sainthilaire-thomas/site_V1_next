// src/app/product/[id]/page.tsx
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import { notFound } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabase-server'
import ProductDetailClient from './ProductDetailClient' // ✅ chemin corrigé

export const revalidate = 0

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const supabase = await getServerSupabase()

  const { data: product, error } = await supabase
    .from('products')
    .select(
      `
      *,
      images:product_images(*),
      variants:product_variants(
        id, product_id, name, value, sku, is_active,
        stock_quantity, price_modifier, created_at
      ),
      category:categories(*)
    `
    )
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!product) return notFound()

  return (
    <div className="min-h-screen bg-white">
      <HeaderMinimal />
      <main className="pt-6">
        <section className="px-6 py-8">
          <div className="container mx-auto">
            {/* ✅ ne PAS passer de children ici */}
            <ProductDetailClient product={product as any} />
          </div>
        </section>
      </main>
    </div>
  )
}
