"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;

        setUser(currentUser);
        // Priority: app_metadata (Server-set) > user_metadata (Client-set)
        const userRole =
          currentUser?.app_metadata?.role ||
          currentUser?.user_metadata?.role ||
          null;

        setRole(userRole);
      } catch (error) {
        console.error("Error fetching auth:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;

      setUser(currentUser);
      const userRole =
        currentUser?.app_metadata?.role ||
        currentUser?.user_metadata?.role ||
        null;

      setRole(userRole);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, role, loading };
}
