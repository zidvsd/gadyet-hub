import { create } from "zustand";
import { User } from "@/lib/types/users";

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  fetchUsers: (role?: "admin" | "user", force?: boolean) => Promise<void>;
  fetchUserById: (userId: string, role?: "admin" | "user") => Promise<void>;
  clearUsers: () => void;
}

export const useUsers = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  lastUpdated: null,

  fetchUsers: async (role = "user", force = false) => {
    const { users, loading, lastUpdated } = get();
    const now = Date.now();

    if (
      !force &&
      users.length > 0 &&
      lastUpdated &&
      now - lastUpdated < 120000
    ) {
      return;
    }

    if (loading && !force) return;

    set({ loading: true, error: null });

    try {
      const endpoint =
        role === "admin" ? "/api/admin/users" : "/api/client/user";

      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Unable to fetch users");

      const json = await res.json();

      if (json.success === false) {
        set({ error: json.error, users: [], loading: false });
        return;
      }

      set({
        users: json.data ?? json,
        loading: false,
        lastUpdated: Date.now(),
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  fetchUserById: async (userId: string, role = "admin") => {
    set({ loading: true, error: null });

    try {
      // Adjusted endpoint for single user fetch
      const endpoint =
        role === "admin"
          ? `/api/admin/users/${userId}`
          : `/api/client/user/${userId}`;

      const res = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error("User not found");

      const json = await res.json();

      if (json.success) {
        const freshUser = json.data;
        set((state) => ({
          // Filter out the old version of this user (if it exists) and add the fresh one
          users: state.users.some((u) => u.id === userId)
            ? state.users.map((u) => (u.id === userId ? freshUser : u))
            : [freshUser, ...state.users],
        }));
        return freshUser;
      } else {
        set({ error: json.error, loading: false });
        return null;
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  clearUsers: () =>
    set({ users: [], error: null, loading: false, lastUpdated: null }),
}));
