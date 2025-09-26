// src/store/useProductStore.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Database } from "../../lib/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  images?: Database["public"]["Tables"]["product_images"]["Row"][];
  variants?: Database["public"]["Tables"]["product_variants"]["Row"][];
  category?: Database["public"]["Tables"]["categories"]["Row"];
};

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProducts: () => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchProductsByCategory: (categorySlug: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  featuredProducts: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          images:product_images(*),
          variants:product_variants(*),
          category:categories(*)
        `
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ products: data || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchFeaturedProducts: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          images:product_images(*),
          variants:product_variants(*),
          category:categories(*)
        `
        )
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ featuredProducts: data || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchProductById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          images:product_images(*),
          variants:product_variants(*),
          category:categories(*)
        `
        )
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  fetchProductsByCategory: async (categorySlug: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          images:product_images(*),
          variants:product_variants(*),
          category:categories(*)
        `
        )
        .eq("is_active", true)
        .eq("categories.slug", categorySlug)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ products: data || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
