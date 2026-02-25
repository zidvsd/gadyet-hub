import { create } from "zustand";
import { Notification } from "@/lib/types/notifications";
import { toast } from "sonner";
interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;

  fetchNotifications: (userId: string, force?: boolean) => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearNotifications: () => void;
}

export const useNotifications = create<NotificationsState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,
  lastUpdated: null,

  fetchNotifications: async (userId, force = false) => {
    const { notifications, loading, lastUpdated } = get();
    const now = Date.now();

    if (
      !force &&
      notifications.length > 0 &&
      lastUpdated &&
      now - lastUpdated < 10000
    ) {
      return;
    }

    if (loading && !force) return;

    set({ loading: true, error: null });

    try {
      const res = await fetch(`/api/notifications/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");

      const json = await res.json();

      set({
        notifications: json.data || [],
        loading: false,
        lastUpdated: Date.now(),
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addNotification: (newNotif) => {
    set((state) => {
      // 1. Strict Duplicate Check
      if (state.notifications.some((n) => n.id === newNotif.id)) {
        return state;
      }

      const isAdminType = newNotif.type === "admin_order_alert";

      toast.success(newNotif.title, {
        description: newNotif.message,
      });

      return {
        notifications: [newNotif, ...state.notifications],
      };
    });
  },
  markAsRead: async (notificationId) => {
    try {
      // Optimistic Update: Change UI immediately
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      }));

      // Update Database
      await fetch(`/api/notifications/read`, {
        method: "PATCH",
        body: JSON.stringify({ id: notificationId }),
      });
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  },
  markAllAsRead: async (userId) => {
    try {
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          is_read: true,
        })),
      }));

      await fetch(`/api/notifications/read-all`, {
        method: "PATCH",
        body: JSON.stringify({ userId }),
      });
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  },

  deleteNotification: async (notificationId) => {
    const previousNotifications = get().notifications;
    try {
      // 1. Optimistic Update: Remove from UI immediately
      set((state) => ({
        notifications: state.notifications.filter(
          (n) => n.id !== notificationId,
        ),
      }));

      // 2. Database Update
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete from server");
    } catch (err) {
      console.error("Delete error:", err);
      // 3. Rollback: If API fails, put the notification back
      set({ notifications: previousNotifications });
      toast.error("Could not delete notification. Please try again.");
    }
  },
  clearNotifications: () =>
    set({ notifications: [], error: null, loading: false, lastUpdated: null }),
}));
