import { create } from "zustand";
import { Order } from "@/lib/types/orders";

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  fetchOrders: (
    role?: "admin" | "user",
    userId?: string,
    force?: boolean,
  ) => Promise<void>;
  clearOrders: () => void;
  updateOrderLocally: (updatedOrder: Order) => void;
}

export const useOrders = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  lastUpdated: null,

  updateOrderLocally: (updatedOrder) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order,
      ),
    }));
  },

  fetchOrders: async (role = "user", userId?: string, force = false) => {
    const { orders, loading, lastUpdated } = get();
    const now = Date.now();

    if (
      !force &&
      orders.length > 0 &&
      lastUpdated &&
      now - lastUpdated < 120000
    ) {
      return;
    }
    if (!force && loading) return;

    set({ loading: true, error: null });

    try {
      const isAdmin = role === "admin";
      let endpoint = isAdmin ? "/api/admin/orders" : "/api/client/orders";
      if (userId && !isAdmin) {
        endpoint += `?user_id=${userId}`;
      }

      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const json = await res.json();
      console.log("Admin API Response:", json);
      if (json.success === false) {
        set({ error: json.error, loading: false, orders: [] });
        return;
      }

      set({
        orders: json.data ?? json,
        loading: false,
        lastUpdated: Date.now(),
      });
    } catch (error: any) {
      set({
        error: error.message ?? "Unknown error",
        loading: false,
      });
    }
  },

  clearOrders: () =>
    set({ orders: [], error: null, loading: false, lastUpdated: null }),
}));
