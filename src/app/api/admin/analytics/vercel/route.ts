// src/app/api/admin/analytics/vercel/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'

/**
 * API pour récupérer les analytics depuis Vercel Web Analytics
 * Documentation: https://vercel.com/docs/analytics/web-analytics/quickstart
 *
 * Note: Vercel a 2 systèmes d'analytics différents:
 * 1. Web Analytics (nouveau, gratuit) - endpoint /v1/web-analytics
 * 2. Audience Analytics (ancien, payant) - endpoint /v1/analytics
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

    // Configuration
    const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN
    const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID
    const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID

    if (!VERCEL_TOKEN || !VERCEL_TEAM_ID || !VERCEL_PROJECT_ID) {
      console.error("❌ Variables d'environnement manquantes")
      return NextResponse.json(
        {
          error: 'Configuration manquante',
          message:
            'Vérifiez VERCEL_API_TOKEN, VERCEL_TEAM_ID et VERCEL_PROJECT_ID',
        },
        { status: 500 }
      )
    }

    // Calculer les timestamps (en millisecondes)
    const now = Date.now()
    const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const since = now - daysAgo * 24 * 60 * 60 * 1000

    console.log('📊 Vercel Analytics Request:', {
      teamId: VERCEL_TEAM_ID,
      projectId: VERCEL_PROJECT_ID,
      period,
      since: new Date(since).toISOString(),
      now: new Date(now).toISOString(),
    })

    // NOUVEAU: Endpoint Web Analytics (2024)
    // https://vercel.com/docs/rest-api/endpoints/web-analytics
    const webAnalyticsUrl = `https://api.vercel.com/v1/web-analytics/stats?projectId=${VERCEL_PROJECT_ID}&teamId=${VERCEL_TEAM_ID}&from=${since}&to=${now}&timezone=Europe/Paris`

    console.log('🔄 Calling Web Analytics API:', webAnalyticsUrl)

    const response = await fetch(webAnalyticsUrl, {
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      next: { revalidate: 300 }, // Cache 5 minutes
    })

    console.log('📡 Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })

      // Si 404, c'est que Web Analytics n'est pas activé
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          mock: true,
          message:
            'Web Analytics non activé. Activez-le dans Vercel Dashboard → Analytics',
          helpUrl: 'https://vercel.com/docs/analytics/web-analytics/quickstart',
          data: getMockData(),
        })
      }

      // Si 403, problème de permissions
      if (response.status === 403) {
        return NextResponse.json({
          success: false,
          mock: true,
          message:
            'Le token API n\'a pas la permission "Read Analytics". Créez un nouveau token avec cette permission.',
          helpUrl: 'https://vercel.com/account/tokens',
          data: getMockData(),
        })
      }

      // Autre erreur
      return NextResponse.json({
        success: false,
        mock: true,
        message: `Erreur API Vercel: ${response.status}`,
        error: errorText,
        data: getMockData(),
      })
    }

    // Parser la réponse
    const rawData = await response.json()
    console.log('✅ Raw data received:', JSON.stringify(rawData, null, 2))

    // Formater les données
    const formattedData = formatWebAnalyticsData(rawData)

    return NextResponse.json({
      success: true,
      mock: false,
      period,
      data: formattedData,
    })
  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        data: getMockData(),
      },
      { status: 500 }
    )
  }
}

/**
 * Formater les données de Web Analytics API v1
 * Structure attendue: { total: { visitors, pageviews }, topPages: [...], ... }
 */
