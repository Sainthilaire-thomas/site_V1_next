import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const { orders } = (await req.json()) as {
    orders: { id: string; sort_order: number }[]
  }
  if (!Array.isArray(orders))
    return NextResponse.json({ error: 'orders requis' }, { status: 400 })

  // Pas de batch multi-rows natif → on boucle
  for (const o of orders) {
    const { error } = await supabaseAdmin
      .from('product_images')
      .update({ sort_order: o.sort_order })
      .eq('id', o.id)
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
