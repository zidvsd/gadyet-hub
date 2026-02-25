"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useNotifications } from "@/store/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { Notification } from "../types/notifications";
import { useOrders } from "@/store/useOrders";

export function NotificationListener() {
  const { fetchOrders } = useOrders();
  const { user: currentUser, role } = useAuth();
  const { addNotification, fetchNotifications } = useNotifications();

  useEffect(() => {
    if (!currentUser?.id) return;

    const isAdmin = role === "admin";
    console.log("Subscribing as:", isAdmin ? "Admin" : "User"); // Debug log
    // 1. Initial Load
    fetchNotifications(isAdmin ? "all" : currentUser.id);

    // 2. Realtime Subscription
    const channelName = isAdmin
      ? `admin-changes-${currentUser.id}`
      : `user-changes-${currentUser.id}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const raw = payload.new;
          const existingNotifications =
            useNotifications.getState().notifications;
          if (existingNotifications.some((n) => n.id === String(raw.id)))
            return;

          // --- LOGIC GATE ---
          if (isAdmin) {
            const adminTypes = ["admin_order_alert", "order_placed", "general"];
            // Admin only wants to see specific alerts
            if (!adminTypes.includes(raw.type)) {
              console.log("Admin ignored notification type:", raw.type);
              return;
            }
          } else {
            // User only wants to see their own notifications
            if (raw.user_id !== currentUser.id) return;
          }

          // Trigger order list refresh
          if (raw.order_id) {
            fetchOrders(
              isAdmin ? "admin" : "user",
              isAdmin ? undefined : currentUser.id,
              true,
            );
          }

          const newNotif: Notification = {
            id: String(raw.id),
            user_id: String(raw.user_id),
            title: String(raw.title || "Order Update"),
            message: String(raw.message || ""),
            type: String(raw.type || "general"),
            is_read: Boolean(raw.is_read),
            created_at: raw.created_at,
            order_id: raw.order_id,
          };

          addNotification(newNotif as any);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, role, fetchOrders, addNotification, fetchNotifications]);

  return null;
}
