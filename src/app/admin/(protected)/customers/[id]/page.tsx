import { supabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import { CustomerDetailClient } from './CustomerDetailClient'

export const dynamic = 'force-dynamic'

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    // ✅ Appel DIRECT à Supabase (pas de fetch HTTP)

    // 1. Récupérer le profil
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (profileError || !profile) {
      return notFound()
    }

    // 2. Récupérer l'email
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(id)
    const email = authUser.user?.email || ''

    // 3. Récupérer les commandes
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })

    // 4. Calculer les stats
    const orderCount = orders?.length || 0
    const totalRevenue =
      orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0
    const averageOrder = orderCount > 0 ? totalRevenue / orderCount : 0

    // 5. Récupérer les adresses
    const { data: addresses } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('user_id', id)
      .order('is_default', { ascending: false })

    // 6. Récupérer les notes
    // 6. Récupérer les notes - ✅ Correction de la requête
    const { data: notesData } = await supabaseAdmin
      .from('customer_notes')
      .select('id, note, created_at, admin_id')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })

    // Enrichir les notes avec les infos admin
    const notes = await Promise.all(
      (notesData || []).map(async (note) => {
        const { data: admin } = await supabaseAdmin
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', note.admin_id)
          .single()

        return {
          id: note.id,
          note: note.note,
          created_at: note.created_at,
          admin: {
            first_name: admin?.first_name || null,
            last_name: admin?.last_name || null,
          },
        }
      })
    )

    const customer = {
      ...profile,
      email,
    }

    const stats = {
      orderCount,
      totalRevenue,
      averageOrder,
    }

    return (
      <CustomerDetailClient
        customer={customer}
        stats={stats}
        recentOrders={orders?.slice(0, 5) || []}
        allOrders={orders || []}
        addresses={addresses || []}
        notes={notes || []}
      />
    )
  } catch (error) {
    console.error('Error loading customer:', error)
    return notFound()
  }
}
