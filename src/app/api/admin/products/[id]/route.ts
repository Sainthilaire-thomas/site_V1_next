import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { productUpdateSchema } from '@/lib/validation/adminProducts'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok)
    return NextResponse.json({ error: auth.message }, { status: auth.status })

  const { id } = await params

  // Récupère le produit
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
  }

  // Récupère les variantes
  const { data: variants, error: variantsError } = await supabaseAdmin
    .from('product_variants')
    .select('*')
    .eq('product_id', id)
    .order('created_at', { ascending: true })

  if (variantsError) {
    return NextResponse.json({ error: variantsError.message }, { status: 500 })
  }

  return NextResponse.json({
    product,
    variants: variants ?? [],
  })
}

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok)
    return NextResponse.json({ error: auth.message }, { status: auth.status })

  const { id } = await params
  const body = await _req.json()
  const parsed = productUpdateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ ...parsed.data })
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product: data })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok)
    return NextResponse.json({ error: auth.message }, { status: auth.status })

  const { id } = await params

  // soft delete recommandé : is_active=false
  const { error } = await supabaseAdmin
    .from('products')
    .update({ is_active: false })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
