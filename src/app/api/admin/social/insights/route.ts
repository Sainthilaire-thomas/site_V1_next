// src/app/api/admin/social/insights/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// ⭐ Interface pour les posts (basée sur la vue social_posts_performance)
interface PostPerformance {
  id: string
  post_type: 'story' | 'feed' | 'reel' | 'carousel'
  account_type: 'pro' | 'perso'
  published_at: string
  impressions: number
  engagement_rate: number
  web_visits: number
  web_revenue: number
  web_conversion_rate: number
}

// ⭐ Interface pour les insights
interface Insight {
  type: 'success' | 'info' | 'warning'
  icon: string
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

// ⭐ Interface pour les stats par jour
interface DayStats {
  count: number
  revenue: number
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient() // ✅ AWAIT obligatoire

    // Vérifier l'authentification
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier le rôle admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Récupérer tous les posts des 30 derniers jours
    const since = new Date()
    since.setDate(since.getDate() - 30)

    const { data, error } = await supabase
      .from('social_posts_performance')
      .select('*')
      .gte('published_at', since.toISOString())

    if (error || !data) {
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    // ⭐ Typage des posts
    const posts = data as PostPerformance[]

    // Générer des insights intelligents
    const insights: Insight[] = []

    // ================================================
    // 1. Meilleur type de post par revenue
    // ================================================
    const revenueByType: Record<string, number> = {
      story: posts
        .filter((p: PostPerformance) => p.post_type === 'story')
        .reduce(
          (sum: number, p: PostPerformance) => sum + (p.web_revenue || 0),
          0
        ),
      feed: posts
        .filter((p: PostPerformance) => p.post_type === 'feed')
        .reduce(
          (sum: number, p: PostPerformance) => sum + (p.web_revenue || 0),
          0
        ),
      reel: posts
        .filter((p: PostPerformance) => p.post_type === 'reel')
        .reduce(
          (sum: number, p: PostPerformance) => sum + (p.web_revenue || 0),
          0
        ),
      carousel: posts
        .filter((p: PostPerformance) => p.post_type === 'carousel')
        .reduce(
          (sum: number, p: PostPerformance) => sum + (p.web_revenue || 0),
          0
        ),
    }

    const bestType = Object.entries(revenueByType).sort(
      (a, b) => b[1] - a[1]
    )[0]

    if (bestType && bestType[1] > 0) {
      insights.push({
        type: 'success',
        icon: 'TrendingUp',
        title: `Les ${bestType[0]}s performent le mieux`,
        description: `${bestType[1].toFixed(2)}€ générés avec ce format`,
        action: {
          label: 'Créer un ' + bestType[0],
          href: '/admin/social/posts/new',
        },
      })
    }

    // ================================================
    // 2. Meilleur compte (Pro vs Perso)
    // ================================================
    const proRevenue = posts
      .filter((p: PostPerformance) => p.account_type === 'pro')
      .reduce(
        (sum: number, p: PostPerformance) => sum + (p.web_revenue || 0),
        0
      )

    const persoRevenue = posts
      .filter((p: PostPerformance) => p.account_type === 'perso')
      .reduce(
        (sum: number, p: PostPerformance) => sum + (p.web_revenue || 0),
        0
      )

    if (proRevenue > persoRevenue * 1.5) {
      insights.push({
        type: 'info',
        icon: 'Instagram',
        title: 'Le compte Pro convertit mieux',
        description: `${((proRevenue / persoRevenue - 1) * 100).toFixed(0)}% plus de CA que le compte perso`,
      })
    } else if (persoRevenue > proRevenue * 1.5) {
      insights.push({
        type: 'info',
        icon: 'Instagram',
        title: 'Le compte Perso convertit mieux',
        description: `${((persoRevenue / proRevenue - 1) * 100).toFixed(0)}% plus de CA que le compte pro`,
      })
    }

    // ================================================
    // 3. Posts peu performants récents
    // ================================================
    const recentLowPerformers = posts.filter((p: PostPerformance) => {
      const daysAgo =
        (Date.now() - new Date(p.published_at).getTime()) /
        (1000 * 60 * 60 * 24)
      return daysAgo <= 7 && p.web_visits < 10
    })

    if (recentLowPerformers.length > 0) {
      insights.push({
        type: 'warning',
        icon: 'AlertCircle',
        title: `${recentLowPerformers.length} post(s) récent(s) avec peu de trafic`,
        description: 'Moins de 10 visites générées',
        action: {
          label: 'Voir les posts',
          href: '/admin/social/posts',
        },
      })
    }

    // ================================================
    // 4. Meilleur jour de publication
    // ================================================
    const postsByDay = posts.reduce(
      (acc: Record<string, DayStats>, p: PostPerformance) => {
        const day = new Date(p.published_at).toLocaleDateString('fr-FR', {
          weekday: 'long',
        })
        if (!acc[day]) acc[day] = { count: 0, revenue: 0 }
        acc[day].count++
        acc[day].revenue += p.web_revenue || 0
        return acc
      },
      {} as Record<string, DayStats>
    )

    const bestDayEntry = Object.entries(postsByDay)
      .filter(([_, stats]: [string, DayStats]) => stats.count >= 2) // Au moins 2 posts
      .sort((a, b) => {
        const [, aStats] = a as [string, DayStats]
        const [, bStats] = b as [string, DayStats]
        return bStats.revenue / bStats.count - aStats.revenue / aStats.count
      })[0]

    if (bestDayEntry) {
      const [day, stats] = bestDayEntry as [string, DayStats]
      insights.push({
        type: 'success',
        icon: 'Calendar',
        title: `Meilleur jour : ${day}`,
        description: `${(stats.revenue / stats.count).toFixed(2)}€ en moyenne par post`,
      })
    }

    // ================================================
    // 5. Tendance engagement vs conversion
    // ================================================
    const avgEngagement =
      posts.reduce(
        (sum: number, p: PostPerformance) => sum + (p.engagement_rate || 0),
        0
      ) / (posts.length || 1) // ✅ Éviter division par zéro

    const avgConversion =
      posts.reduce(
        (sum: number, p: PostPerformance) => sum + (p.web_conversion_rate || 0),
        0
      ) / (posts.length || 1) // ✅ Éviter division par zéro

    if (avgEngagement > 5 && avgConversion < 1) {
      insights.push({
        type: 'info',
        icon: 'Info',
        title: 'Bon engagement, faible conversion',
        description: `${avgEngagement.toFixed(1)}% d'engagement mais seulement ${avgConversion.toFixed(1)}% de conversion`,
        action: {
          label: 'Optimiser les liens',
          href: '/admin/social/links',
        },
      })
    }

    return NextResponse.json({ success: true, insights })
  } catch (error: any) {
    console.error('Error in GET /api/admin/social/insights:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
