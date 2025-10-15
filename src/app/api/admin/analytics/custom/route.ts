// src/app/api/admin/analytics/custom/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createServerClient } from '@/lib/supabase-server'

/**
 * GET /api/admin/analytics/custom?period=7d
 *
 * Récupère les stats analytics depuis Supabase
 * Réservé aux admins
 */
export async function GET(request: Request) {
  try {
    // Vérifier que l'utilisateur est admin
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) {
      return adminCheck
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'

    // Calculer la date de début
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const since = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString()

    const supabase = await createServerClient()

    // ============================================
    // 1. VISITEURS UNIQUES (sessions)
    // ============================================
    const { data: sessionData } = await supabase
      .from('analytics_events')
      .select('session_id')
      .gte('created_at', since)
      .eq('event_type', 'pageview')

    const uniqueVisitors = new Set(
      sessionData?.map((s: { session_id: string }) => s.session_id) || []
    ).size

    // ============================================
    // 2. PAGES VUES
    // ============================================
    const { count: pageViews } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since)
      .eq('event_type', 'pageview')

    // ============================================
    // 3. BOUNCE RATE
    // ============================================
    // Compter les sessions avec 1 seule pageview
    const sessionPageCounts = sessionData?.reduce(
      (acc: Record<string, number>, s: { session_id: string }) => {
        acc[s.session_id] = (acc[s.session_id] || 0) + 1
        return acc
      },
      {}
    )

    const bounces = Object.values(sessionPageCounts || {}).filter(
      (count) => count === 1
    ).length
    const bounceRate =
      uniqueVisitors > 0 ? Math.round((bounces / uniqueVisitors) * 100) : 0

    // ============================================
    // 4. TOP PAGES (via fonction SQL)
    // ============================================
    const { data: topPages } = await supabase.rpc('get_top_pages', {
      since_date: since,
    })

    // ============================================
    // 5. STATS JOURNALIÈRES (pour le graphique)
    // ============================================
    const { data: dailyStats } = await supabase.rpc('get_daily_stats', {
      since_date: since,
    })

    // ============================================
    // 6. REFERRERS (sources de trafic)
    // ============================================
    const { data: referrerData } = await supabase
      .from('analytics_events')
      .select('referrer, session_id')
      .gte('created_at', since)
      .eq('event_type', 'pageview')
      .neq('referrer', 'direct')

    // ✅ Grouper par domaine et compter les sessions uniques
    const referrerCounts: Record<string, Set<string>> = {}

    referrerData?.forEach(
      (r: { referrer: string | null; session_id: string }) => {
        if (!r.referrer) return

        try {
          const url = new URL(r.referrer)
          const domain = url.hostname
          if (!referrerCounts[domain]) referrerCounts[domain] = new Set()
          referrerCounts[domain].add(r.session_id)
        } catch {
          // Ignorer les referrers invalides
        }
      }
    )

    const referrers = Object.entries(referrerCounts)
      .map(([source, sessions]) => ({
        source,
        visitors: sessions.size,
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10)

    // ============================================
    // 7. PAYS (si disponibles)
    // ============================================
    const { data: countryData } = await supabase
      .from('analytics_events')
      .select('country, session_id')
      .gte('created_at', since)
      .eq('event_type', 'pageview')
      .not('country', 'is', null)

    // ✅ Grouper par pays
    const countryCounts: Record<string, Set<string>> = {}

    countryData?.forEach(
      (c: { country: string | null; session_id: string }) => {
        if (!c.country) return

        if (!countryCounts[c.country]) countryCounts[c.country] = new Set()
        countryCounts[c.country].add(c.session_id)
      }
    )

    const countries = Object.entries(countryCounts)
      .map(([country, sessions]) => ({
        country,
        visitors: sessions.size,
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10)

    // ============================================
    // 8. DEVICES (mobile, desktop, tablet)
    // ============================================
    const { data: deviceData } = await supabase
      .from('analytics_events')
      .select('device_type, session_id')
      .gte('created_at', since)
      .eq('event_type', 'pageview')

    // ✅ Grouper par device
    const deviceCounts: Record<string, Set<string>> = {}

    deviceData?.forEach(
      (d: { device_type: string | null; session_id: string }) => {
        if (!d.device_type) return

        if (!deviceCounts[d.device_type])
          deviceCounts[d.device_type] = new Set()
        deviceCounts[d.device_type].add(d.session_id)
      }
    )

    const devices = Object.entries(deviceCounts)
      .map(([device, sessions]) => ({
        device,
        visitors: sessions.size,
      }))
      .sort((a, b) => b.visitors - a.visitors)

    // ============================================
    // 9. TEMPS MOYEN SUR SITE
    // ============================================
    const { data: timeData } = await supabase
      .from('analytics_events')
      .select('time_on_page')
      .gte('created_at', since)
      .eq('event_type', 'time_on_page')
      .not('time_on_page', 'is', null)

    const avgTimeOnSite = timeData?.length
      ? Math.round(
          timeData.reduce(
            (sum: number, t: { time_on_page: number | null }) =>
              sum + (t.time_on_page || 0),
            0
          ) / timeData.length
        )
      : 0

    // ============================================
    // 10. STATS E-COMMERCE (optionnel)
    // ============================================
    const { count: addToCartCount } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since)
      .eq('event_type', 'add_to_cart')

    const { data: purchaseData } = await supabase
      .from('analytics_events')
      .select('revenue')
      .gte('created_at', since)
      .eq('event_type', 'purchase')
      .not('revenue', 'is', null)

    const totalRevenue =
      purchaseData?.reduce(
        (sum: number, p: { revenue: number | null }) =>
          sum + (Number(p.revenue) || 0),
        0
      ) || 0
    const purchaseCount = purchaseData?.length || 0

    // ============================================
    // RÉPONSE
    // ============================================
    return NextResponse.json({
      success: true,
      period,
      data: {
        // Métriques principales
        visitors: uniqueVisitors,
        pageViews: pageViews || 0,
        bounceRate,
        avgTimeOnSite,

        // Top contenus
        topPages: topPages || [],
        referrers,
        countries,
        devices,

        // Graphique
        dailyStats: dailyStats || [],

        // E-commerce
        ecommerce: {
          addToCart: addToCartCount || 0,
          purchases: purchaseCount,
          revenue: totalRevenue,
          conversionRate:
            uniqueVisitors > 0
              ? ((purchaseCount / uniqueVisitors) * 100).toFixed(2)
              : '0.00',
        },
      },
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    )
  }
}
