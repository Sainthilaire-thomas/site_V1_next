// src/app/collections/page.tsx - Version Supabase
"use client";

import { useEffect } from "react";
import { useCollectionStore } from "@/store/useCollectionStore";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionsPage() {
  const { collections, isLoading, error, fetchCollections } =
    useCollectionStore();

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

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
        {/* Hero */}
        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
              Collections
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez nos collections capsule, pensées pour sublimer votre
              garde-robe.
            </p>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="py-12 px-6">
          <div className="container mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-6">
                    <Skeleton className="aspect-[4/3] rounded-lg" />
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.slug}`}
                    className="group block"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden rounded-lg mb-6">
                      {collection.image_url ? (
                        <img
                          src={collection.image_url}
                          alt={collection.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
                          <span className="text-violet-600 text-2xl font-light">
                            {collection.name}
                          </span>
                        </div>
                      )}
                      {collection.is_featured && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-violet-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-light text-gray-900 mb-2">
                      {collection.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {collection.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-violet-600 group-hover:text-violet-800">
                        Découvrir →
                      </span>
                      <span className="text-sm text-gray-500">
                        {collection.products?.length || 0} pièces
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!isLoading && collections.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">
                  Aucune collection disponible pour le moment.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
