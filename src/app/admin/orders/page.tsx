// src/app/admin/orders/page.tsx
import { supabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'

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
    .limit(50)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Commandes</h1>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">N° Commande</th>
              <th className="text-left p-4">Client</th>
              <th className="text-left p-4">Statut</th>
              <th className="text-left p-4">Total</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-4 font-mono text-sm">{order.order_number}</td>
                <td className="p-4">
                  <div>{order.customer_name}</div>
                  <div className="text-sm text-gray-500">
                    {order.customer_email}
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      order.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-4">{order.total_amount}€</td>
                <td className="p-4">
                  {new Date(order.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="p-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-violet-600 hover:underline"
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
  )
}
