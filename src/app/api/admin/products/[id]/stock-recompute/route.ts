import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok)
    return NextResponse.json({ error: auth.message }, { status: auth.status })

  const { id } = await params

  const { data, error } = await supabaseAdmin.rpc('recompute_product_stock', {
    p_product_id: id,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ stock: data ?? 0 })
}
