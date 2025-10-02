import Link from 'next/link'
import { headers, cookies } from 'next/headers'

// (optionnel) force la page dynamique
export const dynamic = 'force-dynamic'

async function fetchProducts(q?: string) {
  const h = await headers()
  const cookieStore = await cookies()

  // reconstruit l'origine (dev/prod)
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('x-forwarded-host') ?? h.get('host')!
  const url =
    `${proto}://${host}/api/admin/products` +
    (q ? `?q=${encodeURIComponent(q)}` : '')

  // forward des cookies vers la route API
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { cookie: cookieHeader },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`fetch produits: ${res.status} – ${text}`)
  }
  return res.json() as Promise<{ items: any[]; total: number }>
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const data = await fetchProducts(q)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Produits ({data.total})</h1>
        <Link href="/admin/products/new" className="underline">
          Nouveau produit
        </Link>
      </div>

      <div className="grid gap-2">
        {data.items.map((p) => (
          <Link
            key={p.id}
            href={`/admin/products/${p.id}`}
            className="border p-4 rounded-lg hover:bg-gray-50"
          >
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-gray-600">
              € {Number(p.price).toFixed(2)} —{' '}
              {p.is_active ? 'Actif' : 'Inactif'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
