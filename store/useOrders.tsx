import { create } from "zustand";
import { Order } from "@/lib/types/orders";

interface OrdersState {
  orders: Order[];
  userOrders: Order[]; // Initialize the separate bucket
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
  userOrders: [], // Initialize the separate bucket
  loading: false,
  error: null,
  lastUpdated: null,

  updateOrderLocally: (updatedOrder) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order,
      ),
      userOrders: state.userOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order,
      ),
    }));
  },
  fetchOrderById: async (orderId, role = "user") => {
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
        userOrders: state.userOrders.some((o) => o.id === orderId)
          ? state.userOrders.map((o) => (o.id === orderId ? freshOrder : o))
          : [freshOrder, ...state.userOrders],
      }));

      return freshOrder;
    } catch (error: any) {
      set({ error: error.message ?? "Failed to fetch order", loading: false });
      return null;
    }
  },
  fetchOrders: async (role = "user", userId?: string, force = false) => {
    const { orders, userOrders, loading, lastUpdated } = get();
    const now = Date.now();

    const hasData = userId ? userOrders.length > 0 : orders.length > 0;
    if (!force && hasData && lastUpdated && now - lastUpdated < 120000) return;
    if (!force && loading) return;

    set({ loading: true, error: null });

    try {
      const isAdmin = role === "admin";
      let endpoint = isAdmin ? "/api/admin/orders" : "/api/client/orders";

      if (userId) {
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

      if (json.success === false) {
        set({ error: json.error, loading: false });
        return;
      }
      const freshData = json.data ?? json;
      set({
        ...(userId ? { userOrders: freshData } : { orders: freshData }),
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
    set({
      orders: [],
      userOrders: [],
      error: null,
      loading: false,
      lastUpdated: null,
    }),
}));
