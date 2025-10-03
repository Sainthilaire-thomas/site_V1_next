// src/app/api/admin/product-images/[imageId]/alt/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ imageId: string }> } // ← Next 15
) {
  try {
    const { imageId } = await params // ← await params
    const body = await req.json()
    const alt = body?.alt ?? null

    if (!imageId) {
      return NextResponse.json({ error: 'imageId manquant' }, { status: 400 })
    }

    // ✅ Utiliser "alt" si vous avez renommé la colonne
    const { error } = await supabaseAdmin
      .from('product_images')
      .update({ alt }) // ← ou alt_text selon votre choix
      .eq('id', imageId)

    if (error) {
      console.error('Erreur update alt:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Erreur serveur alt:', e)
    return NextResponse.json(
      { error: e?.message ?? 'Erreur serveur' },
      { status: 500 }
    )
  }
}
