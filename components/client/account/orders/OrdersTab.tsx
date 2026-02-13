"use client";

import { useEffect } from "react";
import { useOrders } from "@/store/useOrders";
import OrdersCard from "./OrdersCard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/Empty";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/StaggerContainer";

export default function OrdersTab() {
  const { orders, fetchOrders, loading } = useOrders();

  useEffect(() => {
    if (orders.length === 0) {
      fetchOrders();
    }
  }, [fetchOrders, orders.length]);

  if (loading) {
    return <OrdersSkeleton />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders found"
        description="Try buying some gadgets!"
      />
    );
  }

  return (
    <StaggerContainer inView={false} className="flex flex-col gap-4">
      {orders.map((order) => (
        <StaggerItem key={order.id}>
          <OrdersCard order={order} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

// 3. Extracted Skeleton for cleaner code
function OrdersSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 rounded-xl border bg-transparent dark:bg-muted/70 p-6"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-xl" />
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
