// src/app/admin/analytics/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  Globe,
  Monitor,
  Smartphone,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AnalyticsData {
  visitors: number
  pageViews: number
  bounceRate: number
  topPages: Array<{ path: string; views: number }>
  referrers: Array<{ source: string; visitors: number }>
  countries: Array<{ country: string; visitors: number }>
  devices: Array<{ device: string; visitors: number }>
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('7d')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [ecommerceData, setEcommerceData] = useState({
    orders: 0,
    revenue: 0,
    averageOrder: 0,
    customers: 0,
  })

  // Charger les données Vercel Analytics
  useEffect(() => {
    fetchAnalytics()
  }, [period])

  // Charger les données e-commerce (simulées pour l'instant)
  useEffect(() => {
    // TODO: Remplacer par de vraies données depuis Supabase
    setEcommerceData({
      orders: 38,
      revenue: 4250.0,
      averageOrder: 111.84,
      customers: 156,
    })
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/admin/analytics/vercel?period=${period}`
      )
      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Erreur lors du chargement des analytics'
        )
      }

      // Afficher un avertissement si données mockées
      if (result.mock) {
        console.warn('⚠️ Using mock data:', result.message)
      }

      setAnalyticsData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-gray-500 mt-2">
            Vue d'ensemble des performances de votre boutique
          </p>
        </div>

        {/* Sélecteur de période */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="7d">7 derniers jours</option>
          <option value="30d">30 derniers jours</option>
          <option value="90d">90 derniers jours</option>
        </select>
      </div>

      {/* Message d'erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <br />
            <span className="text-xs mt-2 block">
              Vérifiez que les variables VERCEL_API_TOKEN, VERCEL_TEAM_ID et
              VERCEL_PROJECT_ID sont configurées dans .env.local
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* KPIs principaux */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Visiteurs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visiteurs</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : analyticsData?.visitors || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {period === '7d'
                ? '7 derniers jours'
                : period === '30d'
                  ? '30 derniers jours'
                  : '90 derniers jours'}
            </p>
          </CardContent>
        </Card>

        {/* Pages vues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages vues</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : analyticsData?.pageViews || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Taux de rebond : {analyticsData?.bounceRate || 0}%
            </p>
          </CardContent>
        </Card>

        {/* Commandes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ecommerceData.orders}</div>
            <p className="text-xs text-gray-500 mt-1">
              {ecommerceData.revenue.toFixed(2)} € de revenu
            </p>
          </CardContent>
        </Card>

        {/* Panier moyen */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier moyen</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ecommerceData.averageOrder.toFixed(2)} €
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {ecommerceData.customers} clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs détaillés */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="pages">
            <BarChart3 className="h-4 w-4 mr-2" />
            Pages populaires
          </TabsTrigger>
          <TabsTrigger value="traffic">
            <Globe className="h-4 w-4 mr-2" />
            Sources de trafic
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top pays */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">🌍 Visiteurs par pays</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-gray-500">Chargement...</p>
                ) : analyticsData?.countries &&
                  analyticsData.countries.length > 0 ? (
                  <div className="space-y-2">
                    {analyticsData.countries.slice(0, 5).map((country, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <span className="text-sm">{country.country}</span>
                        <span className="text-sm font-medium">
                          {country.visitors}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Pas encore de données</p>
                )}
              </CardContent>
            </Card>

            {/* Appareils */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">📱 Appareils utilisés</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-gray-500">Chargement...</p>
                ) : analyticsData?.devices &&
                  analyticsData.devices.length > 0 ? (
                  <div className="space-y-2">
                    {analyticsData.devices.map((device, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center gap-2">
                          {device.device === 'mobile' ? (
                            <Smartphone className="h-4 w-4" />
                          ) : (
                            <Monitor className="h-4 w-4" />
                          )}
                          <span className="text-sm capitalize">
                            {device.device}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {device.visitors}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Pas encore de données</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pages populaires */}
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>📄 Pages les plus visitées</CardTitle>
              <CardDescription>
                Les contenus qui attirent le plus de visiteurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-gray-500">Chargement...</p>
              ) : analyticsData?.topPages &&
                analyticsData.topPages.length > 0 ? (
                <div className="space-y-2">
                  {analyticsData.topPages.slice(0, 10).map((page, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800 border"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-400">
                          #{i + 1}
                        </span>
                        <code className="text-sm">{page.path}</code>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">
                          {page.views} vues
                        </span>
                        <a
                          href={page.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet hover:text-violet/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Pas encore de données</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sources de trafic */}
        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>🔗 Sources de trafic</CardTitle>
              <CardDescription>D'où viennent vos visiteurs</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-gray-500">Chargement...</p>
              ) : analyticsData?.referrers &&
                analyticsData.referrers.length > 0 ? (
                <div className="space-y-2">
                  {analyticsData.referrers.slice(0, 10).map((referrer, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800 border"
                    >
                      <span className="text-sm">{referrer.source}</span>
                      <span className="text-sm font-medium">
                        {referrer.visitors} visiteurs
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 mb-2">
                    Pas encore de sources de trafic
                  </p>
                  <p className="text-xs text-gray-400">
                    Les données apparaîtront après les premières visites
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
