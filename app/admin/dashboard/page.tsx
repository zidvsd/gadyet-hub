"use client";

import React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  Package,
  Users,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";

import { useOrders } from "@/store/useOrders";
import { useProducts } from "@/store/useProducts";
import { useUsers } from "@/store/useUsers";
import { recentOrders, OrderStatus } from "./columns";

export default function DashboardPage() {
  const { orders, loading: ordersLoading, updateOrderLocally } = useOrders();
  const { products, loading: productsLoading } = useProducts();
  const { users, loading: usersLoading } = useUsers();

  const loading = ordersLoading || productsLoading || usersLoading;

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();
      if (result.success) {
        updateOrderLocally(result.data);
        toast.success(`Order status successfully updated`);
      }
    } catch (err: any) {
      toast.error("An error occurred while updating status");
    }
  };

  const stats = React.useMemo(
    () => ({
      totalProducts: products.length,
      totalOrders: orders.length,
      totalUsers: users?.length ?? 0,
      pending: orders.filter((o) => o.status === "pending").length,
    }),
    [products, orders, users],
  );

  const recentOrdersColumn = React.useMemo(() => orders.slice(0, 5), [orders]);

  const totalLowStocks = React.useMemo(
    () => products.filter((p) => p.stock <= 5).length,
    [products],
  );

  // Handle Loading State early
  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-heading">Dashboard</h1>
        <p className="page-subheading">Welcome to your admin dashboard</p>
      </div>

      {totalLowStocks > 0 && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/50 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-orange-500">
            <AlertTriangle className="size-5" />
            <span className="font-medium">
              {totalLowStocks} products are running low on stock!
            </span>
          </div>
          <Link
            href="/admin/dashboard/inventory"
            className="text-sm underline hover:text-orange-400"
          >
            View Products
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        <StatCard
          title="Total Products"
          icon={<Package className="size-6" />}
          stat={stats.totalProducts}
          description="All products currently available"
        />
        <StatCard
          title="Total Orders"
          icon={<ShoppingCart className="size-6" />}
          stat={stats.totalOrders}
          description="Total customer orders"
        />
        <StatCard
          title="Pending Orders"
          icon={<DollarSign className="size-6" />}
          stat={stats.pending}
          description="Awaiting processing"
        />
        <StatCard
          title="Total Users"
          icon={<Users className="size-6" />}
          stat={stats.totalUsers}
          description="Registered customers"
        />
      </div>

      <div className="mt-6">
        <h1 className="page-heading mb-4">Recent Orders</h1>
        <DataTable
          columns={recentOrders}
          data={recentOrdersColumn}
          meta={{ onStatusChange: handleStatusChange }}
        />
      </div>
    </div>
  );
}
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-5">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full " />
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-80 w-full " />
      </div>
    </div>
  );
}
