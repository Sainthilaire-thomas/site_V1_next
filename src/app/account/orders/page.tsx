// src/app/account/orders/page.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

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

function getStatusInfo(status: string | null) {
  const defaultStatus = 'pending'
  const currentStatus = status || defaultStatus

  return {
    color: statusColors[currentStatus] || 'secondary',
    label: statusLabels[currentStatus] || 'Inconnu',
  }
}

export default async function AccountOrdersPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get: (k) => cookieStore.get(k)?.value, set() {}, remove() {} },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) redirect('/auth/login')

  const { data: orders } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (
        id,
        quantity,
        product_name,
        unit_price,
        total_price
      )
    `
    )
    .eq('customer_email', user.email)
    .order('created_at', { ascending: false })

  console.log('📦 Orders fetched:', orders?.length)
  console.log('📦 First order items:', orders?.[0]?.order_items)

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-8">Mes commandes</h1>

        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status)
              const totalQuantity =
                order.order_items?.reduce(
                  (sum, item) => sum + (item.quantity || 0),
                  0
                ) || 0

              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block border rounded-lg p-6 hover:border-violet-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-mono text-sm text-gray-500">
                        {order.order_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString(
                          'fr-FR',
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }
                        )}
                      </div>
                    </div>

                    <Badge variant={statusInfo.color}>{statusInfo.label}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {totalQuantity} article{totalQuantity > 1 ? 's' : ''}
                    </div>
                    <div className="font-medium">
                      {Number(order.total_amount).toFixed(2)}€
                    </div>
                  </div>

                  {order.order_items && order.order_items.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="space-y-2">
                        {order.order_items.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="text-sm text-gray-600 flex justify-between"
                          >
                            <span>
                              {item.quantity}x {item.product_name}
                            </span>
                            <span className="text-gray-900">
                              {Number(item.total_price).toFixed(2)}€
                            </span>
                          </div>
                        ))}
                        {order.order_items.length > 3 && (
                          <div className="text-sm text-gray-400">
                            + {order.order_items.length - 3} autre(s) article(s)
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {order.tracking_number && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm">
                        <span className="text-gray-600">Suivi: </span>
                        <code className="bg-gray-100 px-2 py-1 rounded">
                          {order.tracking_number}
                        </code>
                      </div>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-6">
              Vous n'avez pas encore passé de commande.
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-violet-600 text-white rounded hover:bg-violet-700 transition-colors"
            >
              Découvrir nos produits
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
