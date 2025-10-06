'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/admin/Toast'
import { OrdersTab } from './tabs/OrdersTab'
import { AddressesTab } from './tabs/AddressesTab'
import { NotesTab } from './tabs/NotesTab'
import { updateCustomerAction } from './actions'

type Customer = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  role: string | null
  avatar_url: string | null
  created_at: string
}

type Stats = {
  orderCount: number
  totalRevenue: number
  averageOrder: number
}

type Order = {
  id: string
  order_number: string
  status: string | null
  total_amount: number
  created_at: string
}

type Address = {
  id: string
  type: string | null
  first_name: string | null
  last_name: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  postal_code: string | null
  country: string | null
  is_default: boolean | null
}

type Note = {
  id: string
  note: string
  created_at: string
  admin: {
    first_name: string | null
    last_name: string | null
  }
}

type Props = {
  customer: Customer
  stats: Stats
  recentOrders: Order[]
  allOrders: Order[]
  addresses: Address[]
  notes: Note[]
}

export function CustomerDetailClient({
  customer: initialCustomer,
  stats,
  recentOrders,
  allOrders,
  addresses,
  notes: initialNotes,
}: Props) {
  const router = useRouter()
  const { showToast } = useToast()

  const [customer, setCustomer] = useState(initialCustomer)
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'notes'>(
    'orders'
  )
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    first_name: customer.first_name || '',
    last_name: customer.last_name || '',
    phone: customer.phone || '',
    role: customer.role || 'customer',
  })

  async function handleSave() {
    try {
      const result = await updateCustomerAction(customer.id, editForm)
      if (result.ok) {
        setCustomer({ ...customer, ...editForm })
        setIsEditing(false)
        showToast('Client mis à jour', 'success')
        router.refresh()
      } else {
        showToast('Erreur lors de la mise à jour', 'error')
      }
    } catch {
      showToast('Erreur serveur', 'error')
    }
  }

  function handleCancel() {
    setEditForm({
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      phone: customer.phone || '',
      role: customer.role || 'customer',
    })
    setIsEditing(false)
  }

  const displayName =
    customer.first_name && customer.last_name
      ? `${customer.first_name} ${customer.last_name}`
      : customer.email

  // Normalisations pour matcher les types attendus par les onglets (non-nullables)
  const normalizedOrders = allOrders.map((o) => ({
    ...o,
    status: o.status ?? '', // OrdersTab attend probablement string
  }))

  const normalizedNotes = initialNotes.map((n) => ({
    ...n,
    admin: {
      first_name: n.admin.first_name ?? '',
      last_name: n.admin.last_name ?? '',
    },
  }))

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="text-sm">
        <Link
          href="/admin/customers"
          className="underline hover:text-violet transition-colors"
        >
          ← Retour aux clients
        </Link>
      </div>

      {/* En-tête */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-800">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3 max-w-md">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Prénom"
                    value={editForm.first_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, first_name: e.target.value })
                    }
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Nom"
                    value={editForm.last_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, last_name: e.target.value })
                    }
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2"
                />
                <select
                  value={editForm.role || 'customer'}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2"
                >
                  <option value="customer">👤 Client</option>
                  <option value="admin">👨‍💼 Administrateur</option>
                </select>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-semibold mb-2">{displayName}</h1>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>📧 {customer.email}</div>
                  {customer.phone && <div>📱 {customer.phone}</div>}
                  <div>
                    📅 Inscrit le{' '}
                    {new Date(customer.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant={customer.role === 'admin' ? 'default' : 'secondary'}
            >
              {customer.role === 'admin' ? '👨‍💼 Admin' : '👤 Client'}
            </Badge>

            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                >
                  ✓ Sauver
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  ✕ Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-violet text-violet rounded hover:bg-violet hover:text-white transition-colors text-sm"
              >
                ✏️ Modifier
              </button>
            )}
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Commandes
            </div>
            <div className="text-2xl font-bold">{stats.orderCount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              CA total
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.totalRevenue.toFixed(2)}€
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Panier moyen
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.averageOrder.toFixed(2)}€
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          <a
            href={`mailto:${customer.email}`}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            📧 Envoyer un email
          </a>
        </div>
      </div>

      {/* Onglets */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
        {/* En-têtes des onglets */}
        <div className="flex border-b border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-violet text-white'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            📦 Commandes ({allOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'addresses'
                ? 'bg-violet text-white'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            📍 Adresses ({addresses.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'notes'
                ? 'bg-violet text-white'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            📝 Notes ({initialNotes.length})
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {activeTab === 'orders' && (
            <OrdersTab orders={normalizedOrders as any} />
          )}
          {activeTab === 'addresses' && <AddressesTab addresses={addresses} />}
          {activeTab === 'notes' && (
            <NotesTab
              customerId={customer.id}
              initialNotes={normalizedNotes as any}
            />
          )}
        </div>
      </div>
    </div>
  )
}
