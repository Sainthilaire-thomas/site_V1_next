import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Database } from '../lib/database.types'

// ---- Helpers logging ----
const L = {
  on:
    typeof window !== "undefined"
      ? !/^(false|0)$/i.test(process.env.NEXT_PUBLIC_DEBUG_COLLECTIONS ?? "")
      : true,
  start(label: string, extra?: any) {
    if (!this.on) return;
    console.groupCollapsed(
      `%c[collections] ${label}`,
      "color:#6b21a8;font-weight:600"
    );
    if (extra !== undefined) console.log("▶ extra:", extra);
    console.time(`⏱ ${label}`);
  },
  end(label: string) {
    if (!this.on) return;
    console.timeEnd(`⏱ ${label}`);
    console.groupEnd();
  },
  log(...args: any[]) {
    if (!this.on) return;
    console.log(...args);
  },
  warn(...args: any[]) {
    if (!this.on) return;
    console.warn(...args);
  },
  error(...args: any[]) {
    if (!this.on) return;
    console.error(...args);
  },
};

// --- Types DB ---
type DBCollection = Database["public"]["Tables"]["collections"]["Row"];
type DBProduct = Database["public"]["Tables"]["products"]["Row"];
type DBProductImage = Database["public"]["Tables"]["product_images"]["Row"];
type DBCategory = Database["public"]["Tables"]["categories"]["Row"];
type DBCollectionProduct =
  Database["public"]["Tables"]["collection_products"]["Row"];

// --- Types enrichis ---
export type Product = DBProduct & {
  images?: DBProductImage[];
  category?: DBCategory | null;
};

export type Collection = DBCollection & {
  products?: Product[];
};

interface CollectionState {
  collections: Collection[];
  current: Collection | null;
  productsOfCurrent: Product[];
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;

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

  // --- Liste des collections (actives) ---
  fetchCollections: async () => {
    const label = "fetchCollections";
    L.start(label);

    set({ isLoading: true, error: null });
    L.log("state(before):", { ...get() });

    try {
      L.log("→ Supabase query: collections + pivot + nested");
      const { data, error } = await supabase
        .from("collections")
        .select(
          `
          *,
          collection_products:collection_products(
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

      L.log("← Supabase rows:", data?.length ?? 0);
      if (data?.length) {
        // petite preview des IDs pour debuggage
        L.log(
          "rows ids:",
          data.map((r: any) => ({ id: r.id, slug: r.slug }))
        );
      }

      const transformed: Collection[] =
        (data ?? []).map((row: any) => {
          const cps = (row.collection_products ?? []) as Array<{
            sort_order: DBCollectionProduct["sort_order"];
            product: Product | null;
          }>;

          const products: Product[] = cps
            .map((cp) => cp.product)
            .filter(Boolean) as Product[];

          // Ordonner via sort_order du pivot
          products.sort((a, b) => {
            const aOrder =
              cps.find((cp) => cp.product?.id === a.id)?.sort_order ?? 0;
            const bOrder =
              cps.find((cp) => cp.product?.id === b.id)?.sort_order ?? 0;
            return aOrder - bOrder;
          });

          const { collection_products, ...rest } = row;
          return {
            ...(rest as DBCollection),
            products,
          };
        }) || [];

      L.log("transformed collections:", {
        count: transformed.length,
        withProducts: transformed.map((c) => ({
          id: c.id,
          slug: c.slug,
          products: c.products?.length ?? 0,
        })),
      });

      set({ collections: transformed, isLoading: false });
      L.log("state(after):", {
        collectionsCount: get().collections.length,
        isLoading: get().isLoading,
      });
    } catch (e) {
      L.error("Error fetching collections:", e);
      set({ error: (e as Error).message, isLoading: false });
    } finally {
      L.end(label);
    }
  },

  // --- Détail d'une collection par slug ---
  fetchCollectionBySlug: async (slug: string) => {
    const label = `fetchCollectionBySlug:${slug}`;
    L.start(label, { slug });

    set({ isLoadingDetail: true, error: null });
    L.log("state(before):", { ...get(), big: "hidden" });

    try {
      L.log("→ Supabase query: collections by slug");
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("slug", slug)
        .limit(1)
        .maybeSingle();

      if (error) {
        L.error("supabase error:", error);
        set({ error: error.message, isLoadingDetail: false, current: null });
        return null;
      }

      if (!data) {
        L.warn("no row for slug:", slug);
        set({ isLoadingDetail: false, current: null });
        return null;
      }

      set({
        current: data as Collection,
        isLoadingDetail: false,
        productsOfCurrent: [],
      });

      L.log("current set to:", {
        id: data.id,
        slug: data.slug,
        name: data.name,
      });
      L.log("state(after):", {
        current: get().current?.slug,
        isLoadingDetail: get().isLoadingDetail,
      });
      return data as Collection;
    } catch (e) {
      L.error("exception:", e);
      set({
        error: (e as Error).message,
        isLoadingDetail: false,
        current: null,
      });
      return null;
    } finally {
      L.end(label);
    }
  },

  // --- Produits d'une collection (via pivot) ---
  fetchProductsForCollection: async (collectionId: string) => {
    const label = `fetchProductsForCollection:${collectionId}`;
    L.start(label, { collectionId });

    set({ isLoadingDetail: true });
    L.log("state(before):", { ...get(), big: "hidden" });

    try {
      L.log("→ Supabase query: collection_products by collection_id");
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

      L.log("← Supabase rows (pivot):", data?.length ?? 0);

      const products: Product[] = (data ?? [])
        .map((cp: any) => cp.product)
        .filter(Boolean) as Product[];

      L.log("mapped products:", {
        count: products.length,
        ids: products.map((p) => p.id),
      });

      set({ productsOfCurrent: products, isLoadingDetail: false });
      L.log("state(after):", {
        productsCount: get().productsOfCurrent.length,
        isLoadingDetail: get().isLoadingDetail,
      });
    } catch (e) {
      L.error("Error fetching products for collection:", e);
      set({ error: (e as Error).message, isLoadingDetail: false });
    } finally {
      L.end(label);
    }
  },
}));
