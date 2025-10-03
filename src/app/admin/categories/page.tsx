// Server Component : liste + création rapide
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CategoriesAdminPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get: (k) => cookieStore.get(k)?.value, set() {}, remove() {} },
    }
  )

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  const { data: parents } = await supabase
    .from('categories')
    .select('id,name')
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Catégories</h1>
        <Link
          href="/admin/products"
          className="text-sm underline hover:text-violet transition-colors"
        >
          ← Retour produits
        </Link>
      </div>

      {/* Création rapide */}
      <form
        className="grid md:grid-cols-5 gap-3 border p-4 rounded"
        action={async (fd) => {
          'use server'
          const body = Object.fromEntries(fd.entries())
          await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/categories`,
            {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                name: body.name,
                slug: body.slug,
                parent_id: body.parent_id || null,
                is_active: !!body.is_active,
                sort_order: Number(body.sort_order || 0),
              }),
              cache: 'no-store',
            }
          )
        }}
      >
        <input
          name="name"
          placeholder="Nom"
          className="border p-2 rounded"
          required
        />
        <input
          name="slug"
          placeholder="slug"
          className="border p-2 rounded"
          required
        />
        <select name="parent_id" className="border p-2 rounded">
          <option value="">(Sans parent)</option>
          {parents?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          name="sort_order"
          type="number"
          placeholder="Ordre"
          className="border p-2 rounded"
        />
        <label className="inline-flex items-center gap-2">
          <input
            name="is_active"
            type="checkbox"
            defaultChecked
            className="rounded"
          />
          <span>Active</span>
        </label>
        <div className="md:col-span-5">
          <button className="border rounded px-4 py-2 hover:bg-violet hover:text-white transition">
            Créer
          </button>
        </div>
      </form>

      {/* Liste */}
      <div className="overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Nom</th>
              <th className="py-2 pr-4">Slug</th>
              <th className="py-2 pr-4">Parent</th>
              <th className="py-2 pr-4">Ordre</th>
              <th className="py-2 pr-4">Active</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="py-2 pr-4">{c.name}</td>
                <td className="py-2 pr-4">{c.slug}</td>
                <td className="py-2 pr-4">
                  {parents?.find((p) => p.id === c.parent_id)?.name ?? '—'}
                </td>
                <td className="py-2 pr-4">{c.sort_order ?? 0}</td>
                <td className="py-2 pr-4">{c.is_active ? 'Oui' : 'Non'}</td>
                <td className="py-2 pr-4">
                  {/* Edition inline minimale via fetch API */}
                  <form
                    className="inline"
                    action={async () => {
                      'use server'
                      await fetch(
                        `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/categories/${c.id}`,
                        {
                          method: 'DELETE',
                          cache: 'no-store',
                        }
                      )
                    }}
                  >
                    <button className="text-red-600 hover:underline">
                      Supprimer
                    </button>
                  </form>
                </td>
              </tr>
            )) || null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
