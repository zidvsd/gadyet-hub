"use client";

import { useState, useEffect, useMemo } from "react";
import { useProducts } from "@/store/useProducts";
import { useOrders } from "@/store/useOrders";
import { useUsers } from "@/store/useUsers";
import { ChartAreaDefault } from "@/components/charts/AreaChart";
import { ChartPieLabelList } from "@/components/charts/PieChart";
import { ChartBarActive } from "@/components/charts/BarChart";
import { ChartLineDefault } from "@/components/charts/LineChart";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  // 1. Get state from stores (AdminLayout handles the fetching)
  const { products, loading: productsLoading } = useProducts();
  const { orders, loading: ordersLoading } = useOrders();
  const { users, loading: usersLoading } = useUsers();

  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  // 2. Fetch ONLY extra metrics not covered by global stores
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoadingRevenue(true);
        const res = await fetch("/api/admin/metrics");
        const json = await res.json();
        if (res.ok && json.success) {
          setTotalRevenue(json.totalRevenue || 0);
        }
      } catch (err) {
        console.error("Metrics fetch error:", err);
      } finally {
        setLoadingRevenue(false);
      }
    };

    fetchMetrics();
    // No dependencies here because the stores are managed by the Layout
  }, []);

  const loading =
    productsLoading || ordersLoading || usersLoading || loadingRevenue;

  // 3. Memoized Chart Data
  const pieData = useMemo(() => {
    const counts = orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return ["completed", "processing", "pending", "cancelled"].map(
      (status) => ({
        status,
        count: counts[status] || 0,
        fill: `var(--color-${status})`,
      }),
    );
  }, [orders]);

  const topSellingProducts = useMemo(() => {
    if (!orders.length || !products.length) return [];
    const counts: Record<string, number> = {};

    orders
      .filter((o) => o.status === "completed")
      .forEach((order) => {
        order.order_items?.forEach((item) => {
          counts[item.product_id] =
            (counts[item.product_id] || 0) + item.quantity;
        });
      });

    return Object.entries(counts)
      .map(([productId, quantity]) => {
        const product = products.find((p) => p.id === productId);
        return {
          name: product?.name || "Unknown",
          quantity,
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders, products]);

  const userActivityData = useMemo(() => {
    if (!users?.length) return [];
    const totalUsers = users.filter((u) => u.role === "user").length;
    // Static monthly mapping for visual consistency
    return ["January", "February", "March", "April", "May"].map((month) => ({
      month,
      users: totalUsers,
    }));
  }, [users]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-5 w-2/3" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h1 className="page-heading">Analytics</h1>
          <p className="page-subheading">
            Get insights on products, orders, and user activity
          </p>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartPieLabelList data={pieData} />
            {/* Using the totalRevenue fetched from metrics API */}
            <ChartAreaDefault
              revenueData={[{ month: "Current Total", revenue: totalRevenue }]}
            />
            <ChartBarActive data={topSellingProducts} />
            <ChartLineDefault data={userActivityData} />
          </div>
        </div>
      )}
    </div>
  );
}
