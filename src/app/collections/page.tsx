// src/app/collections/page.tsx
"use client";

import { mockCollections } from "@/lib/mock-data";
import Link from "next/link";
import Header from "@/components/layout/Header";

export default function CollectionsPage() {
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {mockCollections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  className="group block"
                >
                  <div className="aspect-[4/3] relative overflow-hidden rounded-lg mb-6">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-2xl font-light text-gray-900 mb-2">
                    {collection.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{collection.description}</p>
                  <span className="text-violet-600 group-hover:text-violet-800">
                    Découvrir →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
