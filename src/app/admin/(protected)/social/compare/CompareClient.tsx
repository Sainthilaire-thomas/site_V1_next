// src/app/admin/(protected)/social/compare/CompareClient.tsx

'use client'

import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Instagram,
  DollarSign,
  Eye,
  MousePointerClick,
  ShoppingCart,
} from 'lucide-react'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface Post {
  id: string | null
  post_type: string | null
  account_type: string | null
  account_handle: string | null
  published_at: string | null
  impressions: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  engagement_rate: number | null
  web_visits: number | null
  web_add_to_cart: number | null
  web_purchases: number | null
  web_revenue: number | null
  web_conversion_rate: number | null
}

interface CompareClientProps {
  posts: Post[]
}

const COLORS = {
  pro: '#8b5cf6', // violet
  perso: '#06b6d4', // cyan
  story: '#f59e0b', // amber
  feed: '#3b82f6', // blue
  reel: '#ec4899', // pink
  carousel: '#10b981', // green
}

export function CompareClient({ posts }: CompareClientProps) {
  const [compareBy, setCompareBy] = useState<'account' | 'type'>('account')
  const [metric, setMetric] = useState<
    'impressions' | 'revenue' | 'conversion'
  >('revenue')
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d')

  // Helper functions
  const safeNumber = (value: number | null | undefined): number => value ?? 0
  const safeString = (value: string | null | undefined): string => value ?? ''

  // Filtrer par période
  const filteredPosts = useMemo(() => {
    if (period === 'all') return posts

    const now = new Date()
    const daysAgo = period === '7d' ? 7 : 30
    const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

    return posts.filter((p) => {
      if (!p.published_at) return false
      return new Date(p.published_at) >= cutoff
    })
  }, [posts, period])

  // Statistiques par compte
  const accountStats = useMemo(() => {
    const pro = filteredPosts.filter((p) => p.account_type === 'pro')
    const perso = filteredPosts.filter((p) => p.account_type === 'perso')

    return {
      pro: {
        count: pro.length,
        impressions: pro.reduce((sum, p) => sum + safeNumber(p.impressions), 0),
        engagements:
          pro.reduce((sum, p) => sum + safeNumber(p.likes), 0) +
          pro.reduce((sum, p) => sum + safeNumber(p.comments), 0) +
          pro.reduce((sum, p) => sum + safeNumber(p.shares), 0) +
          pro.reduce((sum, p) => sum + safeNumber(p.saves), 0),
        visits: pro.reduce((sum, p) => sum + safeNumber(p.web_visits), 0),
        purchases: pro.reduce((sum, p) => sum + safeNumber(p.web_purchases), 0),
        revenue: pro.reduce((sum, p) => sum + safeNumber(p.web_revenue), 0),
        avgConversion:
          pro.length > 0
            ? pro.reduce(
                (sum, p) => sum + safeNumber(p.web_conversion_rate),
                0
              ) / pro.length
            : 0,
      },
      perso: {
        count: perso.length,
        impressions: perso.reduce(
          (sum, p) => sum + safeNumber(p.impressions),
          0
        ),
        engagements:
          perso.reduce((sum, p) => sum + safeNumber(p.likes), 0) +
          perso.reduce((sum, p) => sum + safeNumber(p.comments), 0) +
          perso.reduce((sum, p) => sum + safeNumber(p.shares), 0) +
          perso.reduce((sum, p) => sum + safeNumber(p.saves), 0),
        visits: perso.reduce((sum, p) => sum + safeNumber(p.web_visits), 0),
        purchases: perso.reduce(
          (sum, p) => sum + safeNumber(p.web_purchases),
          0
        ),
        revenue: perso.reduce((sum, p) => sum + safeNumber(p.web_revenue), 0),
        avgConversion:
          perso.length > 0
            ? perso.reduce(
                (sum, p) => sum + safeNumber(p.web_conversion_rate),
                0
              ) / perso.length
            : 0,
      },
    }
  }, [filteredPosts])

  // Statistiques par type
  const typeStats = useMemo(() => {
    const types = ['story', 'feed', 'reel', 'carousel']
    return types.reduce(
      (acc, type) => {
        const typePosts = filteredPosts.filter((p) => p.post_type === type)
        acc[type] = {
          count: typePosts.length,
          impressions: typePosts.reduce(
            (sum, p) => sum + safeNumber(p.impressions),
            0
          ),
          engagements:
            typePosts.reduce((sum, p) => sum + safeNumber(p.likes), 0) +
            typePosts.reduce((sum, p) => sum + safeNumber(p.comments), 0) +
            typePosts.reduce((sum, p) => sum + safeNumber(p.shares), 0) +
            typePosts.reduce((sum, p) => sum + safeNumber(p.saves), 0),
          visits: typePosts.reduce(
            (sum, p) => sum + safeNumber(p.web_visits),
            0
          ),
          purchases: typePosts.reduce(
            (sum, p) => sum + safeNumber(p.web_purchases),
            0
          ),
          revenue: typePosts.reduce(
            (sum, p) => sum + safeNumber(p.web_revenue),
            0
          ),
          avgConversion:
            typePosts.length > 0
              ? typePosts.reduce(
                  (sum, p) => sum + safeNumber(p.web_conversion_rate),
                  0
                ) / typePosts.length
              : 0,
        }
        return acc
      },
      {} as Record<string, any>
    )
  }, [filteredPosts])

  // Données pour les graphiques
  const chartData = useMemo(() => {
    if (compareBy === 'account') {
      return [
        {
          name: 'Pro',
          impressions: accountStats.pro.impressions,
          engagements: accountStats.pro.engagements,
          visites: accountStats.pro.visits,
          revenue: accountStats.pro.revenue,
          posts: accountStats.pro.count,
        },
        {
          name: 'Perso',
          impressions: accountStats.perso.impressions,
          engagements: accountStats.perso.engagements,
          visites: accountStats.perso.visits,
          revenue: accountStats.perso.revenue,
          posts: accountStats.perso.count,
        },
      ]
    } else {
      return Object.entries(typeStats).map(([type, stats]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        impressions: stats.impressions,
        engagements: stats.engagements,
        visites: stats.visits,
        revenue: stats.revenue,
        posts: stats.count,
      }))
    }
  }, [compareBy, accountStats, typeStats])

  // Données pour le graphique circulaire
  const pieData = useMemo(() => {
    if (compareBy === 'account') {
      return [
        { name: 'Pro', value: accountStats.pro.revenue, color: COLORS.pro },
        {
          name: 'Perso',
          value: accountStats.perso.revenue,
          color: COLORS.perso,
        },
      ]
    } else {
      return Object.entries(typeStats).map(([type, stats]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: stats.revenue,
        color: COLORS[type as keyof typeof COLORS],
      }))
    }
  }, [compareBy, accountStats, typeStats])

  // Calcul des différences
  const getDifference = (val1: number, val2: number) => {
    if (val2 === 0) return val1 > 0 ? 100 : 0
    return ((val1 - val2) / val2) * 100
  }

  const getMetricValue = (stat: any) => {
    switch (metric) {
      case 'impressions':
        return stat.impressions
      case 'revenue':
        return stat.revenue
      case 'conversion':
        return stat.avgConversion
      default:
        return 0
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Comparaison des performances
          </h1>
          <p className="text-muted-foreground mt-1">
            Analysez et comparez vos posts Instagram
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href="/admin/social">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Link>
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paramètres de comparaison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Comparer par */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Comparer par</label>
              <Select
                value={compareBy}
                onValueChange={(v) => setCompareBy(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">Compte (Pro vs Perso)</SelectItem>
                  <SelectItem value="type">Type de post</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Métrique */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Métrique principale</label>
              <Select value={metric} onValueChange={(v) => setMetric(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="impressions">Impressions</SelectItem>
                  <SelectItem value="revenue">Chiffre d'affaires</SelectItem>
                  <SelectItem value="conversion">Taux de conversion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Période */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Période</label>
              <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 derniers jours</SelectItem>
                  <SelectItem value="30d">30 derniers jours</SelectItem>
                  <SelectItem value="all">Tout</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredPosts.length} post{filteredPosts.length > 1 ? 's' : ''}{' '}
            analysé
            {filteredPosts.length > 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Comparaison par compte */}
      {compareBy === 'account' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Compte Pro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge style={{ backgroundColor: COLORS.pro }}>Pro</Badge>
                Compte professionnel
              </CardTitle>
              <CardDescription>{accountStats.pro.count} posts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Impressions
                  </span>
                  <span className="font-bold">
                    {accountStats.pro.impressions.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Engagements
                  </span>
                  <span className="font-bold">
                    {accountStats.pro.engagements.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <MousePointerClick className="h-4 w-4" />
                    Visites
                  </span>
                  <span className="font-bold">{accountStats.pro.visits}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Achats
                  </span>
                  <span className="font-bold">
                    {accountStats.pro.purchases}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Revenue
                  </span>
                  <span className="text-xl font-bold">
                    {accountStats.pro.revenue.toFixed(2)} €
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Conversion
                  </span>
                  <Badge variant="secondary">
                    {accountStats.pro.avgConversion.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compte Perso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: COLORS.perso }}
                >
                  Perso
                </Badge>
                Compte personnel
              </CardTitle>
              <CardDescription>
                {accountStats.perso.count} posts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Impressions
                  </span>
                  <span className="font-bold">
                    {accountStats.perso.impressions.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Engagements
                  </span>
                  <span className="font-bold">
                    {accountStats.perso.engagements.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <MousePointerClick className="h-4 w-4" />
                    Visites
                  </span>
                  <span className="font-bold">{accountStats.perso.visits}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Achats
                  </span>
                  <span className="font-bold">
                    {accountStats.perso.purchases}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Revenue
                  </span>
                  <span className="text-xl font-bold">
                    {accountStats.perso.revenue.toFixed(2)} €
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Conversion
                  </span>
                  <Badge variant="secondary">
                    {accountStats.perso.avgConversion.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique en barres */}
        <Card>
          <CardHeader>
            <CardTitle>Comparaison détaillée</CardTitle>
            <CardDescription>Toutes les métriques côte à côte</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="impressions"
                  fill={COLORS.pro}
                  name="Impressions"
                />
                <Bar dataKey="visites" fill={COLORS.perso} name="Visites" />
                <Bar dataKey="revenue" fill="#10b981" name="CA (€)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graphique circulaire */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition du CA</CardTitle>
            <CardDescription>
              Distribution du chiffre d'affaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) =>
                    `${entry.name}: ${entry.value.toFixed(0)}€`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {compareBy === 'account' && (
              <>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                  {accountStats.pro.revenue > accountStats.perso.revenue ? (
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">
                      Le compte{' '}
                      {accountStats.pro.revenue > accountStats.perso.revenue
                        ? 'Pro'
                        : 'Perso'}{' '}
                      génère plus de CA
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.abs(
                        getDifference(
                          accountStats.pro.revenue,
                          accountStats.perso.revenue
                        )
                      ).toFixed(0)}
                      % de différence
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                  {accountStats.pro.avgConversion >
                  accountStats.perso.avgConversion ? (
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">
                      Meilleur taux de conversion :{' '}
                      {accountStats.pro.avgConversion >
                      accountStats.perso.avgConversion
                        ? 'Pro'
                        : 'Perso'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(accountStats.pro.avgConversion >
                      accountStats.perso.avgConversion
                        ? accountStats.pro.avgConversion
                        : accountStats.perso.avgConversion
                      ).toFixed(2)}
                      % en moyenne
                    </p>
                  </div>
                </div>
              </>
            )}

            {compareBy === 'type' && (
              <>
                {Object.entries(typeStats)
                  .sort((a, b) => b[1].revenue - a[1].revenue)
                  .slice(0, 1)
                  .map(([type, stats]) => (
                    <div
                      key={type}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted"
                    >
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          Meilleur format :{' '}
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {stats.revenue.toFixed(2)} € générés avec{' '}
                          {stats.count} posts
                        </p>
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
