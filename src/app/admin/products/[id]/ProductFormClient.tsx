'use client'

import Link from 'next/link'
import { useTransition, useState } from 'react'
import { useToast } from '@/components/admin/Toast'
import {
  updateProductAction,
  createVariantAction,
  deleteVariantAction,
  adjustStockAction,
} from './actions'

export function ProductFormClient({
  product,
  variants,
  productId,
  categories,
}: {
  product: any
  variants: any[]
  productId: string
  categories: Array<{ id: string; name: string }>
}) {
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  // ✅ État local pour les checkboxes
  const [isActive, setIsActive] = useState(!!product.is_active)
  const [isFeatured, setIsFeatured] = useState(!!product.is_featured)

  async function handleUpdateProduct(formData: FormData) {
    startTransition(async () => {
      const result = await updateProductAction(productId, formData)
      if (result.ok) {
        showToast('Produit enregistré avec succès', 'success')
      } else {
        showToast("Erreur lors de l'enregistrement", 'error')
      }
    })
  }

  async function handleCreateVariant(formData: FormData) {
    startTransition(async () => {
      const result = await createVariantAction(productId, formData)
      if (result.ok) {
        showToast('Variante créée', 'success')
      } else {
        showToast('Erreur lors de la création', 'error')
      }
    })
  }

  async function handleDeleteVariant(variantId: string) {
    if (!confirm('Supprimer cette variante ?')) return
    startTransition(async () => {
      const result = await deleteVariantAction(productId, variantId)
      if (result.ok) {
        showToast('Variante supprimée', 'success')
      } else {
        showToast('Erreur lors de la suppression', 'error')
      }
    })
  }

  async function handleAdjustStock(variantId: string, formData: FormData) {
    startTransition(async () => {
      const result = await adjustStockAction(productId, variantId, formData)
      if (result.ok) {
        showToast('Stock ajusté', 'success')
      } else {
        showToast("Erreur lors de l'ajustement", 'error')
      }
    })
  }

  const totalStock = product.stock_quantity ?? 0

  return (
    <div className="space-y-8">
      <div className="text-sm">
        <Link
          href="/admin/products"
          className="underline hover:text-violet transition-colors"
        >
          ← Retour
        </Link>
      </div>

      {/* En-tête avec titre, stock et badges */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-3">{product.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">
                Stock total:
              </span>
              <span
                className={`font-bold text-lg ${
                  totalStock <= 0
                    ? 'text-red-500'
                    : totalStock < 10
                      ? 'text-orange-500'
                      : 'text-green-600 dark:text-green-400'
                }`}
              >
                {totalStock}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">Prix:</span>
              <span className="font-semibold">{product.price}€</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">SKU:</span>
              <span className="font-mono text-sm">{product.sku ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Badges statut */}
        <div className="flex gap-2 flex-shrink-0">
          {product.is_featured && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-violet/10 text-violet border border-violet/20">
              À la une
            </span>
          )}
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              product.is_active
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-800'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            }`}
          >
            {product.is_active ? 'Actif' : 'Inactif'}
          </span>
        </div>
      </div>

      {/* Onglet Infos */}
      <section id="infos" className="space-y-4">
        <h2 className="text-lg font-medium">Infos</h2>
        <form action={handleUpdateProduct} className="grid gap-3 max-w-xl">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Catégorie</span>
            <select
              name="category_id"
              defaultValue={product.category_id ?? ''}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 rounded focus:ring-2 focus:ring-violet focus:border-transparent"
            >
              <option value="">(Aucune)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Nom</span>
            <input
              name="name"
              defaultValue={product.name}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 rounded focus:ring-2 focus:ring-violet focus:border-transparent"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Slug</span>
            <input
              name="slug"
              defaultValue={product.slug}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 rounded focus:ring-2 focus:ring-violet focus:border-transparent"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Prix (€)</span>
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={product.price}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 rounded focus:ring-2 focus:ring-violet focus:border-transparent"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">SKU</span>
            <input
              name="sku"
              defaultValue={product.sku ?? ''}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 rounded focus:ring-2 focus:ring-violet focus:border-transparent"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Short description</span>
            <input
              name="short_description"
              defaultValue={product.short_description ?? ''}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 rounded focus:ring-2 focus:ring-violet focus:border-transparent"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Description</span>
            <textarea
              name="description"
              rows={4}
              defaultValue={product.description ?? ''}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 rounded focus:ring-2 focus:ring-violet focus:border-transparent"
            />
          </label>

          {/* ✅ Checkbox Actif avec champ caché */}
          <div>
            <input
              type="hidden"
              name="is_active"
              value={isActive ? 'true' : 'false'}
            />
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300 text-violet focus:ring-violet"
              />
              <span className="text-sm">Actif</span>
            </label>
          </div>

          {/* ✅ Checkbox Featured avec champ caché */}
          <div>
            <input
              type="hidden"
              name="is_featured"
              value={isFeatured ? 'true' : 'false'}
            />
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-gray-300 text-violet focus:ring-violet"
              />
              <span className="text-sm">À la une</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              disabled={isPending}
              className="border border-gray-300 dark:border-gray-600 rounded px-4 py-2 hover:bg-violet hover:text-white hover:border-violet transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <Link
              className="underline hover:text-violet transition-colors inline-flex items-center"
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

        {variants.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Aucune variante pour ce produit
          </p>
        ) : (
          <div className="space-y-3">
            {variants.map((v) => (
              <div
                key={v.id}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg p-4"
              >
                {/* En-tête de la variante */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-lg mb-1">
                      {v.name}: {v.value}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium">SKU:</span> {v.sku ?? '—'}
                      </div>
                      <div>
                        <span className="font-medium">Stock:</span>{' '}
                        <span
                          className={
                            v.stock_quantity <= 0
                              ? 'text-red-500'
                              : 'text-green-600 dark:text-green-400'
                          }
                        >
                          {v.stock_quantity ?? 0}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Prix modif:</span>{' '}
                        {v.price_modifier ?? 0}€
                      </div>
                      <div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs ${
                            v.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {v.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                  {/* Ajustement de stock */}
                  <form
                    action={(fd) => handleAdjustStock(v.id, fd)}
                    className="flex gap-2 flex-1"
                  >
                    <input
                      name="delta"
                      type="number"
                      placeholder="+/- quantité"
                      className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 rounded w-28 text-sm"
                    />
                    <input
                      name="reason"
                      placeholder="Raison (inventaire, retour...)"
                      className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 rounded flex-1 min-w-[200px] text-sm"
                    />
                    <button
                      disabled={isPending}
                      className="border border-gray-300 dark:border-gray-600 rounded px-4 py-2 text-sm hover:bg-violet hover:text-white hover:border-violet transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      Ajuster stock
                    </button>
                  </form>

                  {/* Supprimer */}
                  <button
                    onClick={() => handleDeleteVariant(v.id)}
                    disabled={isPending}
                    className="border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded px-4 py-2 text-sm hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ajouter une variante */}
        <div className="border-t border-gray-300 dark:border-gray-600 pt-6 mt-6">
          <h3 className="text-md font-medium mb-3">Ajouter une variante</h3>
          <form
            action={handleCreateVariant}
            className="grid md:grid-cols-6 gap-3"
          >
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Attribut</label>
              <input
                name="name"
                placeholder="ex. Taille"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 rounded"
                required
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">Valeur</label>
              <input
                name="value"
                placeholder="ex. M"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 rounded"
                required
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input
                name="sku"
                placeholder="Optionnel"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 rounded"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">± Prix</label>
              <input
                name="price_modifier"
                type="number"
                step="0.01"
                placeholder="0"
                defaultValue="0"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 rounded"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                name="stock_quantity"
                type="number"
                placeholder="0"
                defaultValue="0"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 rounded"
              />
            </div>
            <div className="md:col-span-6 flex items-center justify-between">
              <label className="inline-flex items-center gap-2">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-violet focus:ring-violet"
                />
                <span className="text-sm">Variante active</span>
              </label>
              <button
                disabled={isPending}
                className="border border-gray-300 dark:border-gray-600 rounded px-6 py-2 hover:bg-violet hover:text-white hover:border-violet transition-colors disabled:opacity-50"
              >
                Créer la variante
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
