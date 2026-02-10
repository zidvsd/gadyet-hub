"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: ReactNode;
  publicPages?: string[];
  user: User | null; // Passed from useAuth()
  role: string | null; // Passed from useAuth()
  loading: boolean;
}

export default function ProtectedRoute({
  children,
  publicPages = [],
  user, // Passed from useAuth()
  role, // Passed from useAuth()
  loading,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (publicPages.includes(pathname)) return;

    if (!user) {
      toast.error("Access Denied", {
        id: "auth-denied",
        description: "Please login.",
      });
      router.replace("/login");
      return;
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      toast.warning("Unauthorized", {
        id: "admin-denied",
        description: "Admin access required.",
      });
      router.replace("/");
    }
  }, [pathname, router, publicPages, user, role, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Spinner className="text-accent size-12" />
        <p className="text-accent text-lg font-medium">Checking access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
