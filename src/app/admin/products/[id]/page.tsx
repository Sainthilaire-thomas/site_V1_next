import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { ProductFormClient } from './ProductFormClient'

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (productError || !product) {
    return (
      <div className="space-y-4">
        <div className="text-sm">
          <Link href="/admin/products" className="underline hover:text-violet">
            ← Retour
          </Link>
        </div>
        <h1 className="text-xl font-semibold">Produit introuvable</h1>
      </div>
    )
  }

  const { data: variants } = await supabaseAdmin
    .from('product_variants')
    .select('*')
    .eq('product_id', id)
    .order('created_at', { ascending: true })

  return (
    <ProductFormClient
      product={product}
      variants={variants ?? []}
      productId={id}
    />
  )
}
