// src/app/cart/page.tsx
"use client";

import { useState } from "react";
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import { useCartStore } from '@/store/useCartStore'
import { Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from '@/components/products/ProductImage'

export default function CartPage() {
  const {
    items,
    totalItems,
    totalPrice,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCartStore()

  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)

  const applyPromoCode = () => {
    // Simulation de codes promo
    const promoCodes = {
      WELCOME10: 10,
      SUMMER20: 20,
      VIP15: 15,
    }

    const discountPercent = promoCodes[promoCode as keyof typeof promoCodes]
    if (discountPercent) {
      setDiscount(discountPercent)
    }
  }

  const finalPrice = totalPrice * (1 - discount / 100)

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <HeaderMinimal />

        <main className="pt-32 pb-24 px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-section mb-6">.empty cart</h1>
            <p className="text-body text-grey-medium mb-12">
              discover our collections and find the pieces that suit you.
            </p>
            <Link
              href="/collections"
              className="inline-block py-3 px-8 text-[13px] tracking-[0.05em] font-semibold lowercase bg-white text-black border border-black hover:bg-black hover:text-white transition-colors"
            >
              view collections
            </Link>
          </div>
        </main>

        <FooterMinimal />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <HeaderMinimal />

      <main className="pt-32 pb-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-baseline mb-16">
            <h1 className="text-section">.cart</h1>
            <p className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium">
              {totalItems} {totalItems > 1 ? 'items' : 'item'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Articles */}
            <div className="lg:col-span-2">
              <div className="space-y-8">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.size}-${item.color}`}
                    className="flex gap-6 pb-8 border-b border-grey-light"
                  >
                    <div className="w-32 h-40 flex-shrink-0 overflow-hidden">
                      {item.imageId && item.productId ? (
                        <ProductImage
                          productId={item.productId}
                          imageId={item.imageId}
                          alt={item.name}
                          size="sm"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-product mb-2">{item.name}</h3>
                          <div className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium">
                            {item.size && <span>size: {item.size}</span>}
                            {item.size && item.color && <span> • </span>}
                            {item.color && <span>color: {item.color}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-grey-medium hover:text-black transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center border border-grey-medium">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-2 hover:bg-grey-light transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-2 text-[13px] tracking-[0.05em] font-semibold lowercase">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-2 hover:bg-grey-light transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-[15px] tracking-[0.02em] font-medium text-black">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                          <div className="text-[13px] tracking-[0.05em] lowercase text-grey-medium">
                            {formatPrice(item.price)} / unit
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <button
                  onClick={clearCart}
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  clear cart
                </button>
              </div>
            </div>

            {/* Résumé */}
            <div>
              <div className="border border-grey-light p-8 sticky top-32">
                <h2 className="text-product mb-8">summary</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium">
                    <span>subtotal</span>
                    <span className="text-black">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium">
                    <span>shipping</span>
                    <span className="text-black">free</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[13px] tracking-[0.05em] font-semibold lowercase text-black">
                      <span>discount (-{discount}%)</span>
                      <span>-{formatPrice((totalPrice * discount) / 100)}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-grey-light">
                    <div className="flex justify-between text-[15px] tracking-[0.02em] font-semibold text-black">
                      <span className="lowercase">total</span>
                      <span>{formatPrice(finalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Code promo */}
                <div className="mb-8">
                  <label className="block text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-3">
                    promo code
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      placeholder="WELCOME10"
                      className="flex-1 border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="text-[13px] tracking-[0.05em] font-semibold lowercase border-b border-grey-medium hover:border-black transition-colors pb-2"
                    >
                      apply
                    </button>
                  </div>
                </div>

                <a
                  href="/checkout"
                  className="block w-full py-4 text-[13px] tracking-[0.05em] font-semibold lowercase bg-black text-white hover:bg-gray-800 transition-colors mb-4 text-center"
                >
                  checkout
                </a>

                <Link
                  href="/collections"
                  className="block text-center text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  continue shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterMinimal />
    </div>
  )
}
