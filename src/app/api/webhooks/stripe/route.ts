// Stub Webhook Stripe — déployable sans Stripe
// Ne rien importer depuis "stripe" ici.

export const runtime = 'nodejs' // évite l’Edge par défaut
export const dynamic = 'force-dynamic' // pas de mise en cache

// Le validator attend un handler nommé (POST ici)
export async function POST(_req: Request): Promise<Response> {
  // On renvoie 204 pour signaler "rien à faire"
  return new Response(null, { status: 204 })
}

// (Optionnel) on peut aussi fournir GET pour tester rapidement depuis le navigateur
export async function GET(): Promise<Response> {
  return new Response('Stripe webhook désactivé en environnement actuel.', {
    status: 200,
  })
}
