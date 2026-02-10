"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const updateAuthState = useCallback((currentUser: User | null) => {
    setUser(currentUser);
    const userRole =
      currentUser?.app_metadata?.role ||
      currentUser?.user_metadata?.role ||
      null;

    setRole(userRole);
    setLoading(false);
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        updateAuthState(session?.user ?? null);
      } catch (error) {
        console.error("Error fetching initial auth:", error);
        setLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      updateAuthState(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  return { user, role, loading };
}
