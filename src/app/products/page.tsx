// src/app/products/page.tsx
"use client";

import { useState } from "react";
import { mockProducts } from "@/lib/mock-data";
import Header from "@/components/layout/Header";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  const [filter, setFilter] = useState("all");
  const { addItem } = useCartStore();

  const categories = ["all", ...new Set(mockProducts.map((p) => p.category))];
  const filteredProducts =
    filter === "all"
      ? mockProducts
      : mockProducts.filter((p) => p.category === filter);

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  };

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

        {/* Filtres */}
        <section className="py-8 px-6 border-y bg-gray-50">
          <div className="container mx-auto">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-6 py-2 rounded-full transition-colors ${
                    filter === category
                      ? "bg-violet-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {category === "all" ? "Tout" : category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grille produits */}
        <section className="py-12 px-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden mb-4 relative">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        size="sm"
                        className="bg-white text-gray-900 hover:bg-gray-100"
                      >
                        Panier
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
                        {product.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">
                        {product.price}€
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          product.inStock
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.inStock ? "En stock" : "Épuisé"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
