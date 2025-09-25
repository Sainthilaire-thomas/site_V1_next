// src/app/cart/page.tsx
"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const {
    items,
    totalItems,
    totalPrice,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCartStore();

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const applyPromoCode = () => {
    // Simulation de codes promo
    const promoCodes = {
      WELCOME10: 10,
      SUMMER20: 20,
      VIP15: 15,
    };

    const discountPercent = promoCodes[promoCode as keyof typeof promoCodes];
    if (discountPercent) {
      setDiscount(discountPercent);
    }
  };

  const finalPrice = totalPrice * (1 - discount / 100);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />

        <main className="pt-20">
          <div className="container mx-auto px-6 py-20 text-center">
            <h1 className="text-4xl font-light text-gray-900 mb-6">
              Votre panier est vide
            </h1>
            <p className="text-gray-600 mb-8">
              Découvrez nos collections et trouvez les pièces qui vous
              correspondent.
            </p>
            <Link
              href="/collections"
              className="inline-flex items-center px-8 py-3 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
            >
              Voir les Collections
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-20">
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-3xl font-light text-gray-900 mb-8">
            Panier ({totalItems} {totalItems > 1 ? "articles" : "article"})
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Articles */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.size}-${item.color}`}
                    className="flex gap-4 p-6 border rounded-lg"
                  >
                    <div className="w-24 h-32 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        {item.size && <span>Taille: {item.size}</span>}
                        {item.size && item.color && <span> • </span>}
                        {item.color && <span>Couleur: {item.color}</span>}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-2 hover:bg-gray-50 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-2 font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-2 hover:bg-gray-50 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatPrice(item.price)} / unité
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Vider le panier
                </Button>
              </div>
            </div>

            {/* Résumé */}
            <div>
              <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Récapitulatif
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span>
                    <span>Gratuite</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Remise (-{discount}%)</span>
                      <span>-{formatPrice((totalPrice * discount) / 100)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-medium text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(finalPrice)}</span>
                  </div>
                </div>

                {/* Code promo */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code promo
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="WELCOME10"
                    />
                    <Button
                      variant="outline"
                      onClick={applyPromoCode}
                      className="shrink-0"
                    >
                      Appliquer
                    </Button>
                  </div>
                </div>

                <Button className="w-full bg-violet-600 hover:bg-violet-700 mb-4">
                  Procéder au paiement
                </Button>

                <Link
                  href="/collections"
                  className="block text-center text-violet-600 hover:text-violet-800 transition-colors"
                >
                  Continuer les achats
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
