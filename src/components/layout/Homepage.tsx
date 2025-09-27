// src/components/layout/Homepage.tsx - AJUSTEMENTS SUBTILS VERS SOBRIÉTÉ
"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const Homepage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);

  const menuItems = [
    { name: "Collections", href: "/collections" },
    { name: "Produits", href: "/products" },
    { name: "À Propos", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Panier", href: "/cart" },
  ];

  const handleLogoClick = () => {
    setIsEasterEggActive(true);
    setTimeout(() => setIsEasterEggActive(false), 3000);
  };

  const generateStrikeElements = () => {
    const elements = [];
    for (let i = 0; i < 6; i++) {
      // Moins d'éléments = plus sobre
      const randomX = Math.random() * 100;
      const randomY = Math.random() * 100;
      const randomRotation = Math.random() * 360;
      const randomDelay = Math.random() * 0.5;

      elements.push(
        <div
          key={i}
          className="fixed text-violet text-4xl md:text-6xl font-light pointer-events-none z-50 opacity-0 animate-pulse" // Plus petit, font-light
          style={{
            left: `${randomX}%`,
            top: `${randomY}%`,
            transform: `translate(-50%, -50%) rotate(${randomRotation}deg)`,
            animationDelay: `${randomDelay}s`,
            animationDuration: "0.6s", // Plus court
          }}
        >
          BLANCHE
        </div>
      );
    }
    return elements;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      {/* Détails flottants plus discrets */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/6 w-0.5 h-0.5 bg-gray-100 rounded-full opacity-20 animate-subtle-float" />
        <div
          className="absolute bottom-1/3 right-1/5 w-0.5 h-0.5 bg-gray-100 rounded-full opacity-15 animate-subtle-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Easter Egg plus discret */}
      {isEasterEggActive && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {generateStrikeElements()}
        </div>
      )}

      {/* Header plus minimal */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-sm border-b border-gray-50">
        {" "}
        {/* Bordure plus discrète */}
        <nav className="container mx-auto px-8 py-6 flex items-center justify-between">
          {" "}
          {/* Plus d'espace */}
          <Link
            href="/"
            className="text-xl text-gray-900 hover:text-violet transition-colors duration-300 font-light tracking-tight" // Plus petit, tracking serré
            onClick={handleLogoClick}
          >
            .blancherenaudin
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative z-50 p-3 hover:text-violet transition-colors duration-300"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}{" "}
            {/* Plus petit */}
          </button>
          {/* Menu plus épuré */}
          {isMenuOpen && (
            <div className="menu-panel absolute top-full right-0 min-w-[180px] py-6 px-8 shadow-sm border border-gray-50 rounded-lg mt-4">
              {" "}
              {/* Ombres plus discrètes */}
              <ul className="space-y-4 text-right">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="block py-1 text-gray-700 hover:text-violet hover:-translate-x-1 transition-all duration-200 font-normal text-sm tracking-wide" // Plus discret
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </header>

      {/* Hero plus épuré - gardez la structure mais moins d'effets */}
      <section className="h-screen pt-24 px-8">
        {" "}
        {/* Plus d'espace en haut */}
        <div className="container mx-auto h-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {" "}
            {/* Gap plus grand */}
            <Link
              href="/collections"
              className="md:col-span-2 md:row-span-2 relative hover-subtle transition-all duration-300 group overflow-hidden rounded-md block" // Coins moins arrondis
            >
              <img
                src="https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=1200&fit=crop&crop=center"
                alt="Collection Automne"
                className="w-full h-full object-cover filter brightness-105 contrast-95" // Image plus douce
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/15 transition-all duration-300"></div>{" "}
              {/* Overlay plus discret */}
              <div className="absolute bottom-12 left-12">
                {" "}
                {/* Plus d'espace */}
                <h2 className="text-white text-2xl md:text-3xl font-light mb-3 tracking-tight">
                  {" "}
                  {/* Plus petit */}
                  Collection Automne
                </h2>
                <p className="text-white/80 text-base font-light">
                  {" "}
                  {/* Plus discret */}
                  Découvrez nos dernières créations
                </p>
              </div>
            </Link>
            <Link
              href="/products"
              className="relative hover-subtle transition-all duration-300 group overflow-hidden rounded-md block"
            >
              <img
                src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop&crop=faces"
                alt="Collection Femme"
                className="w-full h-full object-cover filter brightness-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/15 transition-all duration-300"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-white text-lg font-light tracking-tight">
                  Femme
                </h3>
              </div>
            </Link>
            <Link
              href="/products"
              className="relative hover-subtle transition-all duration-300 group overflow-hidden rounded-md block"
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces"
                alt="Collection Homme"
                className="w-full h-full object-cover filter brightness-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/15 transition-all duration-300"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-white text-lg font-light tracking-tight">
                  Homme
                </h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Section produits plus minimaliste */}
      <section className="py-24 px-8">
        {" "}
        {/* Plus d'espace */}
        <div className="container mx-auto">
          <h2 className="text-3xl font-light text-center mb-20 text-gray-800 tracking-tight">
            {" "}
            {/* Plus discret */}
            Nos Créations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {" "}
            {/* Plus d'espace entre éléments */}
            {[
              {
                id: 1,
                image:
                  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop",
                title: "Blazer Signature",
              },
              {
                id: 2,
                image:
                  "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop",
                title: "Robe Couture",
              },
              {
                id: 3,
                image:
                  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop",
                title: "Chemise Atelier",
              },
              {
                id: 4,
                image:
                  "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop",
                title: "Veste Premium",
              },
            ].map((item) => (
              <Link
                key={item.id}
                href="/products"
                className="aspect-[3/4] relative hover-subtle transition-all duration-200 group overflow-hidden rounded-md block border border-gray-50" // Bordure discrète
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover filter brightness-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-200"></div>{" "}
                {/* Très discret */}
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <h3 className="text-white text-xs font-light tracking-wide uppercase">
                    {" "}
                    {/* Plus petit, uppercase */}
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer minimaliste */}
      <footer className="py-16 px-8 border-t border-gray-50 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl text-gray-700 mb-3 font-light tracking-tight">
            {" "}
            {/* Plus discret */}
            .blancherenaudin
          </h2>
          <p className="text-gray-500 text-sm font-light mb-1">
            Mode contemporaine & savoir-faire d'exception
          </p>
          <p className="text-gray-400 text-xs font-light">
            © 2024 .blancherenaudin - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
