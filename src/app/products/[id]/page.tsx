// src/app/products/[id]/page.tsx
"use client";

import { useState } from "react";
import { mockProducts } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Minus, Plus, Heart } from "lucide-react";

interface Props {
  params: { id: string };
}

export default function ProductDetailPage({ params }: Props) {
  const product = mockProducts.find((p) => p.id === params.id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const { addItem } = useCartStore();

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    if (product.sizes && !selectedSize) {
      alert("Veuillez sélectionner une taille");
      return;
    }
    if (product.colors && !selectedColor) {
      alert("Veuillez sélectionner une couleur");
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[selectedImage],
        size: selectedSize,
        color: selectedColor,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="px-6 py-4 border-b">
          <div className="container mx-auto">
            <Link
              href="/products"
              className="text-violet-600 hover:text-violet-800"
            >
              Produits
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>

        {/* Produit */}
        <section className="py-12 px-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Images */}
              <div>
                <div className="aspect-[4/5] rounded-lg overflow-hidden mb-4">
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {product.images.length > 1 && (
                  <div className="flex gap-3">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-20 h-24 rounded-md overflow-hidden border-2 transition-colors ${
                          selectedImage === index
                            ? "border-violet-600"
                            : "border-gray-200"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Détails */}
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-light text-gray-900 mb-2">
                      {product.name}
                    </h1>
                    <p className="text-xl font-medium text-gray-900">
                      {product.price}€
                    </p>
                  </div>
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite
                        ? "text-red-500"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      size={24}
                      fill={isFavorite ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <p className="text-gray-600 mb-8 leading-relaxed">
                  {product.description}
                </p>

                {/* Tailles */}
                {product.sizes && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">Taille</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 border rounded-md transition-colors ${
                            selectedSize === size
                              ? "border-violet-600 text-violet-600"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Couleurs */}
                {product.colors && (
                  <div className="mb-8">
                    <h3 className="font-medium text-gray-900 mb-3">Couleur</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 border rounded-md transition-colors ${
                            selectedColor === color
                              ? "border-violet-600 text-violet-600"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantité */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-900 mb-3">Quantité</h3>
                  <div className="flex items-center border rounded-md w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-6 py-3 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300"
                    size="lg"
                  >
                    {product.inStock ? "Ajouter au panier" : "Produit épuisé"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-violet-600 text-violet-600 hover:bg-violet-50"
                    size="lg"
                  >
                    Acheter maintenant
                  </Button>
                </div>

                {/* Infos */}
                <div className="mt-8 pt-8 border-t">
                  <div className="space-y-3 text-sm text-gray-600">
                    <div>✓ Livraison gratuite dès 150€</div>
                    <div>✓ Retours gratuits sous 30 jours</div>
                    <div>✓ Garantie savoir-faire</div>
                    <div>✓ Service client personnalisé</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Produits similaires */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-2xl font-light text-gray-900 mb-12 text-center">
              Vous pourriez aussi aimer
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mockProducts
                .filter(
                  (p) => p.id !== product.id && p.category === product.category
                )
                .slice(0, 3)
                .map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.id}`}
                    className="group block"
                  >
                    <div className="aspect-[3/4] rounded-lg overflow-hidden mb-4">
                      <img
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1 group-hover:text-violet-600 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {relatedProduct.description}
                    </p>
                    <span className="text-lg font-medium text-gray-900">
                      {relatedProduct.price}€
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
