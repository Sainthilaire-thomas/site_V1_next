// src/app/test-search/page.tsx
import SearchDebug from '@/components/search/SearchDebug'

export default function TestSearchPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Search Module Debug</h1>
        <SearchDebug />

        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Quick Fixes:</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">
                1. Check if products exist:
              </h3>
              <code className="block bg-gray-100 p-3 rounded text-sm">
                SELECT * FROM products LIMIT 5;
              </code>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Activate all products:</h3>
              <code className="block bg-gray-100 p-3 rounded text-sm">
                UPDATE products SET is_active = true;
              </code>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                3. Check product_images table:
              </h3>
              <code className="block bg-gray-100 p-3 rounded text-sm">
                SELECT product_id, COUNT(*) as image_count
                <br />
                FROM product_images
                <br />
                GROUP BY product_id;
              </code>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                4. Create test product (if empty):
              </h3>
              <code className="block bg-gray-100 p-3 rounded text-sm whitespace-pre">
                {`INSERT INTO products (name, price, is_active)
VALUES ('Test Product', 99, true);`}
              </code>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-bold mb-4">🔍 How Search Works:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Search looks in the <code>products</code> table
            </li>
            <li>
              Only shows products where <code>is_active = true</code>
            </li>
            <li>
              Searches in the <code>name</code> column (case-insensitive)
            </li>
            <li>
              Joins with <code>categories</code> and <code>product_images</code>{' '}
              tables
            </li>
            <li>Returns maximum 6 results for the modal</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
