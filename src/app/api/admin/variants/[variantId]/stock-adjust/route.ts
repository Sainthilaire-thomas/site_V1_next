import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { stockAdjustSchema } from '@/lib/validation/adminProducts'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok)
    return NextResponse.json({ error: auth.message }, { status: auth.status })

  const { variantId } = await params

  const body = await req.json()
  const parsed = stockAdjustSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // insère un mouvement (le trigger met à jour le stock)
  const { error } = await supabaseAdmin.from('stock_movements').insert({
    variant_id: variantId,
    delta: parsed.data.delta,
    reason: parsed.data.reason,
    created_by: auth.user.id,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // retourne le nouveau stock
  const { data: v, error: e2 } = await supabaseAdmin
    .from('product_variants')
    .select('stock_quantity, product_id')
    .eq('id', variantId)
    .single()

  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })

  // Vérifie que product_id existe avant de recalculer
  if (v.product_id) {
    await supabaseAdmin.rpc('recompute_product_stock', {
      p_product_id: v.product_id,
    })
  }

  return NextResponse.json({ ok: true, newStock: v.stock_quantity ?? 0 })
}
