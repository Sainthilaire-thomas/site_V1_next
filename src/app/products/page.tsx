// src/app/products/page.tsx
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import Link from "next/link";
import ProductCardClient from "./ProductCardClient";
import { getServerSupabase } from "@/lib/supabase-server";

export const revalidate = 0;

type Product = {
  id: string;
  name: string;
  short_description: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number | null;
  images?: Array<{ url: string; alt_text: string | null }>;
  category?: { name: string } | null;
};

async function getProducts(): Promise<Product[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      images:product_images(*),
      category:categories(*)
    `
    )
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-white">
      <UnifiedHeader />

      <main className="pt-6">
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
              Produits
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Retrouvez l’ensemble de nos pièces.
            </p>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="container mx-auto">
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">
                  Aucun produit pour le moment.
                </p>
                <Link
                  href="/collections"
                  className="text-violet-600 hover:text-violet-800"
                >
                  Voir les collections
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((p) => (
                  <ProductCardClient key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
