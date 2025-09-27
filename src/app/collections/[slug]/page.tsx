// src/app/collections/[slug]/page.tsx
import Link from "next/link";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ProductGridClient from "./product-grid-client";
import { notFound } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase-server"; // on va interroger Supabase directement

export const revalidate = 0;

type Product = {
  id: string;
  name: string;
  short_description: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number | null;
  images?: Array<{ id: string; url: string; alt_text: string | null }>;
  category?: { id: string; name: string } | null;
};

type Collection = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  slug: string;
};

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>; // 👈 params est un Promise
}) {
  const { slug } = await params; // 👈 on attend params

  // 🔁 Option la plus robuste: requête Supabase directement ici (pas d'appel API interne)
  const supabase = await getServerSupabase();

  // 1) collection
  const { data: coll, error: collErr } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (collErr) throw new Error(collErr.message);
  if (!coll) return notFound();

  // 2) produits via pivot trié
  const { data: cps, error: cpsErr } = await supabase
    .from("collection_products")
    .select(
      `
      sort_order,
      product:products(
        *,
        images:product_images(*),
        category:categories(*)
      )
    `
    )
    .eq("collection_id", coll.id)
    .order("sort_order", { ascending: true });

  if (cpsErr) throw new Error(cpsErr.message);
  const products: Product[] = (cps ?? [])
    .map((cp: any) => cp.product)
    .filter(Boolean);

  const current: Collection = coll;

  return (
    <div className="min-h-screen bg-white">
      <UnifiedHeader variant="default" showNavigation={true} />
      <main className="pt-6">
        {/* Breadcrumb */}
        <div className="px-6 py-4 border-b">
          <div className="container mx-auto">
            <Link
              href="/collections"
              className="text-violet-600 hover:text-violet-800 transition-colors"
            >
              Collections
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">
              {current?.name || "Collection"}
            </span>
          </div>
        </div>

        {/* Hero */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="aspect-[4/3] rounded-lg overflow-hidden">
                {current?.image_url ? (
                  <img
                    src={current.image_url}
                    alt={current.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
                    <span className="text-violet-600 text-2xl font-light">
                      {current?.name || "Collection"}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
                  {current?.name || "Collection"}
                </h1>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {current?.description || "Description de la collection"}
                </p>
                <div className="text-sm text-gray-500">
                  {products.length} pièces dans cette collection
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grille produits côté client (panier) */}
        <section className="py-12 px-6">
          <div className="container mx-auto">
            <ProductGridClient products={products} />
          </div>
        </section>
      </main>
    </div>
  );
}
