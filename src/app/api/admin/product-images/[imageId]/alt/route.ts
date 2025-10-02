import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function PATCH(
  req: Request,
  { params }: { params: { imageId: string } }
) {
  try {
    const body = (await req.json()) as { alt?: string | null }
    const alt = body?.alt ?? null

    if (!params.imageId) {
      return NextResponse.json({ error: 'imageId manquant' }, { status: 400 })
    }

    // IMPORTANT : le nom de colonne est alt_text (et pas alt)
    const { error } = await supabaseAdmin
      .from('product_images')
      .update({ alt_text: alt })
      .eq('id', params.imageId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Erreur serveur' },
      { status: 500 }
    )
  }
}
