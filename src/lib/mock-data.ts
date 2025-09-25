// src/lib/mock-data.ts
import { Product, Collection } from "./types";

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Blazer Signature",
    description:
      "Blazer iconique en laine vierge, coupe ajustée. Parfait pour un look professionnel ou décontracté chic.",
    price: 285,
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop",
    ],
    category: "Vestes",
    inStock: true,
    featured: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Noir", "Marine", "Camel"],
  },
  {
    id: "2",
    name: "Robe Couture Midi",
    description:
      "Robe midi en crêpe de soie, finitions main. Coupe fluide et élégante pour toutes les occasions.",
    price: 195,
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop",
    ],
    category: "Robes",
    inStock: true,
    featured: true,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Noir", "Rouge bordeaux", "Bleu nuit"],
  },
  {
    id: "3",
    name: "Chemise Atelier",
    description:
      "Chemise en coton bio, col officier. Pièce intemporelle au tombé parfait.",
    price: 125,
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop",
    ],
    category: "Chemises",
    inStock: true,
    featured: false,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Blanc", "Bleu clair", "Rose poudré"],
  },
  {
    id: "4",
    name: "Veste Premium Laine",
    description:
      "Veste structurée en laine mélangée, doublure soie. Élégance moderne et confort absolu.",
    price: 345,
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop",
    ],
    category: "Vestes",
    inStock: true,
    featured: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Gris anthracite", "Beige", "Marine"],
  },
  {
    id: "5",
    name: "Pantalon Tailleur",
    description:
      "Pantalon droit taille haute, coupe impeccable. Parfait pour un look business ou casual chic.",
    price: 165,
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop",
    ],
    category: "Pantalons",
    inStock: true,
    featured: false,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Noir", "Marine", "Gris", "Camel"],
  },
  {
    id: "6",
    name: "Robe Cocktail Soie",
    description:
      "Robe courte en soie sauvage, détails plissés. Sophistication et modernité réunies.",
    price: 275,
    images: [
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&h=800&fit=crop",
    ],
    category: "Robes",
    inStock: false,
    featured: true,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Noir", "Champagne", "Emeraude"],
  },
  {
    id: "7",
    name: "Chemisier Soie",
    description:
      "Chemisier fluide en soie naturelle, col lavallière. Féminité et raffinement.",
    price: 185,
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop",
    ],
    category: "Chemises",
    inStock: true,
    featured: false,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Blanc cassé", "Rose poudré", "Bleu ciel"],
  },
  {
    id: "8",
    name: "Manteau Cachemire",
    description:
      "Manteau long en cachemire pur, coupe droite. Investissement mode pour l'hiver.",
    price: 485,
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop",
    ],
    category: "Manteaux",
    inStock: true,
    featured: true,
    sizes: ["S", "M", "L"],
    colors: ["Camel", "Gris perle", "Marine"],
  },
];

export const mockCollections: Collection[] = [
  {
    id: "automne-hiver-2024",
    name: "Automne/Hiver 2024",
    description:
      "Collection capsule aux coupes épurées et aux matières nobles. L'essence du vestiaire moderne.",
    image:
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=600&fit=crop",
    products: mockProducts.filter((p) => p.featured),
    featured: true,
  },
  {
    id: "essentiels",
    name: "Les Essentiels",
    description:
      "Pièces intemporelles du vestiaire féminin. Basics de qualité pour un style sans effort.",
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=600&fit=crop",
    products: mockProducts.filter((p) =>
      ["Chemises", "Pantalons"].includes(p.category)
    ),
    featured: false,
  },
  {
    id: "ceremonie",
    name: "Cérémonie",
    description:
      "Robes et ensembles pour vos moments d'exception. Élégance et sophistication.",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=600&fit=crop",
    products: mockProducts.filter((p) => p.category === "Robes"),
    featured: true,
  },
];

// Fonction utilitaire pour obtenir des produits aléatoirement
export const getRandomProducts = (count: number): Product[] => {
  const shuffled = [...mockProducts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Fonction pour obtenir les produits d'une catégorie
export const getProductsByCategory = (category: string): Product[] => {
  return mockProducts.filter((product) => product.category === category);
};

// Fonction pour obtenir les produits en promotion (simulé)
export const getSaleProducts = (): Product[] => {
  return mockProducts.slice(0, 3); // Simule les 3 premiers comme étant en promo
};
