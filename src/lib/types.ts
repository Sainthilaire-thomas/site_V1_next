// Types de base
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  createdAt: Date;
}

// ✅ Ajout du type Category manquant
export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image_url?: string | null
  parent_id?: string | null
  is_active?: boolean | null
  sort_order?: number | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category?: Category | null
  inStock: boolean
  featured?: boolean
  sizes?: string[]
  colors?: string[]
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

// ✅ Types additionnels pour correspondre à votre base de données
export interface ProductImage {
  id: string;
  product_id: string | null;
  url: string;
  alt_text: string | null;
  is_primary: boolean | null;
  sort_order: number | null;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string | null;
  name: string;
  value: string;
  price_modifier: number | null;
  stock_quantity: number | null;
  sku: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

// ✅ Type Product complet pour l'API
export interface ApiProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category_id: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  stock_quantity: number | null;
  sku: string | null;
  weight: number | null;
  dimensions: string | null;
  created_at: string;
  updated_at: string;
  category: Category | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

// ✅ Type pour Wishlist
export interface WishlistItem {
  id: string;
  user_id: string | null;
  product_id: string | null;
  created_at: string;
  product: ApiProduct;
}
