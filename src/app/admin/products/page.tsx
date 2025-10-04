import Link from 'next/link'
import { headers, cookies } from 'next/headers'
import { ProductImage } from '@/components/products/ProductImage'
import { ProductsFilter } from './ProductsFilter'
import { ProductsList } from './ProductsList'

export const dynamic = 'force-dynamic'

async function fetchProducts(q?: string, showInactive?: boolean) {
  const h = await headers()
  const cookieStore = await cookies()

  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('x-forwarded-host') ?? h.get('host')!

  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (showInactive) params.set('show_inactive', '1')

  const url = `${proto}://${host}/api/admin/products${params.toString() ? `?${params}` : ''}`

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
  searchParams: Promise<{ q?: string; show_inactive?: string }>
}) {
  const { q, show_inactive } = await searchParams
  const showInactive = show_inactive === '1'
  const data = await fetchProducts(q, showInactive)

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

      {/* Filtre pour afficher les produits inactifs */}
      <ProductsFilter />

      {/* Liste des produits */}
      <ProductsList products={data.items} />
    </div>
  )
}
