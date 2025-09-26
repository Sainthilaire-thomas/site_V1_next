// src/app/collections/[slug]/page.tsx
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useCartStore } from "@/store/useCartStore";
import { useCollectionStore } from "@/store/useCollectionStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { addItem } = useCartStore();
  const {
    current,
    productsOfCurrent,
    isLoadingDetail,
    fetchCollectionBySlug,
    fetchProductsForCollection,
    error,
  } = useCollectionStore();

  // Charge la collection puis ses produits
  useEffect(() => {
    if (!slug) return;

    (async () => {
      const collection = await fetchCollectionBySlug(slug);
      if (collection) {
        await fetchProductsForCollection(collection.id);
      }
    })().catch(console.error);
  }, [slug, fetchCollectionBySlug, fetchProductsForCollection]);

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.sale_price ?? product.price,
      image: product.images?.[0]?.url ?? "/placeholder.jpg",
    });
  };

  /** ---------- Loading ---------- **/
  if (isLoadingDetail && !current) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-20">
          <div className="px-6 py-4 border-b">
            <div className="container mx-auto">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <section className="py-20 px-6">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <Skeleton className="aspect-[4/3] rounded-lg" />
                <div className="space-y-4">
                  <Skeleton className="h-12 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  /** ---------- Error / Not found ---------- **/
  if (error || !current) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <h3 className="text-red-800 font-medium mb-2">
                Collection introuvable
              </h3>
              <p className="text-sm text-red-700">
                {error ||
                  "Cette collection n'existe pas ou n'est plus disponible."}
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/collections">
                <Button variant="outline" className="border-gray-300">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux collections
                </Button>
              </Link>
              <Link href="/">
                <Button className="bg-violet-600 hover:bg-violet-700">
                  Accueil
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /** ---------- Success ---------- **/
  const products = productsOfCurrent ?? [];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20">
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
            <span className="text-gray-900">{current.name}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="aspect-[4/3] rounded-lg overflow-hidden">
                {current.image_url ? (
                  <img
                    src={current.image_url}
                    alt={current.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
                    <span className="text-violet-600 text-2xl font-light">
                      {current.name}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
                  {current.name}
                </h1>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {current.description}
                </p>
                <div className="text-sm text-gray-500">
                  {products.length} pièces dans cette collection
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Produits */}
        <section className="py-12 px-6">
          <div className="container mx-auto">
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg mb-8">
                  Aucun produit dans cette collection pour le moment.
                </p>
                <Link href="/products">
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    Voir tous les produits
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product: any) => {
                  const qty = Math.max(0, product.stock_quantity ?? 0);
                  const mainImage = product.images?.[0];

                  return (
                    <div key={product.id} className="group">
                      <div className="aspect-[3/4] rounded-lg overflow-hidden mb-4 relative">
                        {mainImage?.url ? (
                          <img
                            src={mainImage.url}
                            alt={mainImage.alt_text || product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">
                              Pas d&apos;image
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                          <Button
                            onClick={() => handleAddToCart(product)}
                            size="sm"
                            className="bg-white text-gray-900 hover:bg-gray-100"
                            disabled={qty === 0}
                          >
                            <ShoppingBag className="w-4 h-4 mr-1" />
                            {qty > 0 ? "Panier" : "Épuisé"}
                          </Button>

                          <Link href={`/products/${product.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white text-white hover:bg-white hover:text-gray-900"
                            >
                              Voir
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900 group-hover:text-violet-600 transition-colors">
                            {product.name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {product.category?.name ?? ""}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.short_description}
                        </p>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {product.sale_price ? (
                              <>
                                <span className="text-lg font-medium text-violet-600">
                                  {product.sale_price}€
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {product.price}€
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-medium text-gray-900">
                                {product.price}€
                              </span>
                            )}
                          </div>

                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              qty > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {qty > 0 ? "En stock" : "Épuisé"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
