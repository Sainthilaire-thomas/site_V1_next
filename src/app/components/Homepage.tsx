import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Homepage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);

  const menuItems = [
    'Collection',
    'Femme', 
    'Homme',
    'Accessoires',
    'Maroquinerie',
    'Atelier',
    'Contact'
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
          className="fixed font-brand text-violet text-6xl md:text-8xl lg:text-9xl font-black pointer-events-none z-50 animate-strike-appear"
          style={{
            left: `${randomX}%`,
            top: `${randomY}%`,
            transform: `translate(-50%, -50%) rotate(${randomRotation}deg)`,
            animationDelay: `${randomDelay}s`
          }}
        >
          BLANCHE
        </div>
      );
    }
    return elements;
  };

  return (
    <div className="min-h-screen bg-background font-body text-foreground relative overflow-x-hidden">
      {/* Floating violet details */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Vertical lines */}
        <div className="absolute left-1/4 top-0 w-px h-full bg-violet-subtle animate-float-detail" />
        <div className="absolute right-1/3 top-0 w-px h-full bg-violet-subtle animate-float-detail" style={{ animationDelay: '2s' }} />
        
        {/* Horizontal lines */}
        <div className="absolute top-1/4 left-0 h-px w-full bg-violet-subtle animate-float-detail" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-1/3 left-0 h-px w-full bg-violet-subtle animate-float-detail" style={{ animationDelay: '6s' }} />
        
        {/* Floating points */}
        <div className="absolute top-1/5 left-1/5 w-2 h-2 bg-violet-soft rounded-full animate-float-detail" />
        <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-violet-soft rounded-full animate-float-detail" style={{ animationDelay: '3s' }} />
        <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-violet-soft rounded-full animate-float-detail" style={{ animationDelay: '5s' }} />
      </div>

      {/* Easter Egg Strike Animation */}
      {isEasterEggActive && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {generateStrikeElements()}
        </div>
      )}

      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b border-violet-soft">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={handleLogoClick}
            className="font-brand text-2xl md:text-3xl text-foreground hover:text-violet transition-colors duration-300 cursor-pointer"
          >
            .blancherenaudin
          </button>

          {/* Menu hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative z-50 p-2 hover:text-violet transition-colors duration-300"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Dropdown menu */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 bg-background/95 backdrop-blur-sm min-w-[200px] py-4 px-6 animate-slide-down">
              <ul className="space-y-3 text-right">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="block py-2 text-foreground hover:text-violet hover:-translate-x-2 transition-all duration-300 font-medium"
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
            {/* Large image left (2 rows) */}
            <div className="md:col-span-2 md:row-span-2 bg-muted hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-glow transition-all duration-500 group overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
                <span className="text-muted-foreground text-2xl font-brand group-hover:text-violet transition-colors">
                  Hero Image
                </span>
              </div>
            </div>

            {/* Medium image top right */}
            <div className="bg-muted hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-glow transition-all duration-500 group overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                <span className="text-muted-foreground font-brand group-hover:text-violet transition-colors">
                  Collection 1
                </span>
              </div>
            </div>

            {/* Medium image bottom right */}
            <div className="bg-muted hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-glow transition-all duration-500 group overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
                <span className="text-muted-foreground font-brand group-hover:text-violet transition-colors">
                  Collection 2
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Scroll - 4 Encadrés */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="aspect-[3/4] bg-muted border-4 border-background shadow-lg shadow-violet-glow/20 hover:animate-hover-lift hover:shadow-xl hover:shadow-violet-glow/40 transition-all duration-300 group overflow-hidden"
              >
                <div className="w-full h-full bg-gradient-to-b from-secondary to-muted flex items-center justify-center">
                  <span className="text-muted-foreground font-brand group-hover:text-violet transition-colors">
                    Frame {item}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photos Additionnelles - Grille asymétrique */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr] gap-10">
            {/* Photo large gauche */}
            <div className="h-[600px] bg-muted hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-glow transition-all duration-500 group overflow-hidden">
              <div className="w-full h-full bg-gradient-to-tr from-muted to-secondary flex items-center justify-center">
                <span className="text-muted-foreground text-2xl font-brand group-hover:text-violet transition-colors">
                  Large Photo 1
                </span>
              </div>
            </div>

            {/* Photo moyenne centre décalée vers le bas */}
            <div className="h-[400px] mt-32 bg-muted hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-glow transition-all duration-500 group overflow-hidden">
              <div className="w-full h-full bg-gradient-to-bl from-secondary to-muted flex items-center justify-center">
                <span className="text-muted-foreground font-brand group-hover:text-violet transition-colors">
                  Medium
                </span>
              </div>
            </div>

            {/* Photo large droite */}
            <div className="h-[600px] bg-muted hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-glow transition-all duration-500 group overflow-hidden">
              <div className="w-full h-full bg-gradient-to-tl from-muted to-secondary flex items-center justify-center">
                <span className="text-muted-foreground text-2xl font-brand group-hover:text-violet transition-colors">
                  Large Photo 2
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-violet-soft">
        <div className="container mx-auto text-center">
          <h2 className="font-brand text-3xl md:text-4xl text-violet mb-4">
            .blancherenaudin
          </h2>
          <p className="font-body text-muted-foreground text-lg mb-2">
            Mode contemporaine & savoir-faire d'exception
          </p>
          <p className="font-body text-muted-foreground text-sm">
            © 2024 .blancherenaudin - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;