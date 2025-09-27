// src/app/page.tsx - VERSION CORRIGÉE
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Homepage from "../components/layout/Homepage";

// Composant d'entrée interactive selon les consignes design
const InteractiveEntry = ({ onEnter }: { onEnter: () => void }) => {
  const [letters, setLetters] = useState<
    Array<{
      char: string;
      id: string;
      x: number;
      y: number;
      originalX: number;
      originalY: number;
      delay: number;
    }>
  >([]);
  const [isHoveringCenter, setIsHoveringCenter] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const brandName = ".blancherenaudin";

  // Génération des lettres avec positions aléatoires
  const generateLetters = useCallback(() => {
    const newLetters: Array<{
      char: string;
      id: string;
      x: number;
      y: number;
      originalX: number;
      originalY: number;
      delay: number;
    }> = [];
    const chars = brandName.split("");

    chars.forEach((char, index) => {
      const x = Math.random() * 80 + 10; // 10% à 90%
      const y = Math.random() * 80 + 10; // 10% à 90%

      newLetters.push({
        char,
        id: `letter-${index}`,
        x,
        y,
        originalX: x,
        originalY: y,
        delay: index * 0.1,
      });
    });

    setLetters(newLetters);
  }, [brandName]);

  // Gestion du mouvement de souris pour l'effet de répulsion
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x: mouseX, y: mouseY });

    setLetters((prevLetters) =>
      prevLetters.map((letter) => {
        const distance = Math.sqrt(
          Math.pow(mouseX - letter.originalX, 2) +
            Math.pow(mouseY - letter.originalY, 2)
        );

        const repulsionRadius = 20; // 20% de l'écran

        if (distance < repulsionRadius) {
          const force = (repulsionRadius - distance) / repulsionRadius;
          const angle = Math.atan2(
            letter.originalY - mouseY,
            letter.originalX - mouseX
          );

          const repulsionDistance = force * 10; // Maximum 10% de déplacement
          const newX = letter.originalX + Math.cos(angle) * repulsionDistance;
          const newY = letter.originalY + Math.sin(angle) * repulsionDistance;

          return {
            ...letter,
            x: Math.max(5, Math.min(95, newX)),
            y: Math.max(5, Math.min(95, newY)),
          };
        } else {
          // Retour à la position originale
          return {
            ...letter,
            x: letter.originalX,
            y: letter.originalY,
          };
        }
      })
    );
  }, []);

  // Initialisation
  useEffect(() => {
    generateLetters();
  }, [generateLetters]);

  // Ajout du listener de souris
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  // Gestion du clic sur le point central
  const handleCenterClick = () => {
    // Animation de convergence des lettres vers le centre
    setLetters((prevLetters) =>
      prevLetters.map((letter) => ({
        ...letter,
        x: 50, // Convergence vers le centre
        y: 50,
      }))
    );

    // Transition vers la homepage après l'animation
    setTimeout(() => {
      onEnter();
    }, 1500);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-background overflow-hidden cursor-none"
    >
      {/* Lettres dispersées flottantes */}
      {letters.map((letter, index) => (
        <div
          key={letter.id}
          className="floating-letter text-foreground"
          style={{
            left: `${letter.x}%`,
            top: `${letter.y}%`,
            fontSize: "clamp(1.2rem, 3.5vw, 2rem)",
            opacity: 0,
            animation: `letter-appear 0.5s ease-out ${letter.delay}s forwards`,
          }}
        >
          <div
            className={`${
              index % 2 === 0 ? "animate-float" : "animate-float-alt"
            }`}
            style={{
              animationDelay: `${letter.delay}s`,
            }}
          >
            {letter.char}
          </div>
        </div>
      ))}

      {/* Point central - carré noir selon les consignes */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center z-50">
        <button
          className="central-trigger"
          aria-label="Entrer sur le site"
          title="Entrer"
          onMouseEnter={() => setIsHoveringCenter(true)}
          onMouseLeave={() => setIsHoveringCenter(false)}
          onClick={handleCenterClick}
        />

        {/* Révélation du nom complet au survol du carré central */}
        {isHoveringCenter && (
          <div className="ml-4 text-violet text-2xl font-light">
            {brandName.split("").map((char, index) => (
              <span
                key={`reveal-${index}`}
                className="inline-block animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: "both",
                }}
              >
                {char}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Curseur personnalisé - petit cercle violet */}
      <div
        className="custom-cursor"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Styles CSS intégrés pour les animations */}
      <style jsx>{`
        @keyframes letter-appear {
          0% {
            opacity: 0;
            transform: scale(0.5) translate(-50%, -50%);
          }
          100% {
            opacity: 1;
            transform: scale(1) translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  );
};

export default function Home() {
  const [showHomepage, setShowHomepage] = useState(false);
  const searchParams = useSearchParams();

  // ✅ NOUVEAU: Vérifier si on doit afficher directement la homepage
  useEffect(() => {
    // Si il y a un paramètre "skip-intro" ou si l'utilisateur revient à la page d'accueil
    // depuis une autre page, on affiche directement la homepage
    const skipIntro = searchParams.get("skip-intro");
    const hasVisited = sessionStorage.getItem("hasVisitedHomepage");

    if (skipIntro === "true" || hasVisited === "true") {
      setShowHomepage(true);
    }
  }, [searchParams]);

  // ✅ NOUVEAU: Marquer que l'utilisateur a visité la homepage
  const handleEnterHomepage = () => {
    sessionStorage.setItem("hasVisitedHomepage", "true");
    setShowHomepage(true);
  };

  if (showHomepage) {
    return <Homepage />;
  }

  return <InteractiveEntry onEnter={handleEnterHomepage} />;
}
