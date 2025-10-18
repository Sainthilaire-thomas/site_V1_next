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
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
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
  Clock,
  Tablet,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

interface AnalyticsData {
  visitors: number
  pageViews: number
  bounceRate: number
  avgTimeOnSite: number
  topPages: Array<{ path: string; title: string; views: number }>
  referrers: Array<{ source: string; visitors: number }>
  countries: Array<{ country: string; visitors: number }>
  devices: Array<{ device: string; visitors: number }>
  dailyStats: Array<{ date: string; visitors: number; pageviews: number }>
  ecommerce: {
    addToCart: number
    purchases: number
    revenue: number
    conversionRate: string
  }
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('7d')
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/admin/analytics/custom?period=${period}`
      )
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors du chargement')
      }

      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Format temps (secondes → minutes:secondes)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format date pour le graphique
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-gray-500 mt-2">
            📊 Statistiques temps réel depuis votre base Supabase
          </p>
        </div>

        {/* Sélecteur de période */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
          disabled={loading}
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
          <AlertDescription>{error}</AlertDescription>
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
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.visitors || 0}</div>
            )}
            <p className="text-xs text-gray-500 mt-1">Sessions uniques</p>
          </CardContent>
        </Card>

        {/* Pages vues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages vues</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.pageViews || 0}</div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Taux de rebond : {data?.bounceRate || 0}%
            </p>
          </CardContent>
        </Card>

        {/* Temps moyen */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps moyen</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {formatTime(data?.avgTimeOnSite || 0)}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">Par session</p>
          </CardContent>
        </Card>

        {/* Conversion */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {data?.ecommerce.conversionRate || '0.00'}%
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {data?.ecommerce.purchases || 0} achats
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique principal */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Évolution du trafic</CardTitle>
          <CardDescription>
            Visiteurs et pages vues sur la période
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : data?.dailyStats && data.dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#6b7280"
                />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  labelFormatter={formatDate}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke="#6366f1"
                  strokeWidth={2}
                  name="Visiteurs"
                  dot={{ fill: '#6366f1', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="pageviews"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Pages vues"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Pas encore de données
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs détaillés */}
      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages">
            <BarChart3 className="h-4 w-4 mr-2" />
            Pages populaires
          </TabsTrigger>
          <TabsTrigger value="traffic">
            <Globe className="h-4 w-4 mr-2" />
            Sources
          </TabsTrigger>
          <TabsTrigger value="devices">
            <Monitor className="h-4 w-4 mr-2" />
            Appareils
          </TabsTrigger>
          <TabsTrigger value="ecommerce">
            <ShoppingCart className="h-4 w-4 mr-2" />
            E-commerce
          </TabsTrigger>
        </TabsList>

        {/* Pages populaires */}
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>📄 Pages les plus visitées</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : data?.topPages && data.topPages.length > 0 ? (
                <div className="space-y-2">
                  {data.topPages.map((page, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800 border"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-400">
                          #{i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <code className="text-sm block truncate">
                            {page.path}
                          </code>
                          {page.title && (
                            <p className="text-xs text-gray-500 truncate">
                              {page.title}
                            </p>
                          )}
                        </div>
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
                <p className="text-center py-8 text-gray-500">
                  Pas encore de données
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sources de trafic */}
        <TabsContent value="traffic">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Referrers */}
            <Card>
              <CardHeader>
                <CardTitle>🔗 Sources de trafic</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : data?.referrers && data.referrers.length > 0 ? (
                  <div className="space-y-2">
                    {data.referrers.map((ref, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <span className="text-sm truncate">{ref.source}</span>
                        <span className="text-sm font-medium">
                          {ref.visitors}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500 text-sm">
                    Pas encore de sources externes
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pays */}
            <Card>
              <CardHeader>
                <CardTitle>🌍 Visiteurs par pays</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : data?.countries && data.countries.length > 0 ? (
                  <div className="space-y-2">
                    {data.countries.map((country, i) => (
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
                  <p className="text-center py-8 text-gray-500 text-sm">
                    Données de géolocalisation non disponibles
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appareils */}
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>📱 Appareils utilisés</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : data?.devices && data.devices.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {data.devices.map((device, i) => {
                    const Icon =
                      device.device === 'mobile'
                        ? Smartphone
                        : device.device === 'tablet'
                          ? Tablet
                          : Monitor

                    const total = data.devices.reduce(
                      (sum, d) => sum + d.visitors,
                      0
                    )
                    const percentage = (
                      (device.visitors / total) *
                      100
                    ).toFixed(1)

                    return (
                      <Card key={i}>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <Icon className="h-8 w-8 text-violet" />
                            <div>
                              <p className="text-sm font-medium capitalize">
                                {device.device}
                              </p>
                              <p className="text-2xl font-bold">
                                {device.visitors}
                              </p>
                              <p className="text-xs text-gray-500">
                                {percentage}% du trafic
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  Pas encore de données
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* E-commerce */}
        <TabsContent value="ecommerce">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ajouts au panier</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">
                    {data?.ecommerce.addToCart || 0}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Achats</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">
                    {data?.ecommerce.purchases || 0}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Revenu</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">
                    {data?.ecommerce.revenue.toFixed(2) || '0.00'} €
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taux de conversion</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">
                    {data?.ecommerce.conversionRate || '0.00'}%
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
