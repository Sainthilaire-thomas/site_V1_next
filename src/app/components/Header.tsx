"use client";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useCart } from "../hooks/CartContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          MyShop
        </Link>

        <ul className="hidden md:flex gap-6">
          <li>
            <Link to="/" className="hover:text-indigo-600">
              Produits
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-indigo-600">
              À propos
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-indigo-600">
              Contact
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full px-2">
                {totalItems}
              </span>
            )}
          </Link>
          <button onClick={() => setIsOpen((v) => !v)} className="md:hidden">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="md:hidden bg-white shadow">
          <ul className="flex flex-col p-4 gap-3">
            <li>
              <Link to="/" onClick={() => setIsOpen(false)}>
                Produits
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={() => setIsOpen(false)}>
                À propos
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={() => setIsOpen(false)}>
                Contact
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
