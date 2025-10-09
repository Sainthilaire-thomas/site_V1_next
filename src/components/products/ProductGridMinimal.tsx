// src/components/products/ProductGridMinimal.tsx
import ProductCardMinimal from './ProductCardMinimal'

type Product = {
  id: string
  name: string
  short_description: string | null
  price: number
  sale_price: number | null
  stock_quantity: number | null
  images?: Array<{ id: string; url: string; alt_text: string | null }>
  category?: { name: string } | null
}

export default function ProductGridMinimal({
  products,
}: {
  products: Product[]
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
      {products.map((product) => (
        <ProductCardMinimal key={product.id} product={product} />
      ))}
    </div>
  )
}
