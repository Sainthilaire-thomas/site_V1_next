// src/app/admin/orders/[id]/page.tsx
import { supabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import OrderAdminClient from './OrderAdminClient'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(
      `
      *,
      items:order_items(*),
      history:order_status_history(*)
    `
    )
    .eq('id', id)
    .single()

  if (error || !order) {
    return notFound()
  }

  return <OrderAdminClient order={order} />
}
