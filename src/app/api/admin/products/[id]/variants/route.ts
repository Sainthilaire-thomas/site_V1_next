import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { variantCreateSchema } from '@/lib/validation/adminProducts'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok)
    return NextResponse.json({ error: auth.message }, { status: auth.status })

  const { id } = await params

  const body = await req.json()
  const parsed = variantCreateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .insert({ ...parsed.data, product_id: id })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ variant: data }, { status: 201 })
}
