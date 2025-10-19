// src/lib/newsletter/utils.ts

/**
 * Simple slugify function (pas besoin de dépendance externe)
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // Espaces et underscores → tirets
    .replace(/[^\w\-]+/g, '') // Supprimer caractères spéciaux
    .replace(/\-\-+/g, '-') // Tirets multiples → un seul
    .replace(/^-+/, '') // Supprimer tirets au début
    .replace(/-+$/, '') // Supprimer tirets à la fin
}

/**
 * Génère un utm_campaign unique pour une campagne newsletter
 *
 * Format : newsletter-YYYY-MM-{slug}
 * Exemple : newsletter-2025-10-collection-hiver
 */
export function generateUtmCampaign(campaignName: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  const slug = slugify(campaignName)

  return `newsletter-${year}-${month}-${slug}`
}

/**
 * Génère des liens UTM pour la newsletter
 */
export function generateNewsletterLink(
  basePath: string,
  campaignUtm: string,
  subscriberId: string,
  linkName?: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const url = new URL(basePath, baseUrl)

  // UTM standards
  url.searchParams.set('utm_source', 'newsletter')
  url.searchParams.set('utm_medium', 'email')
  url.searchParams.set('utm_campaign', campaignUtm)

  // Tracking détaillé
  if (linkName) {
    url.searchParams.set('utm_content', linkName)
  }

  // Identifiant abonné (pour tracking individuel)
  url.searchParams.set('subscriber', subscriberId)

  return url.toString()
}

/**
 * Génère un lien de désabonnement
 */
export function generateUnsubscribeLink(subscriberId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  // Token simple basé sur l'ID (à améliorer en Phase 2 avec JWT)
  const token = Buffer.from(
    JSON.stringify({
      id: subscriberId,
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 jours
    })
  ).toString('base64')

  return `${baseUrl}/newsletter/unsubscribe?token=${token}`
}

/**
 * Valide l'unicité d'un utm_campaign
 */
export async function isUtmCampaignUnique(
  supabase: any,
  utmCampaign: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase
    .from('newsletter_campaigns')
    .select('id')
    .eq('utm_campaign', utmCampaign)
    .limit(1)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data } = await query

  return !data || data.length === 0
}

/**
 * Génère un numéro de version si conflit utm_campaign
 */
export function generateUtmCampaignWithVersion(
  baseUtm: string,
  version: number
): string {
  return `${baseUtm}-v${version}`
}
