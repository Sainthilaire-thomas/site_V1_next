// src/app/admin/(protected)/social/SocialDashboardClient.tsx

'use client'

import { useState } from 'react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  TrendingUp,
  TrendingDown,
  Instagram,
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Plus,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

// ✅ Interface avec tous les champs nullable
interface SocialPost {
  id: string | null
  post_type: string | null
  account_type: string | null
  account_handle: string | null
  caption: string | null
  post_url: string | null
  utm_campaign: string | null
  published_at: string | null

  // Métriques Instagram
  impressions: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  reach: number | null
  engagement_rate: number | null

  // Métriques Web
  web_visits: number | null
  web_add_to_cart: number | null
  web_purchases: number | null
  web_revenue: number | null
  web_conversion_rate: number | null
  web_avg_order_value: number | null
  cpm_revenue: number | null
}

interface SocialDashboardClientProps {
  initialData: SocialPost[]
}

export function SocialDashboardClient({
  initialData,
}: SocialDashboardClientProps) {
  const [posts] = useState<SocialPost[]>(initialData)
  const [period, setPeriod] = useState<'7d' | '30d'>('30d')

  // ✅ Helper pour gérer les valeurs nullables
  const safeNumber = (value: number | null | undefined): number => value ?? 0
  const safeString = (value: string | null | undefined): string => value ?? ''
  const safeDate = (value: string | null | undefined): Date => {
    if (!value) return new Date()
    try {
      return new Date(value)
    } catch {
      return new Date()
    }
  }

  // Calculer les statistiques agrégées
  const stats = {
    totalPosts: posts.length,

    // Instagram
    totalImpressions: posts.reduce(
      (sum, p) => sum + safeNumber(p.impressions),
      0
    ),
    totalEngagements: posts.reduce(
      (sum, p) =>
        sum +
        safeNumber(p.likes) +
        safeNumber(p.comments) +
        safeNumber(p.shares) +
        safeNumber(p.saves),
      0
    ),
    avgEngagementRate:
      posts.length > 0
        ? posts.reduce((sum, p) => sum + safeNumber(p.engagement_rate), 0) /
          posts.length
        : 0,

    // Web
    totalVisits: posts.reduce((sum, p) => sum + safeNumber(p.web_visits), 0),
    totalAddToCart: posts.reduce(
      (sum, p) => sum + safeNumber(p.web_add_to_cart),
      0
    ),
    totalPurchases: posts.reduce(
      (sum, p) => sum + safeNumber(p.web_purchases),
      0
    ),
    totalRevenue: posts.reduce((sum, p) => sum + safeNumber(p.web_revenue), 0),
    avgConversionRate:
      posts.length > 0
        ? posts.reduce((sum, p) => sum + safeNumber(p.web_conversion_rate), 0) /
          posts.length
        : 0,
  }

  // Top performers (posts triés par revenue)
  const topPosts = [...posts]
    .sort((a, b) => safeNumber(b.web_revenue) - safeNumber(a.web_revenue))
    .slice(0, 5)

  // Comparaison par compte
  const proStats = {
    posts: posts.filter((p) => p.account_type === 'pro').length,
    impressions: posts
      .filter((p) => p.account_type === 'pro')
      .reduce((sum, p) => sum + safeNumber(p.impressions), 0),
    visits: posts
      .filter((p) => p.account_type === 'pro')
      .reduce((sum, p) => sum + safeNumber(p.web_visits), 0),
    revenue: posts
      .filter((p) => p.account_type === 'pro')
      .reduce((sum, p) => sum + safeNumber(p.web_revenue), 0),
  }

  const persoStats = {
    posts: posts.filter((p) => p.account_type === 'perso').length,
    impressions: posts
      .filter((p) => p.account_type === 'perso')
      .reduce((sum, p) => sum + safeNumber(p.impressions), 0),
    visits: posts
      .filter((p) => p.account_type === 'perso')
      .reduce((sum, p) => sum + safeNumber(p.web_visits), 0),
    revenue: posts
      .filter((p) => p.account_type === 'perso')
      .reduce((sum, p) => sum + safeNumber(p.web_revenue), 0),
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Instagram className="h-8 w-8" />
            Social Media Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Suivez l'impact de vos posts Instagram sur vos ventes
          </p>
        </div>

        <div className="flex gap-2">
          <Select
            value={period}
            onValueChange={(v) => setPeriod(v as '7d' | '30d')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
            </SelectContent>
          </Select>

          <Button asChild>
            <Link href="/admin/social/posts/new">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau post
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Total Impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalImpressions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalPosts} posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              Visites générées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalVisits.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalAddToCart} ajouts au panier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPurchases}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Taux de conversion : {stats.avgConversionRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Chiffre d'affaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRevenue.toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ROI social media
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparaison Pro vs Perso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>Pro</Badge>
              Compte professionnel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Posts</span>
              <span className="font-medium">{proStats.posts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Impressions</span>
              <span className="font-medium">
                {proStats.impressions.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Visites</span>
              <span className="font-medium">{proStats.visits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">CA généré</span>
              <span className="font-medium">
                {proStats.revenue.toFixed(2)} €
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">Perso</Badge>
              Compte personnel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Posts</span>
              <span className="font-medium">{persoStats.posts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Impressions</span>
              <span className="font-medium">
                {persoStats.impressions.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Visites</span>
              <span className="font-medium">{persoStats.visits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">CA généré</span>
              <span className="font-medium">
                {persoStats.revenue.toFixed(2)} €
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top 5 posts performants
          </CardTitle>
          <CardDescription>
            Classés par chiffre d'affaires généré
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Visites</TableHead>
                <TableHead className="text-right">CA</TableHead>
                <TableHead className="text-right">Conv.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPosts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Aucun post pour le moment
                  </TableCell>
                </TableRow>
              ) : (
                topPosts.map((post) => (
                  <TableRow key={post.id || Math.random()}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium line-clamp-1">
                          {safeString(post.caption) || 'Sans caption'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {post.published_at &&
                            formatDistanceToNow(safeDate(post.published_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {safeNumber(post.impressions).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {safeNumber(post.web_visits)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {safeNumber(post.web_revenue).toFixed(2)} €
                    </TableCell>
                    <TableCell className="text-right">
                      {safeNumber(post.web_conversion_rate).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/admin/social/posts">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Instagram className="h-5 w-5" />
                Tous les posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gérez vos publications et mettez à jour leurs métriques
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/admin/social/links">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Générateur de liens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Créez des liens UTM pour tracker vos posts
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/admin/social/posts/new">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nouveau post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ajoutez un nouveau post à suivre
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}
