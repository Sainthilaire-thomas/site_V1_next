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
    // Récupérer le profil
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    // Récupérer l'email
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(id)
    const email = authUser.user?.email || ''

    // Stats de commandes
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, status, total_amount, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })

    const orderCount = orders?.length || 0
    const totalRevenue =
      orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0
    const averageOrder = orderCount > 0 ? totalRevenue / orderCount : 0

    return NextResponse.json({
      customer: {
        ...profile,
        email,
      },
      stats: {
        orderCount,
        totalRevenue,
        averageOrder,
      },
      recentOrders: orders?.slice(0, 5) || [],
    })
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status })
  }

  const { id } = await params
  const body = await req.json()

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        first_name: body.first_name,
        last_name: body.last_name,
        phone: body.phone,
        role: body.role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ customer: data })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
