// src/components/layout/UnifiedHeader.tsx
"use client";

import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";

interface UnifiedHeaderProps {
  variant?: "default" | "transparent" | "minimal";
  showNavigation?: boolean;
}

export default function UnifiedHeader({
  variant = "default",
  showNavigation = true,
}: UnifiedHeaderProps) {
  const { totalItems } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Classes communes pour le logo pour garantir la cohérence
  const logoClasses =
    "text-2xl font-light text-gray-900 hover:text-violet-600 transition-colors";

  // Classes pour le header selon la variante
  const headerClasses = {
    default:
      "sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50",
    transparent: "absolute top-0 w-full bg-transparent z-50",
    minimal: "sticky top-0 bg-white border-b border-gray-100 z-50",
  };

  const navigation = [
    { name: 'Collections', href: '/collections' },
    { name: 'Produits', href: '/products' },
    { name: 'Lookbooks', href: '/lookbooks' },
    { name: 'Inspirations', href: '/collections-editoriales' },
    { name: 'À Propos', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <header className={headerClasses[variant]}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className={logoClasses}>
            .blancherenaudin
          </Link>

          {/* Navigation desktop */}
          {showNavigation && (
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-violet-600 transition-colors font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Panier */}
            <Link href="/cart">
              <Button variant="outline" size="sm" className="relative">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Panier
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-violet-600 text-white min-w-[20px] h-5 text-xs flex items-center justify-center">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Menu mobile */}
            {showNavigation && (
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Navigation mobile */}
        {showNavigation && isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-violet-600 transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
