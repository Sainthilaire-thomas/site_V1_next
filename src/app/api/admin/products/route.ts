import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() || undefined
  const showInactive = searchParams.get('show_inactive') === '1'

  let query = supabaseAdmin
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Filtrer par nom si recherche
  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  // Filtrer par statut actif/inactif
  if (!showInactive) {
    query = query.eq('is_active', true)
  }

  const { data, count, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Récupérer les images principales pour tous les produits
  const productIds = (data ?? []).map((p: any) => p.id)

  let primaryImages: Record<string, string> = {}

  if (productIds.length > 0) {
    const { data: imagesData } = await supabaseAdmin
      .from('product_images')
      .select('id, product_id')
      .in('product_id', productIds)
      .eq('is_primary', true)

    if (imagesData) {
      primaryImages = imagesData.reduce(
        (acc: Record<string, string>, img: any) => {
          acc[img.product_id] = img.id
          return acc
        },
        {}
      )
    }
  }

  // Ajouter l'ID de l'image principale à chaque produit
  const items = (data ?? []).map((product: any) => ({
    ...product,
    primary_image_id: primaryImages[product.id] || null,
  }))

  return NextResponse.json({
    items,
    total: count ?? items.length,
  })
}
