import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabaseAdmin
    .from('product_images')
    .select(
      'id, alt, is_primary, sort_order, width, height, storage_original, storage_master'
    )
    .eq('product_id', params.id)
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ images: data })
}
