// src/app/admin/orders/page.tsx
import { supabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

const statusColors: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending: 'secondary',
  paid: 'default',
  processing: 'outline',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
  refunded: 'secondary',
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payée',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
}

export default async function AdminOrdersPage() {
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select(
      `
      *,
      items:order_items(count)
    `
    )
    .order('created_at', { ascending: false })
    .limit(100)

  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter((o) => o.status === 'pending').length || 0,
    processing:
      orders?.filter((o) => o.status === 'processing' || o.status === 'paid')
        .length || 0,
    revenue:
      orders?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Commandes</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            En attente
          </div>
          <div className="text-2xl font-bold text-orange-500">
            {stats.pending}
          </div>
        </div>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            À traiter
          </div>
          <div className="text-2xl font-bold text-blue-500">
            {stats.processing}
          </div>
        </div>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            CA total
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.revenue.toFixed(0)}€
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-600">
              <tr>
                <th className="text-left py-3 px-4 font-medium">N° Commande</th>
                <th className="text-left py-3 px-4 font-medium">Client</th>
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Articles</th>
                <th className="text-left py-3 px-4 font-medium">Montant</th>
                <th className="text-left py-3 px-4 font-medium">Statut</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-3 px-4">
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {order.order_number}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{order.customer_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {order.customer_email}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {order.items?.[0]?.count || 0}
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {Number(order.total_amount).toFixed(2)}€
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusColors[order.status || 'pending']}>
                      {statusLabels[order.status || 'pending']}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-violet hover:underline"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {orders?.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Aucune commande pour le moment
        </div>
      )}
    </div>
  )
}
