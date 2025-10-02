// src/app/products/page.tsx
import { redirect } from 'next/navigation'

// ✅ Redirige vers la première catégorie de votre base
export default function ProductsIndexRedirect() {
 redirect('/products/hauts')
}
