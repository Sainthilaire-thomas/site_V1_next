// src/app/admin/analytics/page.tsx
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { getServerSupabase } from '@/lib/supabase-server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BarChart3,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
} from 'lucide-react'

export default async function AnalyticsPage() {
  await requireAdmin()

  const supabase = await getServerSupabase()

  // Date de début du mois en cours
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Date il y a 30 jours
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Récupérer les stats depuis Supabase
  const [
    { count: ordersThisMonth },
    { data: revenueData },
    { count: totalCustomers },
    { count: ordersLast30Days },
  ] = await Promise.all([
    // Commandes ce mois
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString()),

    // Revenu ce mois
    supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString()),

    // Total clients
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer'),

    // Commandes 30 derniers jours
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString()),
  ])

  // Calculer le revenu total avec types corrects
  const totalRevenue =
    revenueData?.reduce(
      (sum: number, order: { total_amount?: number | null }) => {
        return sum + (order.total_amount || 0)
      },
      0
    ) || 0

  // Calculer le panier moyen
  const averageOrder =
    ordersThisMonth && ordersThisMonth > 0
      ? (totalRevenue / ordersThisMonth).toFixed(2)
      : '0.00'

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-gray-500 mt-2">
          Vue d'ensemble des performances de votre boutique
        </p>
      </div>

      {/* KPIs E-commerce */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Commandes ce mois */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Commandes (mois)
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersThisMonth || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              Depuis le {startOfMonth.toLocaleDateString('fr-FR')}
            </p>
          </CardContent>
        </Card>

        {/* Revenu ce mois */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu (mois)</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toFixed(2)} €
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Commandes complétées uniquement
            </p>
          </CardContent>
        </Card>

        {/* Panier moyen */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageOrder} €</div>
            <p className="text-xs text-gray-500 mt-1">Moyenne par commande</p>
          </CardContent>
        </Card>

        {/* Total clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total clients</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Comptes clients actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Vercel Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Vercel Analytics
          </CardTitle>
          <CardDescription>
            Statistiques de trafic en temps réel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-gray-50 dark:bg-gray-900 p-8 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Vos analytics Vercel sont actifs ! 🎉
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Consultez les statistiques détaillées de visiteurs, pages vues, et
              performances sur :
            </p>
            <a
              href="https://vercel.com/dashboard/analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet text-white rounded-lg hover:bg-violet/90 transition-colors text-sm font-medium"
            >
              Ouvrir Vercel Analytics →
            </a>
          </div>

          {/* Instructions pour l'iframe (optionnel) */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              💡 Intégrer le dashboard ici
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Pour afficher vos stats directement sur cette page, allez dans les
              paramètres Vercel Analytics et activez l'option "Public Dashboard"
              pour obtenir une URL d'intégration.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Speed Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Speed Insights
          </CardTitle>
          <CardDescription>Performance et Core Web Vitals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-gray-50 dark:bg-gray-900 p-8 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Analysez les performances de votre site en temps réel
            </p>
            <a
              href="https://vercel.com/dashboard/speed-insights"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet text-white rounded-lg hover:bg-violet/90 transition-colors text-sm font-medium"
            >
              Ouvrir Speed Insights →
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Info complémentaire */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Événements e-commerce trackés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Les événements suivants sont automatiquement trackés (si
              implémentés) :
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-500 ml-4">
              <li>
                Vue produit (
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  view_product
                </code>
                )
              </li>
              <li>
                Ajout au panier (
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  add_to_cart
                </code>
                )
              </li>
              <li>
                Début du checkout (
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  begin_checkout
                </code>
                )
              </li>
              <li>
                Achat complété (
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  purchase
                </code>
                )
              </li>
              <li>
                Ajout à la wishlist (
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  add_to_wishlist
                </code>
                )
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">
              💡 Pour voir ces événements dans Vercel Analytics, ils doivent
              être implémentés dans vos composants avec{' '}
              <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                trackEvent
              </code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
