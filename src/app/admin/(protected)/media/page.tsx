// src/app/admin/media/page.tsx
import { MediaGridClient } from './MediaGridClient'
import { MediaGridHeader } from './MediaGridHeader'
import { BreadcrumbProvider } from './BreadcrumbProvider'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { product_id } = await searchParams

  // Si on a un product_id, récupérer le nom du produit pour le breadcrumb
  let productName: string | undefined
  if (product_id) {
    const { data } = await supabaseAdmin
      .from('products')
      .select('name')
      .eq('id', product_id)
      .single()

    productName = data?.name ?? undefined
  }

  return (
    <>
      <BreadcrumbProvider
        productId={product_id ?? null}
        productName={productName ?? null}
      />
      <MediaGridHeader productId={product_id ?? null} />
      <MediaGridClient productId={product_id ?? null} />
    </>
  )
}
