// GET (list) / POST (create)
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error)
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    )
  return NextResponse.json({ ok: true, data })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const payload = {
    name: body.name?.trim() ?? 'Sans nom',
    slug: body.slug?.trim() ?? '',
    description: body.description ?? null,
    image_url: body.image_url ?? null,
    parent_id: body.parent_id ?? null,
    sort_order: Number.isFinite(+body.sort_order) ? +body.sort_order : 0,
    is_active: body.is_active ?? true,
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert(payload)
    .select()
    .single()
  if (error)
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    )
  return NextResponse.json({ ok: true, data })
}
