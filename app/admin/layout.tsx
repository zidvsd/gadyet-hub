"use client";
import "../globals.css";
import { useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { adminMenu } from "@/lib/layoutMenus";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/store/useOrders";
import { useUsers } from "@/store/useUsers";
import { useProducts } from "@/store/useProducts";
import { useNotifications } from "@/store/useNotifications";
import Link from "next/link";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, loading: authLoading } = useAuth();
  const { fetchOrders } = useOrders();
  const { fetchNotifications } = useNotifications();
  const { fetchUsers } = useUsers();
  const { fetchProducts } = useProducts();

  useEffect(() => {
    if (!authLoading && role === "admin") {
      const loadAdminData = async () => {
        try {
          await Promise.all([
            fetchOrders("admin"),
            fetchUsers("admin"),
            fetchNotifications("all"),
            fetchProducts(),
          ]);
        } catch (err) {
          console.error("Admin data fetch failed:", err);
        }
      };

      loadAdminData();
    }
  }, [
    role,
    authLoading,
    fetchOrders,
    fetchUsers,
    fetchNotifications,
    fetchProducts,
  ]);

  return (
    <SidebarProvider>
      <AppSidebar items={adminMenu} />
      <main className="w-full p-4 lg:p-6 max-w-[1440px]">
        <div className="flex justify-between">
          <SidebarTrigger />
          {/* logo */}
          <Link className="" href="/">
            <h1 className="logo">GadyetHub</h1>
          </Link>
        </div>
        <div className="mt-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
