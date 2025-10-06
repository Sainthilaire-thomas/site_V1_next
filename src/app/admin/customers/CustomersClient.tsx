'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

type Customer = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  role: string | null // ✅ Permettre null
  created_at: string
  order_count: number
  total_revenue: number
  avatar_url?: string | null // ✅ Ajouter avatar_url
}

type Stats = {
  total: number
  newThisMonth: number
  active: number
  totalRevenue: number
}

type Props = {
  initialCustomers: Customer[]
  initialStats: Stats
  initialTotal: number
}

export function CustomersClient({
  initialCustomers,
  initialStats,
  initialTotal,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery) {
      params.set('q', searchQuery)
    } else {
      params.delete('q')
    }
    router.push(`/admin/customers?${params.toString()}`)
  }

  function handleRoleFilter(role: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (role === 'all') {
      params.delete('role')
    } else {
      params.set('role', role)
    }
    router.push(`/admin/customers?${params.toString()}`)
  }

  function handleSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sort)
    router.push(`/admin/customers?${params.toString()}`)
  }

  const stats = {
    total: initialStats?.total ?? 0,
    newThisMonth: initialStats?.newThisMonth ?? 0,
    active: initialStats?.active ?? 0,
    totalRevenue: initialStats?.totalRevenue ?? 0,
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients ({initialTotal})</h1>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total clients
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Nouveaux ce mois
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.newThisMonth}
          </div>
        </div>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Clients actifs
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.active}
          </div>
        </div>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            CA total
          </div>
          <div className="text-2xl font-bold text-violet">
            {stats.totalRevenue.toLocaleString()}€
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Recherche */}
        <form onSubmit={handleSearch} className="flex-1">
          <input
            type="search"
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-4 py-2"
          />
        </form>

        {/* Filtre rôle */}
        <select
          value={searchParams.get('role') || 'all'}
          onChange={(e) => handleRoleFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-4 py-2"
        >
          <option value="all">Tous les rôles</option>
          <option value="customer">Clients</option>
          <option value="admin">Administrateurs</option>
        </select>

        {/* Tri */}
        <select
          value={searchParams.get('sort') || 'newest'}
          onChange={(e) => handleSort(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-4 py-2"
        >
          <option value="newest">Plus récents</option>
          <option value="oldest">Plus anciens</option>
          <option value="name">Nom A-Z</option>
          <option value="orders">Plus de commandes</option>
          <option value="revenue">CA décroissant</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-600">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Client</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Rôle</th>
                <th className="text-left py-3 px-4 font-medium">Inscription</th>
                <th className="text-left py-3 px-4 font-medium">Commandes</th>
                <th className="text-left py-3 px-4 font-medium">CA total</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium">
                      {customer.first_name && customer.last_name
                        ? `${customer.first_name} ${customer.last_name}`
                        : 'Sans nom'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {customer.email}
                  </td>
                  <td className="py-3 px-4">
                    {/* ✅ Gérer le cas où role est null */}
                    <Badge
                      variant={
                        customer.role === 'admin' ? 'default' : 'secondary'
                      }
                    >
                      {customer.role === 'admin' ? '👨‍💼 Admin' : '👤 Client'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {new Date(customer.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 px-4">{customer.order_count}</td>
                  <td className="py-3 px-4 font-medium">
                    {customer.total_revenue.toFixed(2)}€
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/customers/${customer.id}`}
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

      {initialCustomers.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Aucun client trouvé
        </div>
      )}
    </div>
  )
}
