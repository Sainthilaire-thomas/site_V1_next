// Vous devez également mettre à jour votre mock-data.ts pour être sûr qu'il existe
// src/lib/mock-data.ts - Assurez-vous que ce fichier existe
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
    products: mockProducts.filter((p) => ["Chemises"].includes(p.category)),
    featured: false,
  },
];