function formatWebAnalyticsData(data: any) {
  console.log('🔧 Formatting data:', data)

  // Cas 1: Format direct avec total
  if (data.total) {
    const visitors = data.total.visitors || 0
    const pageviews = data.total.pageviews || 0
    const bounceRate =
      pageviews > 0 ? Math.round((visitors / pageviews) * 100) : 0

    return {
      visitors,
      pageViews: pageviews,
      bounceRate,
      topPages: formatTopPages(data.pages || data.topPages),
      referrers: formatReferrers(data.referrers),
      countries: formatCountries(data.countries),
      devices: formatDevices(data.devices),
    }
  }

  // Cas 2: Format plat (certaines versions de l'API)
  if (data.visitors !== undefined || data.pageviews !== undefined) {
    const visitors = data.visitors || 0
    const pageviews = data.pageviews || 0
    const bounceRate =
      pageviews > 0 ? Math.round((visitors / pageviews) * 100) : 0

    return {
      visitors,
      pageViews: pageviews,
      bounceRate,
      topPages: formatTopPages(data.pages || data.topPages),
      referrers: formatReferrers(data.referrers),
      countries: formatCountries(data.countries),
      devices: formatDevices(data.devices),
    }
  }

  // Cas 3: Format inconnu
  console.warn('⚠️ Format de données inconnu:', data)
  return getMockData()
}

/**
 * Formater les pages les plus visitées
 */
function formatTopPages(pages: any): Array<{ path: string; views: number }> {
  if (!Array.isArray(pages)) return []

  return pages
    .map((page: any) => ({
      path: page.pathname || page.path || page.url || '/',
      views: page.pageviews || page.views || page.count || 0,
    }))
    .filter((page) => page.path && page.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
}

/**
 * Formater les sources de trafic
 */
function formatReferrers(
  referrers: any
): Array<{ source: string; visitors: number }> {
  if (!Array.isArray(referrers)) return []

  return referrers
    .map((ref: any) => ({
      source: ref.referrer || ref.source || ref.href || 'Direct',
      visitors: ref.visitors || ref.count || 0,
    }))
    .filter((ref) => ref.visitors > 0)
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 10)
}

/**
 * Formater les pays
 */
function formatCountries(
  countries: any
): Array<{ country: string; visitors: number }> {
  if (!Array.isArray(countries)) return []

  return countries
    .map((country: any) => ({
      country: getCountryName(country.country || country.code || 'XX'),
      visitors: country.visitors || country.count || 0,
    }))
    .filter((country) => country.visitors > 0)
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 10)
}

/**
 * Formater les appareils
 */
function formatDevices(
  devices: any
): Array<{ device: string; visitors: number }> {
  if (!Array.isArray(devices)) return []

  return devices
    .map((device: any) => ({
      device: device.device || device.type || 'unknown',
      visitors: device.visitors || device.count || 0,
    }))
    .filter((device) => device.visitors > 0)
    .sort((a, b) => b.visitors - a.visitors)
}

/**
 * Données mockées pour le développement
 */
function getMockData() {
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

/**
 * Convertir les codes pays ISO en noms lisibles
 */
function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    FR: 'France',
    US: 'États-Unis',
    GB: 'Royaume-Uni',
    DE: 'Allemagne',
    CA: 'Canada',
    ES: 'Espagne',
    IT: 'Italie',
    NL: 'Pays-Bas',
    BE: 'Belgique',
    CH: 'Suisse',
    AU: 'Australie',
    JP: 'Japon',
    CN: 'Chine',
    IN: 'Inde',
    BR: 'Brésil',
    MX: 'Mexique',
    AR: 'Argentine',
    PT: 'Portugal',
    PL: 'Pologne',
    SE: 'Suède',
    NO: 'Norvège',
    DK: 'Danemark',
    FI: 'Finlande',
    IE: 'Irlande',
    AT: 'Autriche',
    GR: 'Grèce',
    RU: 'Russie',
    TR: 'Turquie',
    ZA: 'Afrique du Sud',
    EG: 'Égypte',
    MA: 'Maroc',
    TN: 'Tunisie',
    DZ: 'Algérie',
    KR: 'Corée du Sud',
    TW: 'Taïwan',
    HK: 'Hong Kong',
    SG: 'Singapour',
    TH: 'Thaïlande',
    VN: 'Vietnam',
    ID: 'Indonésie',
    PH: 'Philippines',
    MY: 'Malaisie',
  }
  return countries[code] || code
}
