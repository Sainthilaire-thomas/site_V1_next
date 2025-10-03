// src/app/api/products/[id]/images/set-primary/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const { imageId } = await req.json()

    if (!productId || !imageId) {
      return NextResponse.json(
        { error: 'productId et imageId requis' },
        { status: 400 }
      )
    }

    // Retirer is_primary de toutes les images du produit
    const { error: clearError } = await supabaseAdmin
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId)

    if (clearError) {
      console.error('Erreur clear primary:', clearError)
      return NextResponse.json({ error: clearError.message }, { status: 500 })
    }

    // Définir la nouvelle principale
    const { error: setError } = await supabaseAdmin
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId)

    if (setError) {
      console.error('Erreur set primary:', setError)
      return NextResponse.json({ error: setError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Erreur serveur set-primary:', error)
    return NextResponse.json(
      { error: error?.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
