// src/components/layout/Header.tsx - VERSION CORRIGÉE
"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Menu, X, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCartStore();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - ✅ CORRIGÉ: avec paramètre pour skip l'intro */}
          <Link href="/?skip-intro=true" className="flex-shrink-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-violet-800 bg-clip-text text-transparent">
              .blancherenaudin
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/collections"
              className="text-gray-700 hover:text-violet-600 transition-colors"
            >
              Collections
            </Link>
            <Link
              href="/"
              className="text-gray-700 hover:text-violet-600 transition-colors"
            >
              Produits
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-violet-600 transition-colors"
            >
              À Propos
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-violet-600 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-violet-600 transition-colors"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Menu Mobile Button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Cart Mobile */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-violet-600 transition-colors"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Menu Button */}
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-700 hover:text-violet-600 transition-colors"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
            isMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="py-4 space-y-4 border-t border-gray-200">
            <Link
              href="/collections"
              onClick={toggleMenu}
              className="block text-gray-700 hover:text-violet-600 transition-colors"
            >
              Collections
            </Link>
            <Link
              href="/"
              onClick={toggleMenu}
              className="block text-gray-700 hover:text-violet-600 transition-colors"
            >
              Produits
            </Link>
            <Link
              href="/about"
              onClick={toggleMenu}
              className="block text-gray-700 hover:text-violet-600 transition-colors"
            >
              À Propos
            </Link>
            <Link
              href="/contact"
              onClick={toggleMenu}
              className="block text-gray-700 hover:text-violet-600 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
