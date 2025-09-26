// Types de base
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  featured?: boolean;
  sizes?: string[];
  colors?: string[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  products: Product[];
  featured?: boolean;
}

// ✅ CartItem défini ici - source unique de vérité
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
  sku?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: Date;
}

// Types pour les formulaires
export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export interface NewsletterForm {
  email: string;
}

// Types pour l'API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les filtres de produits
export interface ProductFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  featured?: boolean;
  colors?: string[];
  sizes?: string[];
}

// Types pour les paramètres de recherche
export interface SearchParams {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
}
