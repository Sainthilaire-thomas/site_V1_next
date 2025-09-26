// src/store/useCollectionStore.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Database } from "../../lib/database.types";

type Collection = Database["public"]["Tables"]["collections"]["Row"] & {
  products?: (Database["public"]["Tables"]["products"]["Row"] & {
    images?: Database["public"]["Tables"]["product_images"]["Row"][];
  })[];
};

interface CollectionState {
  collections: Collection[];
  currentCollection: Collection | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCollections: () => Promise<void>;
  fetchCollectionBySlug: (slug: string) => Promise<Collection | null>;
}

export const useCollectionStore = create<CollectionState>((set) => ({
  collections: [],
  currentCollection: null,
  isLoading: false,
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
              images:product_images(*)
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
          products: collection.collection_products
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
            }),
        })) || [];

      set({ collections: transformedCollections, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchCollectionBySlug: async (slug: string) => {
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
              variants:product_variants(*)
            )
          )
        `
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;

      // Transform data
      const transformedCollection = {
        ...data,
        products:
          data.collection_products
            ?.map((cp) => cp.product)
            .filter(Boolean)
            .sort((a, b) => {
              const aOrder =
                data.collection_products?.find((cp) => cp.product?.id === a?.id)
                  ?.sort_order || 0;
              const bOrder =
                data.collection_products?.find((cp) => cp.product?.id === b?.id)
                  ?.sort_order || 0;
              return aOrder - bOrder;
            }) || [],
      };

      set({ currentCollection: transformedCollection, isLoading: false });
      return transformedCollection;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return null;
    }
  },
}));
