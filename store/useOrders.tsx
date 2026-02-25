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
  fetchOrderById: (
    orderId: string,
    role?: "admin" | "user",
  ) => Promise<Order | null>;
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
  fetchOrderById: async (orderId, role = "user") => {
    // Check if we already have it in state to avoid a flicker
    const existingOrder = get().orders.find((o) => o.id === orderId);

    set({ loading: true, error: null });

    try {
      const isAdmin = role === "admin";
      const endpoint = isAdmin
        ? `/api/admin/orders/${orderId}`
        : `/api/client/orders/${orderId}`;

      const res = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const json = await res.json();

      if (json.success === false) {
        set({ error: json.error, loading: false });
        return null;
      }

      const freshOrder = json.data;

      // Sync the single order back into the main list so other pages update
      set((state) => ({
        loading: false,
        orders: state.orders.some((o) => o.id === orderId)
          ? state.orders.map((o) => (o.id === orderId ? freshOrder : o))
          : [freshOrder, ...state.orders],
      }));

      return freshOrder;
    } catch (error: any) {
      set({ error: error.message ?? "Failed to fetch order", loading: false });
      return null;
    }
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
