"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useNotifications } from "@/store/useNotifications";
import { useAuth } from "@/hooks/useAuth"; // Use your existing auth hook
import { toast } from "sonner";

export function NotificationListener() {
  const { user: currentUser } = useAuth(); // Get the logged-in user

  const { addNotification, fetchNotifications } = useNotifications();

  useEffect(() => {
    if (!currentUser?.id) return;

    // 1. Initial Load: Fetch existing unread notifications
    fetchNotifications(currentUser.id);

    // 2. Realtime Subscription: Listen for new ones
    const channel = supabase
      .channel(`user-changes-${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          addNotification(payload.new as any);
          toast.info(payload.new.title, {
            description: payload.new.message,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, addNotification, fetchNotifications]);

  return null; // Invisible component
}
