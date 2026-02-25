"use client";

import React, { useMemo } from "react";
import { ShoppingCart, Clock, XCircle, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/store/useOrders";
import { useUsers } from "@/store/useUsers";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { toast } from "sonner";

type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export default function OrdersPage() {
  const { orders, loading: ordersLoading, updateOrderLocally } = useOrders();
  const { users, loading: usersLoading } = useUsers();

  const loading = ordersLoading || usersLoading;

  async function updateOrderStatus(id: string, newStatus: OrderStatus) {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update order status");

      const result = await res.json();
      if (result.success && result.data) {
        updateOrderLocally(result.data);
        toast.success(`Order ${id} updated to ${newStatus}`);
      }
    } catch (error: any) {
      toast.error("Failed to update order status");
      console.error(error);
    }
  }

  // Memoize stats to avoid recalculating on every re-render
  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      completed: orders.filter((o) => o.status === "completed").length,
    }),
    [orders],
  );

  if (loading) return <OrdersSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-heading">Orders Management</h1>
        <p className="page-subheading">Manage and track all customer orders</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full mt-5">
        <StatCard
          title="Total Orders"
          icon={<ShoppingCart className="w-6 h-6" />}
          stat={stats.total}
          description="Total number of orders placed overall."
        />
        <StatCard
          title="Pending Orders"
          icon={<Clock className="w-6 h-6" />}
          stat={stats.pending}
          description="Orders awaiting processing."
        />
        <StatCard
          title="Cancelled Orders"
          icon={<XCircle className="w-6 h-6" />}
          stat={stats.cancelled}
          description="Orders cancelled by users or admins."
        />
        <StatCard
          title="Completed Orders"
          icon={<CheckCircle className="w-6 h-6" />}
          stat={stats.completed}
          description="Orders successfully fulfilled."
        />
      </div>

      {/* Orders table */}
      <div className="mt-8">
        <DataTable
          data={orders}
          onStatusChange={updateOrderStatus}
          columns={columns(users ?? [])}
        />
      </div>
    </div>
  );
}
function OrdersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page heading skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full mt-5">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>

      {/* Orders table skeleton */}
      <div className="mt-8 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="w-full h-[400px]" />
      </div>
    </div>
  );
}
