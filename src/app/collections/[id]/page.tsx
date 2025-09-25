// src/app/collections/[id]/page.tsx
"use client";

import { mockCollections } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useCartStore } from "@/store/useCartStore";

interface Props {
  params: { id: string };
}

export default function CollectionDetailPage({ params }: Props) {
  const collection = mockCollections.find((c) => c.id === params.id);
  const { addItem } = useCartStore();

  if (!collection) {
    notFound();
  }

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
            <span className="text-gray-900">{collection.name}</span>
          </div>
        </div>

        {/* Hero Collection */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="aspect-[4/3] rounded-lg overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
                  {collection.name}
                </h1>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {collection.description}
                </p>
                <div className="text-sm text-gray-500">
                  {collection.products.length} pièces dans cette collection
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Produits de la collection */}
        <section className="py-12 px-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collection.products.map((product) => (
                <div key={product.id} className="group">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden mb-4 relative">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      Ajouter au panier
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-2 text-sm">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">
                        {product.price}€
                      </span>
                      <Link
                        href={`/products/${product.id}`}
                        className="text-violet-600 hover:text-violet-800 text-sm"
                      >
                        Voir détails
                      </Link>
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
