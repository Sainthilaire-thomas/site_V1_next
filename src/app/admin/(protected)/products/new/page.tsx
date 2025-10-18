// src/app/admin/products/new/page.tsx
import Link from 'next/link'
import { createProductAction } from '../actions'
import { redirect } from 'next/navigation'

export default function AdminProductNewPage() {
  async function action(formData: FormData) {
    'use server'
    const res = await createProductAction(formData)
    if (!res.ok) {
      // Ne rien retourner : soit on redirige avec un flag, soit on throw
      // redirect('/admin/products/new?error=1')
      throw new Error('Création échouée')
    }
    redirect(`/admin/products/${res.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/admin/products" className="underline">
          ← Retour
        </Link>
      </div>
      <h1 className="text-2xl font-semibold">Nouveau produit</h1>

      <form action={action} className="grid gap-4 max-w-xl">
        <label className="grid gap-1">
          <span>Nom</span>
          <input name="name" required className="border p-2 rounded" />
        </label>
        <label className="grid gap-1">
          <span>Slug</span>
          <input name="slug" required className="border p-2 rounded" />
        </label>
        <label className="grid gap-1">
          <span>Prix (€)</span>
          <input
            name="price"
            type="number"
            step="0.01"
            required
            className="border p-2 rounded"
          />
        </label>
        <label className="grid gap-1">
          <span>SKU (optionnel)</span>
          <input name="sku" className="border p-2 rounded" />
        </label>
        <label className="grid gap-1">
          <span>Short description</span>
          <input name="short_description" className="border p-2 rounded" />
        </label>
        <label className="grid gap-1">
          <span>Description</span>
          <textarea
            name="description"
            rows={4}
            className="border p-2 rounded"
          />
        </label>
        <label className="inline-flex items-center gap-2">
          <input name="is_active" type="checkbox" defaultChecked />{' '}
          <span>Actif</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input name="is_featured" type="checkbox" /> <span>À la une</span>
        </label>

        <button type="submit" className="border rounded px-4 py-2">
          Créer
        </button>
      </form>
    </div>
  )
}
