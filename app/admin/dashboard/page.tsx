"use client";
import { ShoppingCart, DollarSign, Package, Users } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/store/useOrders";
import { useProducts } from "@/store/useProducts";
import { useUsers } from "@/store/useUsers";
import React from "react";
export default function DashboardPage() {
  const { orders, loading: ordersLoading } = useOrders();
  const { products, loading: productsLoading } = useProducts();
  const { users, loading: usersLoading } = useUsers();

  const loading = ordersLoading || productsLoading || usersLoading;

  const stats = React.useMemo(
    () => ({
      totalProducts: products.length,
      totalOrders: orders.length,
      totalUsers: users?.length ?? 0,
      pending: orders.filter((o) => o.status === "pending").length,
    }),
    [products, orders, users],
  );
  const totalLowStocks = products.filter(
    (product) => product.stock <= 5,
  ).length;

  return (
    <div>
      {/* 1. Static Header: Renders instantly, stopping the LCP timer early */}
      <h1 className="page-heading">Dashboard</h1>
      <p className="page-subheading">Welcome to your admin dashboard</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full mt-5">
        {loading ? (
          <>
            <Skeleton className="rounded h-32 w-full" />
            <Skeleton className="rounded h-32 w-full" />
            <Skeleton className="rounded h-32 w-full" />
            <Skeleton className="rounded h-32 w-full" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Products"
              icon={<Package className="size-6" />}
              stat={stats.totalProducts}
              description="All products currently available in the store"
            />
            <StatCard
              title="Total Orders"
              icon={<ShoppingCart className="size-6" />}
              stat={stats.totalOrders}
              description="All orders placed by customers so far"
            />
            <StatCard
              title="Pending Orders"
              icon={<DollarSign className="size-6" />}
              stat={stats.pending}
              description="Orders that are awaiting processing"
            />
            <StatCard
              title="Total Users"
              icon={<Users className="size-6" />}
              stat={stats.totalUsers}
              description="All users registered"
            />
          </>
        )}
      </div>
    </div>
  );
}
