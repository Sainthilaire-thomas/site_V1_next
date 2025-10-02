"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

type Product = {
  id: string;
  name: string;
  short_description: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number | null;
  images?: Array<{ url: string; alt_text: string | null }>;
  category?: { name: string } | null;
};

export default function ProductCardClient({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const qty = Math.max(0, product.stock_quantity ?? 0);
  const mainImage = product.images?.[0];

  return (
    <div className="group">
      <div className="aspect-[3/4] rounded-lg overflow-hidden mb-4 relative">
        {mainImage?.url ? (
          <img
            src={mainImage.url}
            alt={mainImage.alt_text || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Pas d&apos;image</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button
            onClick={() =>
              addItem({
                id: product.id,
                name: product.name,
                price: product.sale_price ?? product.price,
                image: mainImage?.url ?? '/placeholder.jpg',
              })
            }
            size="sm"
            className="bg-white text-gray-900 hover:bg-gray-100"
            disabled={qty === 0}
          >
            <ShoppingBag className="w-4 h-4 mr-1" />
            {qty > 0 ? 'Panier' : 'Épuisé'}
          </Button>

          <Link href={`/product/${product.id}`}>
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
            {product.category?.name ?? ''}
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
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {qty > 0 ? 'En stock' : 'Épuisé'}
          </span>
        </div>
      </div>
    </div>
  )
}
