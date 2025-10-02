import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { variantCreateSchema } from '@/lib/validation/adminProducts'

const variantUpdateSchema = variantCreateSchema.partial()

export async function PATCH(
  req: Request,
  { params }: { params: { variantId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok)
    return NextResponse.json({ error: auth.message }, { status: auth.status })

  const body = await req.json()
  const parsed = variantUpdateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .update({ ...parsed.data })
    .eq('id', params.variantId)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ variant: data })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { variantId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok)
    return NextResponse.json({ error: auth.message }, { status: auth.status })

  const { error } = await supabaseAdmin
    .from('product_variants')
    .delete()
    .eq('id', params.variantId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
