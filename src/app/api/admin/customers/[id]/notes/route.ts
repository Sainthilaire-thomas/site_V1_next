import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status })
  }

  const { id } = await params

  try {
    const { data: notes, error } = await supabaseAdmin
      .from('customer_notes')
      .select(
        `
        *,
        admin:profiles!admin_id(first_name, last_name)
      `
      )
      .eq('customer_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ notes: notes || [] })
  } catch (error: any) {
    console.error('Error in GET notes:', error)
    return NextResponse.json(
      { error: error?.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status })
  }

  const { id } = await params
  const body = await req.json()

  if (!body.note || body.note.trim() === '') {
    return NextResponse.json(
      { error: 'La note ne peut pas être vide' },
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('customer_notes')
      .insert({
        customer_id: id,
        admin_id: auth.user.id,
        note: body.note,
      })
      .select(
        `
        *,
        admin:profiles!admin_id(first_name, last_name)
      `
      )
      .single()

    if (error) {
      console.error('Error creating note:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ note: data })
  } catch (error: any) {
    console.error('Error in POST notes:', error)
    return NextResponse.json(
      { error: error?.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
