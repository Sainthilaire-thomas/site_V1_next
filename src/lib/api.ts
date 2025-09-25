import { Product, Collection, User } from "./types";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Collections
  async getCollections(): Promise<Collection[]> {
    return this.request<Collection[]>("/collections");
  }

  async getCollection(id: string): Promise<Collection> {
    return this.request<Collection>(`/collections/${id}`);
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>("/products");
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.request<Product[]>("/products/featured");
  }

  // User
  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }
}

export const api = new ApiClient();
