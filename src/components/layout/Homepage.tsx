"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const Homepage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);

  const menuItems = [
    "Collection",
    "Femme",
    "Homme",
    "Accessoires",
    "Maroquinerie",
    "Atelier",
    "Contact",
  ];

  const handleLogoClick = () => {
    setIsEasterEggActive(true);
    setTimeout(() => setIsEasterEggActive(false), 3000);
  };

  const generateStrikeElements = () => {
    const elements = [];
    for (let i = 0; i < 12; i++) {
      const randomX = Math.random() * 100;
      const randomY = Math.random() * 100;
      const randomRotation = Math.random() * 360;
      const randomDelay = Math.random() * 0.5;

      elements.push(
        <div
          key={i}
          className="fixed text-purple-600 text-6xl md:text-8xl lg:text-9xl font-black pointer-events-none z-50 opacity-0 animate-pulse"
          style={{
            left: `${randomX}%`,
            top: `${randomY}%`,
            transform: `translate(-50%, -50%) rotate(${randomRotation}deg)`,
            animationDelay: `${randomDelay}s`,
            animationDuration: "0.8s",
          }}
        >
          BLANCHE
        </div>
      );
    }
    return elements;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 relative overflow-x-hidden">
      {/* Floating subtle details - Much more discrete */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Very subtle floating points instead of lines */}
        <div className="absolute top-1/5 left-1/5 w-1 h-1 bg-gray-200 rounded-full opacity-30 animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-gray-200 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute top-3/4 left-3/4 w-0.5 h-0.5 bg-gray-300 rounded-full opacity-25 animate-pulse"
          style={{ animationDelay: "5s" }}
        />
      </div>

      {/* Easter Egg Strike Animation */}
      {isEasterEggActive && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {generateStrikeElements()}
        </div>
      )}

      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="text-2xl md:text-3xl text-gray-900 hover:text-purple-600 transition-colors duration-300 cursor-pointer font-light"
          >
            .blancherenaudin
          </button>

          {/* Menu hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative z-50 p-2 hover:text-purple-600 transition-colors duration-300"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Dropdown menu */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 bg-white/95 backdrop-blur-sm min-w-[200px] py-4 px-6 shadow-lg border border-gray-100 rounded-lg mt-2">
              <ul className="space-y-3 text-right">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="block py-2 text-gray-900 hover:text-purple-600 hover:-translate-x-2 transition-all duration-300 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="h-screen pt-20 px-6">
        <div className="container mx-auto h-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-full">
            {/* Large image left (2 rows) - Hero principale */}
            <div className="md:col-span-2 md:row-span-2 relative hover:scale-[1.01] hover:shadow-xl transition-all duration-500 group overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=1200&fit=crop&crop=center"
                alt="Collection Automne"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-500"></div>
              <div className="absolute bottom-8 left-8">
                <h2 className="text-white text-3xl md:text-4xl font-light mb-2">
                  Collection Automne
                </h2>
                <p className="text-white/90 text-lg">
                  Découvrez nos dernières créations
                </p>
              </div>
            </div>

            {/* Medium image top right - Collection Femme */}
            <div className="relative hover:scale-[1.02] hover:shadow-lg transition-all duration-500 group overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop&crop=faces"
                alt="Collection Femme"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-500"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white text-xl font-light">Femme</h3>
              </div>
            </div>

            {/* Medium image bottom right - Collection Homme */}
            <div className="relative hover:scale-[1.02] hover:shadow-lg transition-all duration-500 group overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces"
                alt="Collection Homme"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-500"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white text-xl font-light">Homme</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Scroll - 4 Encadrés Produits */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-light text-center mb-16 text-gray-900">
            Nos Créations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                id: 1,
                image:
                  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop&crop=center",
                title: "Blazer Signature",
              },
              {
                id: 2,
                image:
                  "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop&crop=center",
                title: "Robe Couture",
              },
              {
                id: 3,
                image:
                  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop&crop=center",
                title: "Chemise Atelier",
              },
              {
                id: 4,
                image:
                  "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop&crop=center",
                title: "Veste Premium",
              },
            ].map((item) => (
              <div
                key={item.id}
                className="aspect-[3/4] relative hover:scale-[1.02] hover:shadow-lg transition-all duration-300 group overflow-hidden rounded-lg"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white text-sm font-light">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photos Additionnelles - Grille asymétrique Lookbook */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-light text-center mb-16 text-gray-900">
            Lookbook
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr] gap-10">
            {/* Photo large gauche - Editorial */}
            <div className="h-[600px] relative hover:scale-[1.01] hover:shadow-lg transition-all duration-500 group overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&h=800&fit=crop"
                alt="Editorial Automne"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-500"></div>
              <div className="absolute bottom-8 left-8">
                <h3 className="text-white text-2xl font-light mb-2">
                  Editorial
                </h3>
                <p className="text-white/90">Automne/Hiver 2024</p>
              </div>
            </div>

            {/* Photo moyenne centre décalée - Accessoires */}
            <div className="h-[400px] mt-32 relative hover:scale-[1.02] hover:shadow-lg transition-all duration-500 group overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop"
                alt="Accessoires"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-500"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white text-lg font-light">Accessoires</h3>
              </div>
            </div>

            {/* Photo large droite - Atelier */}
            <div className="h-[600px] relative hover:scale-[1.01] hover:shadow-lg transition-all duration-500 group overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=800&fit=crop"
                alt="Atelier Blanche Renaudin"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-500"></div>
              <div className="absolute bottom-8 left-8">
                <h3 className="text-white text-2xl font-light mb-2">
                  L'Atelier
                </h3>
                <p className="text-white/90">Savoir-faire artisanal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-gray-100 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl text-purple-600 mb-4 font-light">
            .blancherenaudin
          </h2>
          <p className="text-gray-600 text-lg mb-2">
            Mode contemporaine & savoir-faire d'exception
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 .blancherenaudin - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
