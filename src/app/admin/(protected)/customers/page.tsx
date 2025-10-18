import { CustomersClient } from './CustomersClient'
import { getCustomers, getCustomerStats } from '@/lib/services/customerService'

export const dynamic = 'force-dynamic'

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    role?: string
    sort?: string
  }>
}) {
  const params = await searchParams

  try {
    // Appel direct aux fonctions de service
    const [customersData, stats] = await Promise.all([
      getCustomers({
        q: params.q,
        role: params.role,
        sort: params.sort,
      }),
      getCustomerStats(),
    ])

    return (
      <CustomersClient
        initialCustomers={customersData.customers}
        initialStats={stats}
        initialTotal={customersData.total}
      />
    )
  } catch (error) {
    console.error('Error loading customers:', error)

    // Retour avec valeurs par défaut en cas d'erreur
    return (
      <CustomersClient
        initialCustomers={[]}
        initialStats={{
          total: 0,
          newThisMonth: 0,
          active: 0,
          totalRevenue: 0,
        }}
        initialTotal={0}
      />
    )
  }
}
