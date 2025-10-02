// src/components/products/ProductGridJacquemus.tsx
import ProductCardJacquemus from './ProductCardJacquemus'

type Product = {
  id: string
  name: string
  short_description: string | null
  price: number
  sale_price: number | null
  stock_quantity: number | null
  images?: Array<{ url: string; alt_text: string | null }>
  category?: { name: string } | null
}

type Props = {
  products: Product[]
}

export default function ProductGridJacquemus({ products }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-8 md:gap-x-3 md:gap-y-10">
      {products.map((product) => (
        <ProductCardJacquemus key={product.id} product={product} />
      ))}
    </div>
  )
}
