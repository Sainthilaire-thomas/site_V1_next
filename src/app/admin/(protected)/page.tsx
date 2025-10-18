// src/app/admin/(protected)/page.tsx
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  Package,
  ShoppingCart,
  Users,
  FolderKanban,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  // Récupérer les statistiques
  const [
    { count: productsCount },
    { count: ordersCount },
    { count: customersCount },
    { count: categoriesCount },
    { data: recentOrders },
    { data: lowStockProducts },
  ] = await Promise.all([
    supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
    supabaseAdmin
      .from('categories')
      .select('id', { count: 'exact', head: true }),
    supabaseAdmin
      .from('orders')
      .select('id, order_number, status, total_amount, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('products')
      .select('id, name, stock_quantity')
      .lte('stock_quantity', 10)
      .order('stock_quantity', { ascending: true })
      .limit(5),
  ])

  const stats = [
    {
      name: 'Produits',
      value: productsCount || 0,
      icon: Package,
      href: '/admin/products',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Commandes',
      value: ordersCount || 0,
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Clients',
      value: customersCount || 0,
      icon: Users,
      href: '/admin/customers',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Catégories',
      value: categoriesCount || 0,
      icon: FolderKanban,
      href: '/admin/categories',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    paid: 'Payée',
    processing: 'En préparation',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Vue d'ensemble de votre boutique
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-violet transition-all hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div
                  className={`p-3 rounded-full ${stat.bgColor} dark:opacity-80`}
                >
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>

              {/* Hover effect */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-violet transition-all group-hover:w-full" />
            </Link>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Commandes récentes */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-violet" />
              Commandes récentes
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-violet hover:underline"
            >
              Voir tout →
            </Link>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {statusLabels[order.status || 'pending']}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {Number(order.total_amount).toFixed(2)}€
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Aucune commande pour le moment
              </div>
            )}
          </div>
        </div>

        {/* Stock faible */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Stock faible
            </h2>
            <Link
              href="/admin/products"
              className="text-sm text-violet hover:underline"
            >
              Voir tout →
            </Link>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {lowStockProducts && lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {product.id.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (product.stock_quantity ?? 0) === 0
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : (product.stock_quantity ?? 0) <= 5
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {(product.stock_quantity ?? 0) === 0
                          ? 'Rupture'
                          : `${product.stock_quantity ?? 0} restant${(product.stock_quantity ?? 0) > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                ✅ Tous les produits ont un stock suffisant
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-violet transition-colors group"
          >
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 group-hover:bg-violet group-hover:text-white transition-colors">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-white" />
            </div>
            <span className="font-medium text-sm">Nouveau produit</span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-violet transition-colors group"
          >
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20 group-hover:bg-violet group-hover:text-white transition-colors">
              <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:text-white" />
            </div>
            <span className="font-medium text-sm">Voir commandes</span>
          </Link>

          <Link
            href="/admin/customers"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-violet transition-colors group"
          >
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 group-hover:bg-violet group-hover:text-white transition-colors">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:text-white" />
            </div>
            <span className="font-medium text-sm">Gérer clients</span>
          </Link>

          <Link
            href="/admin/analytics"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-violet transition-colors group"
          >
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20 group-hover:bg-violet group-hover:text-white transition-colors">
              <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400 group-hover:text-white" />
            </div>
            <span className="font-medium text-sm">Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
