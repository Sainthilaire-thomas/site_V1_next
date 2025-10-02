import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  updateProductAction,
  createVariantAction,
  deleteVariantAction,
  adjustStockAction,
} from './actions'

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // on lit via l’API admin/id pour rester homogène
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/products/${id}`,
    { cache: 'no-store' }
  )
  if (!res.ok) {
    return (
      <div className="space-y-4">
        <div className="text-sm">
          <Link href="/admin/products" className="underline">
            ← Retour
          </Link>
        </div>
        <h1 className="text-xl font-semibold">Produit introuvable</h1>
      </div>
    )
  }
  const { product, variants } = await res.json()

  async function updateAction(formData: FormData) {
    'use server'
    await updateProductAction(id, formData)
  }

  async function createVariant(formData: FormData) {
    'use server'
    await createVariantAction(id, formData)
  }

  return (
    <div className="space-y-8">
      <div className="text-sm">
        <Link href="/admin/products" className="underline">
          ← Retour
        </Link>
      </div>
      <h1 className="text-2xl font-semibold">{product.name}</h1>

      {/* Onglet Infos */}
      <section id="infos" className="space-y-4">
        <h2 className="text-lg font-medium">Infos</h2>
        <form action={updateAction} className="grid gap-3 max-w-xl">
          <label className="grid gap-1">
            <span>Nom</span>
            <input
              name="name"
              defaultValue={product.name}
              className="border p-2 rounded"
            />
          </label>
          <label className="grid gap-1">
            <span>Slug</span>
            <input
              name="slug"
              defaultValue={product.slug}
              className="border p-2 rounded"
            />
          </label>
          <label className="grid gap-1">
            <span>Prix (€)</span>
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={product.price}
              className="border p-2 rounded"
            />
          </label>
          <label className="grid gap-1">
            <span>SKU</span>
            <input
              name="sku"
              defaultValue={product.sku ?? ''}
              className="border p-2 rounded"
            />
          </label>
          <label className="grid gap-1">
            <span>Short description</span>
            <input
              name="short_description"
              defaultValue={product.short_description ?? ''}
              className="border p-2 rounded"
            />
          </label>
          <label className="grid gap-1">
            <span>Description</span>
            <textarea
              name="description"
              rows={4}
              defaultValue={product.description ?? ''}
              className="border p-2 rounded"
            />
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked={!!product.is_active}
            />{' '}
            <span>Actif</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              name="is_featured"
              type="checkbox"
              defaultChecked={!!product.is_featured}
            />{' '}
            <span>À la une</span>
          </label>

          <div className="flex gap-2">
            <button className="border rounded px-4 py-2">Enregistrer</button>
            <Link
              className="underline"
              href={`/admin/media?product_id=${product.id}`}
            >
              Gérer les images
            </Link>
          </div>
        </form>
      </section>

      {/* Onglet Variantes */}
      <section id="variantes" className="space-y-4">
        <h2 className="text-lg font-medium">Variantes</h2>

        <div className="border rounded divide-y">
          {(variants as any[]).map((v) => (
            <div
              key={v.id}
              className="p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="font-medium">
                  {v.name}: {v.value}
                </div>
                <div className="text-sm text-gray-600">
                  SKU: {v.sku ?? '—'} · Stock: {v.stock_quantity ?? 0} · Modif
                  prix: {v.price_modifier ?? 0}
                </div>
              </div>

              <div className="flex gap-2 items-center">
                {/* Ajustement de stock */}
                <form
                  action={async (fd) => {
                    'use server'
                    await adjustStockAction(id, v.id, fd)
                  }}
                  className="flex gap-2"
                >
                  <input
                    name="delta"
                    type="number"
                    placeholder="+/-"
                    className="border p-1 rounded w-24"
                  />
                  <input
                    name="reason"
                    placeholder="motif"
                    className="border p-1 rounded w-40"
                  />
                  <button className="border rounded px-3 py-1">Ajuster</button>
                </form>

                {/* Supprimer variante */}
                <form
                  action={async () => {
                    'use server'
                    await deleteVariantAction(id, v.id)
                  }}
                >
                  <button className="border rounded px-3 py-1">
                    Supprimer
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        {/* Ajouter une variante */}
        <form
          action={createVariant}
          className="grid md:grid-cols-6 gap-2 max-w-4xl"
        >
          <input
            name="name"
            placeholder="Attribut (ex. Taille)"
            className="border p-2 rounded md:col-span-2"
            required
          />
          <input
            name="value"
            placeholder="Valeur (ex. M)"
            className="border p-2 rounded md:col-span-1"
            required
          />
          <input
            name="sku"
            placeholder="SKU"
            className="border p-2 rounded md:col-span-1"
          />
          <input
            name="price_modifier"
            type="number"
            step="0.01"
            placeholder="± Prix"
            className="border p-2 rounded md:col-span-1"
          />
          <input
            name="stock_quantity"
            type="number"
            placeholder="Stock"
            className="border p-2 rounded md:col-span-1"
          />
          <label className="inline-flex items-center gap-2 md:col-span-6">
            <input name="is_active" type="checkbox" defaultChecked />{' '}
            <span>Active</span>
          </label>
          <div className="md:col-span-6">
            <button className="border rounded px-4 py-2">
              Ajouter la variante
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
