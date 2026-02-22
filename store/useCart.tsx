import { create } from "zustand";
import { toast } from "sonner";
import { CartItem } from "@/lib/types/cart";
interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  isAdding: boolean;
  fetchCart: (force?: boolean, silent?: boolean) => Promise<void>;
  addToCart: (
    productId: string,
    stock: number,
    quantity?: number,
  ) => Promise<boolean>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => void;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  isAdding: false,
  error: null,
  lastUpdated: null,

  fetchCart: async (force = false, silent = false) => {
    const { items, lastUpdated } = get();
    const now = Date.now();

    if (
      !force &&
      items.length > 0 &&
      lastUpdated &&
      now - lastUpdated < 120000
    ) {
      return;
    }
    if (!silent) set({ loading: true, error: null });

    try {
      const res = await fetch("/api/client/user/cart", {
        credentials: "include",
      });
      const json = await res.json();

      if (!json.success) {
        set({ error: json.error, loading: false });
        return;
      }

      set({
        items: json.data.items ?? [],
        lastUpdated: Date.now(),
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message ?? "Unknown error",
        items: [],
      });
    } finally {
      if (!silent) set({ loading: false });
    }
  },

  addToCart: async (
    productId,
    stock: number,
    quantity = 1,
  ): Promise<boolean> => {
    const existingItem = get().items.find(
      (item) => item.product_id === productId,
    );
    const currentInCart = existingItem?.quantity || 0;
    const newTotalRequested = currentInCart + quantity;

    if (newTotalRequested > stock) {
      toast.error(`Only ${stock} unit/s available.`);
      return false;
    }

    set({ isAdding: true, error: null });
    try {
      const res = await fetch("/api/client/user/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product_id: productId, quantity }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add to cart");
      }
      await get().fetchCart(true, true);

      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    } finally {
      set({ isAdding: false });
    }
  },

  updateQuantity: async (cartItemId, quantity) => {
    const item = get().items.find((i) => i.id === cartItemId);
    const stock = item?.product?.stock ?? 0;
    if (quantity > stock) {
      toast.error(`Sorry, no stocks available.`);
      return;
    }

    const previousItems = get().items;
    set((state) => ({
      items: state.items.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item,
      ),
    }));

    try {
      const res = await fetch(`/api/client/user/cart/${cartItemId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: quantity }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      set({ lastUpdated: Date.now() });
    } catch (err: any) {
      toast.error(err.message || "Failed to update quantity");
      set({ items: previousItems }); // Revert on error
    }
  },

  removeFromCart: async (cartItemId) => {
    const previousItems = get().items;

    set((state) => ({
      items: state.items.filter((item) => item.id !== cartItemId),
    }));

    try {
      const res = await fetch(`/api/client/user/cart/${cartItemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();

      if (!json.success) throw new Error(json.error);

      toast.success("Item removed");
      set({ lastUpdated: Date.now() });
    } catch (err: any) {
      toast.error(err.message || "Failed to remove item");
      set({ items: previousItems }); // Revert
    }
  },
  clearCart: () => set({ items: [], error: null, lastUpdated: null }),
}));
