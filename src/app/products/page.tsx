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

      {/* Contenu épuré : uniquement la grille, avec généreux espacements */}
      <main className="pt-6">
        <section className="py-6 sm:py-8">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-black/60 text-sm tracking-[0.05em] font-semibold lowercase mb-3">
                  aucun produit pour le moment
                </p>
                <Link
                  href="/collections"
                  className="text-black/70 hover:text-black text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors"
                >
                  voir les collections
                </Link>
              </div>
            ) : (
              <div
                className={[
                  // Grille inspirée Jacquemus : grandes images, rythme aéré
                  'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
                  'gap-6 md:gap-8 xl:gap-10',
                ].join(' ')}
              >
                {products.map((p) => (
                  <ProductCardClient key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
