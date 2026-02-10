import { create } from "zustand";
import { Product } from "@/lib/types/products";

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  fetchProducts: (query?: string, force?: boolean) => Promise<void>;
  updateProductState: (id: string, updates: Partial<Product>) => void;
  clearProducts: () => void;
}

export const useProducts = create<ProductsState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  lastUpdated: null,

  fetchProducts: async (query?: string, force?: boolean) => {
    const { products, lastUpdated, loading } = get();
    const now = Date.now();

    if (
      !force &&
      !query &&
      products.length > 0 &&
      lastUpdated &&
      now - lastUpdated < 120000
    ) {
      return;
    }

    if (loading && !force) return;

    set({ loading: true, error: null });

    try {
      let url = "/api/products";
      if (query) url += `?q=${encodeURIComponent(query)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Unable to fetch products");

      const json = await res.json();

      if (json.success === false) {
        set({ error: json.error, loading: false, products: [] });
        return;
      }

      const data = json.data ?? json;

      set({
        products: Array.isArray(data) ? data : [],
        loading: false,
        lastUpdated: query ? lastUpdated : Date.now(),
      });
      set({ products: json.data ?? json, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false, products: [] });
    }
  },
  updateProductState: (id: string, updates: Partial<Product>) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      ),
    }));
  },
  clearProducts: () =>
    set({ products: [], error: null, loading: false, lastUpdated: null }),
}));
