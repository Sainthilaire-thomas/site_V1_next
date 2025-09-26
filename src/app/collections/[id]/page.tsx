// src/app/collections/[slug]/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useCartStore } from "@/store/useCartStore";
import { useCollectionStore } from "@/store/useCollectionStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  params: { slug: string };
}

export default function CollectionDetailPage({ params }: Props) {
  const { addItem } = useCartStore();
  const {
    current,
    productsOfCurrent,
    isLoadingDetail,
    fetchCollectionBySlug,
    fetchProductsForCollection,
    error,
  } = useCollectionStore();

  useEffect(() => {
    (async () => {
      const col = await fetchCollectionBySlug(params.slug);
      if (col) {
        await fetchProductsForCollection(col.id);
      }
    })();
  }, [params.slug, fetchCollectionBySlug, fetchProductsForCollection]);

  const handleAddToCart = (p: any) =>
    addItem({
      id: p.id,
      name: p.name,
      price: p.sale_price ?? p.price,
      image: p.images?.[0]?.url ?? "/placeholder.jpg",
    });

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-6 py-20 text-center">
            <h1 className="text-2xl font-medium text-red-600 mb-4">
              Erreur de chargement
            </h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </main>
      </div>
    );
  }

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
            <span className="text-gray-900">{current?.name ?? "…"}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            {isLoadingDetail && !current ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <Skeleton className="aspect-[4/3] rounded-lg" />
                <div className="space-y-4">
                  <Skeleton className="h-12 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ) : current ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="aspect-[4/3] rounded-lg overflow-hidden">
                  {current.image_url ? (
                    <img
                      src={current.image_url}
                      alt={current.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
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
                    {productsOfCurrent.length} pièces dans cette collection
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Collection introuvable.
              </div>
            )}
          </div>
        </section>

        {/* Produits */}
        <section className="py-12 px-6">
          <div className="container mx-auto">
            {isLoadingDetail && productsOfCurrent.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[3/4] rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {productsOfCurrent.map((p) => (
                  <div key={p.id} className="group">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden mb-4 relative">
                      {p.images?.[0]?.url ? (
                        <img
                          src={p.images[0].url}
                          alt={p.images[0].alt_text || p.name}
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
                          onClick={() => handleAddToCart(p)}
                          size="sm"
                          className="bg-white text-gray-900 hover:bg-gray-100"
                          disabled={p.stock_quantity === 0}
                        >
                          {p.stock_quantity > 0 ? "Panier" : "Épuisé"}
                        </Button>
                        <Link href={`/products/${p.id}`}>
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
                          {p.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {p.category?.name ?? ""}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {p.short_description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {p.sale_price ? (
                            <>
                              <span className="text-lg font-medium text-violet-600">
                                {p.sale_price}€
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {p.price}€
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-medium text-gray-900">
                              {p.price}€
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            p.stock_quantity > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {p.stock_quantity > 0 ? "En stock" : "Épuisé"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoadingDetail && current && productsOfCurrent.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">
                  Aucun produit dans cette collection.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
