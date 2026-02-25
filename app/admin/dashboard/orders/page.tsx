"use client";

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update order status");
      }
      const result = await res.json();
      if (result.success && result.data) {
        // Use the new local action instead of a full fetch
        updateOrderLocally(result.data);
      }
      toast.success(`Order ${id} status successfully updated`);
    } catch (error: any) {
      toast.error("Failed to update order status", error.message);
      console.error(error);
    }
  }

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status === "pending",
  ).length;
  const cancelledOrders = orders.filter(
    (order) => order.status === "cancelled",
  ).length;
  const completedOrders = orders.filter(
    (order) => order.status === "completed",
  ).length;

  return (
    <div>
      {loading ? (
        <>
          {/* Page heading skeleton */}
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-5 w-2/3 mb-6" />

          {/* Stat cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full mt-5">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* Orders table skeleton */}
          <div className="mt-8">
            <Skeleton className="h-8 w-1/4 mb-4" />
            <Skeleton className="w-full h-48 rounded-md" />
          </div>
        </>
      ) : (
        <>
          <h1 className="page-heading">Orders Management</h1>
          <p className="page-subheading">
            Manage and track all customer orders
          </p>

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full mt-5">
            <StatCard
              title="Total Orders"
              icon={<ShoppingCart className="w-6 h-6" />}
              stat={totalOrders}
              description="Total number of orders placed overall."
            />

            <StatCard
              title="Pending Orders"
              icon={<Clock className="w-6 h-6" />}
              stat={pendingOrders}
              description="Orders that have been created but not yet processed."
            />

            <StatCard
              title="Cancelled Orders"
              icon={<XCircle className="w-6 h-6" />}
              stat={cancelledOrders}
              description="Orders that were cancelled by users or admins."
            />

            <StatCard
              title="Completed Orders"
              icon={<CheckCircle className="w-6 h-6" />}
              stat={completedOrders}
              description="Orders that have been successfully fulfilled."
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
        </>
      )}
    </div>
  );
}
