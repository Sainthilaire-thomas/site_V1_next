import Link from 'next/link'
import { headers, cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

async function fetchProducts(q?: string) {
  const h = await headers()
  const cookieStore = await cookies()

  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('x-forwarded-host') ?? h.get('host')!
  const url =
    `${proto}://${host}/api/admin/products` +
    (q ? `?q=${encodeURIComponent(q)}` : '')

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
        <Link
          href="/admin/products/new"
          className="border border-gray-300 dark:border-gray-600 rounded px-4 py-2 hover:bg-violet hover:text-white hover:border-violet transition-colors"
        >
          Nouveau produit
        </Link>
      </div>

      <div className="grid gap-3">
        {data.items.map((p) => (
          <Link
            key={p.id}
            href={`/admin/products/${p.id}`}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 rounded-lg hover:border-violet transition-colors"
          >
            <div className="font-medium text-lg">{p.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              € {Number(p.price).toFixed(2)} —{' '}
              <span
                className={
                  p.is_active
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }
              >
                {p.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
