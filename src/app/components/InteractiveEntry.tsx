import { useEffect, useRef, useState, useCallback } from 'react';

interface Letter {
  char: string;
  id: string;
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  delay: number;
}

interface Particle {
  id: string;
  x: number;
  delay: number;
  duration: number;
}

interface InteractiveEntryProps {
  onEnter: () => void;
}

const InteractiveEntry = ({ onEnter }: InteractiveEntryProps) => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isHoveringCenter, setIsHoveringCenter] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const brandName = '.blancherenaudin';

  // Generate letters with random positions
  const generateLetters = useCallback(() => {
    const newLetters: Letter[] = [];
    const chars = brandName.split('');
    
    chars.forEach((char, index) => {
      const x = Math.random() * 80 + 10; // 10% to 90%
      const y = Math.random() * 80 + 10; // 10% to 90%
      
      newLetters.push({
        char,
        id: `letter-${index}`,
        x,
        y,
        originalX: x,
        originalY: y,
        delay: index * 0.1
      });
    });
    
    setLetters(newLetters);
  }, [brandName]);

  // Generate particles
  const generateParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: `particle-${i}`,
        x: Math.random() * 100,
        delay: Math.random() * 15,
        duration: 15 + Math.random() * 10
      });
    }
    
    setParticles(newParticles);
  }, []);

  // Mouse move handler for repulsion effect
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x: mouseX, y: mouseY });
    
    setLetters(prevLetters => 
      prevLetters.map(letter => {
        const distance = Math.sqrt(
          Math.pow(mouseX - letter.originalX, 2) + 
          Math.pow(mouseY - letter.originalY, 2)
        );
        
        const repulsionRadius = 20; // 20% of screen
        
        if (distance < repulsionRadius) {
          const force = (repulsionRadius - distance) / repulsionRadius;
          const angle = Math.atan2(
            letter.originalY - mouseY, 
            letter.originalX - mouseX
          );
          
          const repulsionDistance = force * 10; // Maximum 10% displacement
          const newX = letter.originalX + Math.cos(angle) * repulsionDistance;
          const newY = letter.originalY + Math.sin(angle) * repulsionDistance;
          
          return {
            ...letter,
            x: Math.max(5, Math.min(95, newX)),
            y: Math.max(5, Math.min(95, newY))
          };
        } else {
          // Return to original position
          return {
            ...letter,
            x: letter.originalX,
            y: letter.originalY
          };
        }
      })
    );
  }, []);

  // Initialize
  useEffect(() => {
    generateLetters();
    generateParticles();
  }, [generateLetters, generateParticles]);

  // Add mouse listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  // Handle center point click
  const handleCenterClick = () => {
    // Animate letters out and transition to main site
    setLetters(prevLetters =>
      prevLetters.map(letter => ({
        ...letter,
        x: 50, // Move all letters to center
        y: 50
      }))
    );
    
    // After animation, transition to homepage
    setTimeout(() => {
      onEnter();
    }, 1500);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-white overflow-hidden cursor-none"
    >

      {/* Scattered letters */}
      {letters.map((letter, index) => (
        <div
          key={letter.id}
          className="absolute font-brand text-foreground transition-all duration-300 ease-out hover:scale-150 hover:text-accent hover:drop-shadow-lg cursor-pointer select-none"
          style={{
            left: `${letter.x}%`,
            top: `${letter.y}%`,
            fontSize: 'clamp(1.2rem, 3.5vw, 2rem)',
            transform: 'translate(-50%, -50%)',
            animationName: 'letter-appear',
            animationDuration: '0.5s',
            animationDelay: `${letter.delay}s`,
            animationFillMode: 'both',
            filter: `drop-shadow(2px 2px 4px hsl(var(--violet-trail)))`
          }}
        >
          <div 
            className={`${index % 2 === 0 ? 'animate-float' : 'animate-float-alt'}`}
            style={{ animationDelay: `${letter.delay}s` }}
          >
            {letter.char}
          </div>
        </div>
      ))}

      {/* Center point */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center z-50">
        <button
          className="w-7 h-7 bg-foreground cursor-pointer transition-all duration-300 hover:scale-125 hover:border-2 hover:border-accent hover:animate-glow-pulse"
          onMouseEnter={() => setIsHoveringCenter(true)}
          onMouseLeave={() => setIsHoveringCenter(false)}
          onClick={handleCenterClick}
        />
        
        {/* Revealed text on center hover */}
        {isHoveringCenter && (
          <div className="ml-4 font-brand text-accent text-2xl">
            {brandName.split('').map((char, index) => (
              <span
                key={`reveal-${index}`}
                className="inline-block animate-fade-in-up"
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'both'
                }}
              >
                {char}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Custom cursor */}
      <div
        className="fixed w-2 h-2 bg-accent rounded-full pointer-events-none z-50 transition-transform duration-75"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  );
};

export default InteractiveEntry;