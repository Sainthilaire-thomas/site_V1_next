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
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  products: Product[];
  featured?: boolean;
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
