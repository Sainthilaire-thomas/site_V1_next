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

  // Fetch toutes les données en parallèle
  const [customerRes, ordersRes, addressesRes, notesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/customers/${id}`, {
      cache: 'no-store',
    }),
    fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/customers/${id}/orders`,
      { cache: 'no-store' }
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/customers/${id}/addresses`,
      { cache: 'no-store' }
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/customers/${id}/notes`,
      { cache: 'no-store' }
    ),
  ])

  if (!customerRes.ok) {
    return notFound()
  }

  const customerData = await customerRes.json()
  const { orders } = await ordersRes.json()
  const { addresses } = await addressesRes.json()
  const { notes } = await notesRes.json()

  return (
    <CustomerDetailClient
      customer={customerData.customer}
      stats={customerData.stats}
      recentOrders={customerData.recentOrders}
      allOrders={orders}
      addresses={addresses}
      notes={notes}
    />
  )
}
