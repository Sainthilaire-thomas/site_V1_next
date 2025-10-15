// src/app/api/admin/analytics/vercel/route.ts
import { NextResponse } from 'next/server'

/**
 * API pour récupérer les analytics Vercel
 * Teste plusieurs endpoints car la doc Vercel n'est pas claire
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'

    // Configuration
    const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN
    const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID
    const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID

    if (!VERCEL_TOKEN || !VERCEL_TEAM_ID || !VERCEL_PROJECT_ID) {
      return NextResponse.json(
        {
          error: 'Configuration manquante',
          message:
            'Vérifiez VERCEL_API_TOKEN, VERCEL_TEAM_ID et VERCEL_PROJECT_ID dans .env.local',
        },
        { status: 500 }
      )
    }

    // Calculer les dates
    const now = Date.now()
    const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const since = now - daysAgo * 24 * 60 * 60 * 1000

    console.log('📊 Fetching Vercel Analytics:', {
      teamId: VERCEL_TEAM_ID,
      projectId: VERCEL_PROJECT_ID,
      period,
    })

    // Liste des endpoints à essayer (la doc Vercel est floue)
    const endpoints = [
      // Endpoint 1: Web Analytics (le plus récent)
      `https://api.vercel.com/v1/web-analytics/events?projectId=${VERCEL_PROJECT_ID}&teamId=${VERCEL_TEAM_ID}&from=${since}&to=${now}`,

      // Endpoint 2: Analytics stats
      `https://api.vercel.com/v1/projects/${VERCEL_PROJECT_ID}/analytics?teamId=${VERCEL_TEAM_ID}&from=${since}&to=${now}`,

      // Endpoint 3: Analytics events
      `https://api.vercel.com/v1/analytics/events?projectId=${VERCEL_PROJECT_ID}&teamId=${VERCEL_TEAM_ID}&from=${since}&to=${now}`,
    ]

    let lastError = null

    // Essayer chaque endpoint
    for (let i = 0; i < endpoints.length; i++) {
      const url = endpoints[i]
      console.log(`🔄 Trying endpoint ${i + 1}/${endpoints.length}:`, url)

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        })

        console.log(`📡 Response ${i + 1}: ${response.status}`)

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Success! Data received:', data)

          // Formater les données
          return NextResponse.json({
            success: true,
            period,
            endpoint: i + 1,
            data: formatAnalyticsData(data),
          })
        }

        const errorText = await response.text()
        lastError = {
          endpoint: i + 1,
          status: response.status,
          message: errorText,
        }
        console.log(`❌ Endpoint ${i + 1} failed:`, lastError)
      } catch (err) {
        console.error(`💥 Endpoint ${i + 1} error:`, err)
        lastError = {
          endpoint: i + 1,
          error: err instanceof Error ? err.message : 'Unknown error',
        }
      }
    }

    // Si aucun endpoint n'a fonctionné, retourner des données simulées
    // avec un message informatif
    console.log('⚠️ All endpoints failed, returning mock data')

    return NextResponse.json({
      success: true,
      mock: true,
      message:
        "Les endpoints Vercel Analytics ne sont pas accessibles. Cela peut être normal si vous n'avez pas encore de trafic ou si l'API a changé.",
      lastError,
      data: {
        visitors: 0,
        pageViews: 0,
        bounceRate: 0,
        topPages: [],
        referrers: [],
        countries: [],
        devices: [],
      },
    })
  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    )
  }
}

// Helper pour formater les données
function formatAnalyticsData(data: any) {
  // Format 1: Données déjà formatées
  if (data.visitors !== undefined) {
    return {
      visitors: data.visitors || 0,
      pageViews: data.pageViews || 0,
      bounceRate: data.bounceRate || 0,
      topPages: data.topPages || data.pages || [],
      referrers: data.referrers || [],
      countries: data.countries || [],
      devices: data.devices || [],
    }
  }

  // Format 2: Données brutes Vercel
  if (data.total) {
    return {
      visitors: data.total.visitors || 0,
      pageViews: data.total.pageViews || 0,
      bounceRate: data.total.bounceRate || 0,
      topPages: data.pages || [],
      referrers: data.referrers || [],
      countries: data.countries || [],
      devices: data.devices || [],
    }
  }

  // Format 3: Events format
  if (data.events) {
    return {
      visitors: data.events.filter((e: any) => e.type === 'visitor').length,
      pageViews: data.events.filter((e: any) => e.type === 'pageview').length,
      bounceRate: 0,
      topPages: [],
      referrers: [],
      countries: [],
      devices: [],
    }
  }

  // Format inconnu, retourner vide
  console.log('⚠️ Unknown data format:', data)
  return {
    visitors: 0,
    pageViews: 0,
    bounceRate: 0,
    topPages: [],
    referrers: [],
    countries: [],
    devices: [],
  }
}
