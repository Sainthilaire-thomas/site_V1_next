// src/app/products/[id]/page.tsx - VERSION NETTOYÉE
"use client";

import { use } from "react";
import { mockProducts } from "@/lib/mock-data";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: Props) {
  const { id } = use(params);

  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold mb-6">Produit: {product.name}</h1>
      <p className="text-gray-600 mb-4">{product.description}</p>
      <p className="text-2xl font-bold text-purple-600 mb-6">
        {product.price}€
      </p>

      {/* Image du produit */}
      {product.images && product.images[0] && (
        <div className="mb-6">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full max-w-md h-auto rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Informations supplémentaires */}
      <div className="space-y-2 mb-8">
        <p>
          <strong>Catégorie:</strong> {product.category}
        </p>
        <p>
          <strong>Stock:</strong>{" "}
          {product.inStock ? "✅ En stock" : "❌ Épuisé"}
        </p>
        {product.sizes && (
          <p>
            <strong>Tailles:</strong> {product.sizes.join(", ")}
          </p>
        )}
        {product.colors && (
          <p>
            <strong>Couleurs:</strong> {product.colors.join(", ")}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <a
          href="/products"
          className="inline-block bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          ← Retour aux produits
        </a>
        <button className="block bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors">
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}
