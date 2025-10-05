// ============================================
// src/app/api/wishlist/route.ts
// ============================================
import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase-server'

// GET: Récupérer la wishlist de l'utilisateur
export async function GET() {
  try {
    const supabase = await getServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('wishlist_items')
      .select(
        `
        id,
        product:products(
          id,
          name,
          price,
          sale_price,
          images:product_images(
            id,
            alt,
            is_primary
          )
        )
      `
      )
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching wishlist:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Error in GET /api/wishlist:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal error' },
      { status: 500 }
    )
  }
}

// POST: Ajouter un produit à la wishlist
export async function POST(req: Request) {
  try {
    const supabase = await getServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await req.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      )
    }

    // Vérifier si déjà en wishlist
    const { data: existing } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already in wishlist' },
        { status: 409 }
      )
    }

    // Ajouter à la wishlist
    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({
        user_id: user.id,
        product_id: productId,
      })
      .select(
        `
        id,
        product:products(
          id,
          name,
          price,
          sale_price,
          images:product_images(
            id,
            alt,
            is_primary
          )
        )
      `
      )
      .single()

    if (error) {
      console.error('Error adding to wishlist:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Error in POST /api/wishlist:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal error' },
      { status: 500 }
    )
  }
}
