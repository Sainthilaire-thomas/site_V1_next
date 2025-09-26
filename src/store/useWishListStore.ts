// src/store/useWishlistStore.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Database } from "../../lib/database.types";

type WishlistItem = Database["public"]["Tables"]["wishlist_items"]["Row"] & {
  product: Database["public"]["Tables"]["products"]["Row"] & {
    images?: Database["public"]["Tables"]["product_images"]["Row"][];
  };
};

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchWishlist: async () => {
    set({ isLoading: true, error: null });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        set({ items: [], isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from("wishlist_items")
        .select(
          `
          *,
          product:products(
            *,
            images:product_images(*)
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ items: data || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addToWishlist: async (productId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("wishlist_items").insert({
        user_id: user.id,
        product_id: productId,
      });

      if (error) throw error;

      // Refresh wishlist
      get().fetchWishlist();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  removeFromWishlist: async (productId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;

      // Update local state
      set((state) => ({
        items: state.items.filter((item) => item.product_id !== productId),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  isInWishlist: (productId: string) => {
    return get().items.some((item) => item.product_id === productId);
  },
}));
