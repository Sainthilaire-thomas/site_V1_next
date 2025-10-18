'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

type Order = {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  items?: { count: number }[]
}

type Props = {
  orders: Order[]
}

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

export function OrdersTab({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Aucune commande pour ce client
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-violet transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-medium hover:text-violet transition-colors"
                >
                  {order.order_number}
                </Link>
                <Badge variant={statusColors[order.status || 'pending']}>
                  {statusLabels[order.status || 'pending']}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(order.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-lg">
                {Number(order.total_amount).toFixed(2)}€
              </div>
              {order.items && order.items[0]?.count > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {order.items[0].count} article
                  {order.items[0].count > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
