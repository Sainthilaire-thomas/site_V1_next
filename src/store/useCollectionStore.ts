// src/store/useCollectionStore.ts - VERSION CORRIGÉE
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Database } from "../../lib/database.types";

type Collection = Database["public"]["Tables"]["collections"]["Row"] & {
  products?: (Database["public"]["Tables"]["products"]["Row"] & {
    images?: Database["public"]["Tables"]["product_images"]["Row"][];
    category?: Database["public"]["Tables"]["categories"]["Row"];
  })[];
};

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  images?: Database["public"]["Tables"]["product_images"]["Row"][];
  category?: Database["public"]["Tables"]["categories"]["Row"];
};

interface CollectionState {
  collections: Collection[];
  current: Collection | null;
  productsOfCurrent: Product[];
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;

  // Actions
  fetchCollections: () => Promise<void>;
  fetchCollectionBySlug: (slug: string) => Promise<Collection | null>;
  fetchProductsForCollection: (collectionId: string) => Promise<void>;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  collections: [],
  current: null,
  productsOfCurrent: [],
  isLoading: false,
  isLoadingDetail: false,
  error: null,

  fetchCollections: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("collections")
        .select(
          `
          *,
          collection_products(
            sort_order,
            product:products(
              *,
              images:product_images(*),
              category:categories(*)
            )
          )
        `
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      // Transform data to match expected structure
      const transformedCollections =
        data?.map((collection) => ({
          ...collection,
          products:
            collection.collection_products
              ?.map((cp) => cp.product)
              .filter(Boolean)
              .sort((a, b) => {
                const aOrder =
                  collection.collection_products?.find(
                    (cp) => cp.product?.id === a?.id
                  )?.sort_order || 0;
                const bOrder =
                  collection.collection_products?.find(
                    (cp) => cp.product?.id === b?.id
                  )?.sort_order || 0;
                return aOrder - bOrder;
              }) || [],
        })) || [];

      set({ collections: transformedCollections, isLoading: false });
    } catch (error) {
      console.error("Error fetching collections:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchCollectionBySlug: async (slug: string) => {
    set({ isLoadingDetail: true, error: null });

    try {
      const { data, error } = await supabase
        .from("collections")
        .select(
          `
          *
        `
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;

      set({
        current: data,
        isLoadingDetail: false,
        productsOfCurrent: [], // Reset products
      });

      return data;
    } catch (error) {
      console.error("Error fetching collection by slug:", error);
      set({ error: (error as Error).message, isLoadingDetail: false });
      return null;
    }
  },

  fetchProductsForCollection: async (collectionId: string) => {
    set({ isLoadingDetail: true });

    try {
      const { data, error } = await supabase
        .from("collection_products")
        .select(
          `
          sort_order,
          product:products(
            *,
            images:product_images(*),
            category:categories(*)
          )
        `
        )
        .eq("collection_id", collectionId)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      const products = data?.map((cp) => cp.product).filter(Boolean) || [];

      set({
        productsOfCurrent: products,
        isLoadingDetail: false,
      });
    } catch (error) {
      console.error("Error fetching products for collection:", error);
      set({ error: (error as Error).message, isLoadingDetail: false });
    }
  },
}));
