// src/components/search/SearchDebug.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function SearchDebug() {
  const [stats, setStats] = useState<any>(null)
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkDatabase() {
      setIsLoading(true)

      try {
        // 1. Compter les produits
        const { count: productsCount, error: productsError } =
          await supabaseBrowser
            .from('products')
            .select('*', { count: 'exact', head: true })

        // 2. Compter les produits actifs
        const { count: activeProductsCount } = await supabaseBrowser
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)

        // 3. Compter les catégories
        const { count: categoriesCount } = await supabaseBrowser
          .from('categories')
          .select('*', { count: 'exact', head: true })

        // 4. Compter les images
        const { count: imagesCount } = await supabaseBrowser
          .from('product_images')
          .select('*', { count: 'exact', head: true })

        // 5. Récupérer quelques produits pour tester
        const { data: sampleProducts, error: sampleError } =
          await supabaseBrowser
            .from('products')
            .select('id, name, is_active, category_id')
            .limit(5)

        // 6. Test de recherche simple
        const { data: searchTest, error: searchError } = await supabaseBrowser
          .from('products')
          .select('id, name')
          .eq('is_active', true)
          .limit(3)

        setStats({
          productsCount: productsCount || 0,
          activeProductsCount: activeProductsCount || 0,
          categoriesCount: categoriesCount || 0,
          imagesCount: imagesCount || 0,
          productsError: productsError?.message,
          sampleError: sampleError?.message,
          searchError: searchError?.message,
        })

        setTestResults({
          sampleProducts: sampleProducts || [],
          searchTest: searchTest || [],
        })
      } catch (err: any) {
        console.error('Debug error:', err)
        setStats({ error: err.message })
      } finally {
        setIsLoading(false)
      }
    }

    checkDatabase()
  }, [])

  if (isLoading) {
    return (
      <div className="p-8 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Checking database...</p>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 rounded-lg space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Database Debug Info</h2>

        {stats?.error && (
          <div className="p-4 bg-red-100 text-red-800 rounded mb-4">
            <strong>Error:</strong> {stats.error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white rounded shadow">
            <div className="text-3xl font-bold text-blue-600">
              {stats?.productsCount || 0}
            </div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <div className="text-3xl font-bold text-green-600">
              {stats?.activeProductsCount || 0}
            </div>
            <div className="text-sm text-gray-600">Active Products</div>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <div className="text-3xl font-bold text-purple-600">
              {stats?.categoriesCount || 0}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <div className="text-3xl font-bold text-orange-600">
              {stats?.imagesCount || 0}
            </div>
            <div className="text-sm text-gray-600">Images</div>
          </div>
        </div>

        {/* Errors */}
        {(stats?.productsError || stats?.sampleError || stats?.searchError) && (
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded mb-4">
            <strong>Warnings:</strong>
            <ul className="list-disc list-inside mt-2">
              {stats.productsError && <li>Products: {stats.productsError}</li>}
              {stats.sampleError && <li>Sample: {stats.sampleError}</li>}
              {stats.searchError && <li>Search: {stats.searchError}</li>}
            </ul>
          </div>
        )}

        {/* Sample Products */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Sample Products:</h3>
          {testResults?.sampleProducts?.length > 0 ? (
            <ul className="space-y-2">
              {testResults.sampleProducts.map((p: any) => (
                <li key={p.id} className="text-sm border-b pb-2">
                  <strong>{p.name}</strong>
                  <div className="text-gray-600">
                    ID: {p.id} | Active: {p.is_active ? 'Yes' : 'No'} |
                    Category: {p.category_id || 'None'}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-red-600">No products found in database!</p>
          )}
        </div>

        {/* Search Test */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Search Test (Active Products):</h3>
          {testResults?.searchTest?.length > 0 ? (
            <ul className="space-y-1">
              {testResults.searchTest.map((p: any) => (
                <li key={p.id} className="text-sm">
                  • {p.name} (ID: {p.id})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-red-600">
              No active products found! Make sure products have is_active = true
            </p>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-bold mb-2">💡 Recommendations:</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            {stats?.productsCount === 0 && (
              <li className="text-red-600">
                <strong>No products in database!</strong> Add products first.
              </li>
            )}
            {stats?.activeProductsCount === 0 && stats?.productsCount > 0 && (
              <li className="text-orange-600">
                <strong>No active products!</strong> Set is_active = true on
                products.
              </li>
            )}
            {stats?.imagesCount === 0 && stats?.productsCount > 0 && (
              <li className="text-yellow-600">
                Products have no images. Add images to product_images table.
              </li>
            )}
            {stats?.categoriesCount === 0 && (
              <li className="text-yellow-600">
                No categories found. Create categories first.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
