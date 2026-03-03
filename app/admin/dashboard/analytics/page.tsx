"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useProducts } from "@/store/useProducts";
import { useOrders } from "@/store/useOrders";
import { useUsers } from "@/store/useUsers";

// UI Components
import { ChartAreaDefault } from "@/components/charts/AreaChart";
import { ChartPieLabelList } from "@/components/charts/PieChart";
import { ChartBarActive } from "@/components/charts/BarChart";
import { ChartLineDefault } from "@/components/charts/LineChart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnalyticsSkeleton from "@/components/client/skeleton/AnalyticsSkeleton";
import { Download, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// Analytics Utilities
import {
  getFilteredOrders,
  getPieData,
  getTopSellingProducts,
  getRevenueChartData,
  getUserActivityData,
} from "@/lib/utils/admin/analytics-utils";

export default function Page() {
  const { fetchProducts, loading: productsLoading } = useProducts();
  const { orders, fetchOrders, loading: ordersLoading } = useOrders();
  const { users, fetchUsers, loading: usersLoading } = useUsers();

  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState("Last 7 Days");

  // 1. Unified Refresh Logic
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchOrders("admin"),
        fetchUsers("admin"),
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
    } finally {
      setIsRefreshing(false);
      setHasInitiallyLoaded(true);
    }
  }, [fetchProducts, fetchOrders, fetchUsers]);

  useEffect(() => {
    setMounted(true);
    handleRefresh();
  }, [handleRefresh]);

  // 2. Computed Analytics (Using the Utils)
  // We use useMemo to prevent re-calculating unless the data or range changes
  const filteredOrders = useMemo(
    () => getFilteredOrders(orders, range),
    [orders, range],
  );

  const pieData = useMemo(() => getPieData(filteredOrders), [filteredOrders]);

  const topSellingProducts = useMemo(
    () => getTopSellingProducts(filteredOrders),
    [filteredOrders],
  );

  const revenueChartData = useMemo(
    () => getRevenueChartData(filteredOrders, range),
    [filteredOrders, range],
  );

  const userActivityData = useMemo(
    () => getUserActivityData(users, range),
    [users, range],
  );

  // Loading State
  const showInitialSkeleton =
    (productsLoading || ordersLoading || usersLoading) && !hasInitiallyLoaded;
  if (showInitialSkeleton) return <AnalyticsSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div>
        <h1 className="page-heading">Analytics</h1>
        <p className="page-subheading">
          Get insights on products, orders, and user activity
        </p>

        <Card className="flex flex-col w-full mb-6 p-4 mt-2 gap-3 shadow-none">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {["Last 7 Days", "Last Month", "All Time"].map((time) => (
                  <Button
                    key={time}
                    variant={range === time ? "accent" : "secondary"}
                    size="sm"
                    onClick={() => setRange(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
            <Button variant="outline" size="sm" className="lg:ml-auto">
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 w-2">
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75",
                    (isRefreshing || hasInitiallyLoaded) && "animate-ping",
                  )}
                ></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <span className="uppercase tracking-wider">
                {isRefreshing ? "Updating Dashboard..." : "Syncing Live Data"}
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                className="text-accent group h-8 gap-2"
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-500",
                    isRefreshing ? "animate-spin" : "group-hover:rotate-180",
                  )}
                />
                {isRefreshing ? "Refreshing" : "Refresh"}
              </Button>
              <span className="opacity-80 hidden sm:inline">
                Last updated:{" "}
                {mounted && lastUpdated
                  ? lastUpdated.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Loading..."}
              </span>
            </div>
          </div>
        </Card>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartPieLabelList data={pieData} />
          <ChartAreaDefault revenueData={revenueChartData} />
          <ChartBarActive data={topSellingProducts} />
          <ChartLineDefault data={userActivityData} />
        </div>
      </div>
    </div>
  );
}
