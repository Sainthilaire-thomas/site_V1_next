// PATCH (update) / DELETE (hard delete)
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

type Params = { params: { id: string } }

export async function PATCH(req: Request, { params }: Params) {
  const id = params.id
  const body = await req.json().catch(() => ({}))
  const { data, error } = await supabaseAdmin
    .from('categories')
    .update({
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      image_url: body.image_url ?? null,
      parent_id: body.parent_id ?? null,
      sort_order: Number.isFinite(+body.sort_order) ? +body.sort_order : 0,
      is_active: body.is_active ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error)
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    )
  return NextResponse.json({ ok: true, data })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', params.id)
  if (error)
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    )
  return NextResponse.json({ ok: true })
}
