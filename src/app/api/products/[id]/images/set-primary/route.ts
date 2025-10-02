import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { imageId } = await req.json()

  // On met is_primary=true sur l’image, le trigger DB remettra les autres à false
  const { error } = await supabaseAdmin
    .from('product_images')
    .update({ is_primary: true })
    .eq('id', imageId)
    .eq('product_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
