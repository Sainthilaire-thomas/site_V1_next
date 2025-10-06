import { supabaseAdmin } from '@/lib/supabase-admin'

export async function getCustomers(params: {
  q?: string
  role?: string
  sort?: string
  limit?: number
  offset?: number
}) {
  const { q, role, sort, limit = 50, offset = 0 } = params

  // Construire la requête
  let query = supabaseAdmin.from('profiles').select(
    `
      id,
      first_name,
      last_name,
      role,
      created_at,
      avatar_url
    `,
    { count: 'exact' }
  )

  // Filtres
  if (q) {
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
  }

  if (role && role !== 'all') {
    query = query.eq('role', role)
  }

  // Tri
  switch (sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'name':
      query = query.order('last_name', { ascending: true })
      break
  }

  query = query.range(offset, offset + limit - 1)

  const { data: profiles, error, count } = await query

  if (error) {
    throw new Error(error.message)
  }

  // Récupérer les emails
  const userIds = profiles?.map((p) => p.id) || []
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
  const emailMap = new Map(authUsers.users.map((u) => [u.id, u.email ?? '']))

  // Stats de commandes
  const { data: orderStats } = await supabaseAdmin
    .from('orders')
    .select('user_id, total_amount')
    .in('user_id', userIds)
    .in('status', ['paid', 'processing', 'shipped', 'delivered'])

  const statsMap = new Map<
    string,
    { orderCount: number; totalRevenue: number }
  >()

  orderStats?.forEach((order) => {
    if (!order.user_id) return
    const current = statsMap.get(order.user_id) || {
      orderCount: 0,
      totalRevenue: 0,
    }
    statsMap.set(order.user_id, {
      orderCount: current.orderCount + 1,
      totalRevenue: current.totalRevenue + Number(order.total_amount),
    })
  })

  // Enrichir les profils
  const customers = profiles?.map((profile) => {
    const stats = statsMap.get(profile.id) || { orderCount: 0, totalRevenue: 0 }
    return {
      ...profile,
      email: emailMap.get(profile.id) || '',
      order_count: stats.orderCount,
      total_revenue: stats.totalRevenue,
    }
  })

  // Tri additionnel
  if (sort === 'orders') {
    customers?.sort((a, b) => b.order_count - a.order_count)
  } else if (sort === 'revenue') {
    customers?.sort((a, b) => b.total_revenue - a.total_revenue)
  }

  return {
    customers: customers || [],
    total: count || 0,
  }
}

export async function getCustomerStats() {
  // Total clients
  const { count: totalCustomers } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Nouveaux ce mois
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: newThisMonth } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString())

  // Clients actifs
  const { data: activeCustomers } = await supabaseAdmin
    .from('orders')
    .select('user_id')
    .not('user_id', 'is', null)

  const uniqueActiveCustomers = new Set(
    activeCustomers?.map((o) => o.user_id).filter(Boolean)
  ).size

  // CA total
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('total_amount')
    .in('status', ['paid', 'processing', 'shipped', 'delivered'])

  const totalRevenue =
    orders?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0

  return {
    total: totalCustomers || 0,
    newThisMonth: newThisMonth || 0,
    active: uniqueActiveCustomers,
    totalRevenue: Math.round(totalRevenue),
  }
}
