// src/app/products/page.tsx - Version Supabase corrigée
"use client";

import { useEffect } from "react";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const { products, isLoading, error, fetchProducts } = useProductStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
    });
  };

  // ✅ Fonction helper pour gérer stock_quantity null/undefined
  const getStockQuantity = (product: any): number => {
    return product.stock_quantity ?? 0;
  };

  // ✅ Fonction helper pour vérifier si le produit est en stock
  const isInStock = (product: any): boolean => {
    return getStockQuantity(product) > 0;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-6 py-20 text-center">
            <h1 className="text-2xl font-medium text-red-600 mb-4">
              Erreur de chargement
            </h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button onClick={() => fetchProducts()}>Réessayer</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
              Nos Créations
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez toute notre gamme de pièces d'exception, conçues pour
              sublimer votre style au quotidien.
            </p>
          </div>
        </section>

        {/* Grille produits */}
        <section className="py-12 px-6">
          <div className="container mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[3/4] rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                  <div key={product.id} className="group">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden mb-4 relative">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].alt_text || product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">Pas d'image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                        <Button
                          onClick={() => handleAddToCart(product)}
                          size="sm"
                          className="bg-white text-gray-900 hover:bg-gray-100"
                          disabled={!isInStock(product)} // ✅ Utilisation de la fonction helper
                        >
                          {isInStock(product) ? "Panier" : "Épuisé"} // ✅
                          Utilisation de la fonction helper
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
                          {product.category?.name}
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
                            isInStock(product) // ✅ Utilisation de la fonction helper
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isInStock(product) ? "En stock" : "Épuisé"} // ✅
                          Utilisation de la fonction helper
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && products.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">
                  Aucun produit disponible pour le moment.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
