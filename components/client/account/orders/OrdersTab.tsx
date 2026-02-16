"use client";

import { useEffect, useState, useMemo } from "react";
import { useOrders } from "@/store/useOrders";
import OrdersCard from "./OrdersCard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/Empty";
import { useInView } from "react-intersection-observer";
import OrdersSkeleton from "../../skeleton/OrdersSkeleton";
import { AnimatePresence, m } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Filter, ChevronDown } from "lucide-react";

export default function OrdersTab() {
  const { orders, fetchOrders, loading } = useOrders();
  const { ref, inView } = useInView();

  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [visibleCount, setVisibleCount] = useState(5);

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (orders.length === 0) fetchOrders();
  }, [fetchOrders, orders.length]);

  // 1. Logic for filtering and sorting
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];
    if (statusFilter !== "all") {
      result = result.filter(
        (order) => order.status.toLowerCase() === statusFilter.toLowerCase(),
      );
    }
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [orders, statusFilter, sortOrder]);

  const displayOrders = filteredAndSortedOrders.slice(0, visibleCount);

  // 2. Infinite scroll trigger
  useEffect(() => {
    if (inView && visibleCount < filteredAndSortedOrders.length) {
      setTimeout(() => setVisibleCount((prev) => prev + 5), 500);
    }
  }, [inView, filteredAndSortedOrders.length]);

  // Reset count on filter change
  useEffect(() => {
    setVisibleCount(5);
  }, [statusFilter, sortOrder]);

  if (loading && orders.length === 0) return <OrdersSkeleton />;

  return (
    <div className="space-y-4">
      {/* 3. Toolbar (Fixed & Responsive) */}
      <div className="flex flex-col gap-3 px-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "secondary" : "outline"}
              size="sm"
              className="h-8 gap-2 transition-all"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter
                className={cn("size-3.5", showFilters && "fill-current")}
              />
              <span className="text-xs font-medium">Filters</span>
              <ChevronDown
                className={cn(
                  "size-3 transition-transform duration-300",
                  showFilters && "rotate-180",
                )}
              />
            </Button>

            {/* Show active filter badge if hidden */}
            {!showFilters && statusFilter !== "all" && (
              <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-in fade-in zoom-in">
                {statusFilter}
              </span>
            )}
          </div>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="h-8 w-[130px] text-xs bg-transparent">
              <ArrowUpDown className="mr-2 size-3 opacity-50" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 2. Expandable Filter Status Row */}
        <AnimatePresence>
          {showFilters && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pb-1">
                {["all", "pending", "processing", "completed", "cancelled"].map(
                  (status) => (
                    <Button
                      key={status}
                      variant="ghost"
                      size="sm"
                      className={`capitalize h-8 text-xs ${
                        statusFilter === status
                          ? "bg-muted font-bold text-foreground"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setStatusFilter(status)}
                    >
                      {status}
                    </Button>
                  ),
                )}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
      {/* 4. Carousel Content (Following Notification Pattern) */}
      <Carousel
        opts={{ align: "start", dragFree: true }}
        orientation="vertical"
        className="w-full basis-auto select-none"
      >
        <CarouselContent className="-mt-1 h-[600px] scrollbar-hide px-1">
          <AnimatePresence mode="popLayout">
            {displayOrders.length > 0 ? (
              displayOrders.map((order) => (
                <CarouselItem
                  key={order.id}
                  className="pt-2 basis-auto min-h-0"
                >
                  <m.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <OrdersCard order={order} />
                  </m.div>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem className="h-full flex items-center justify-center">
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full"
                >
                  <EmptyState
                    title="No orders found"
                    description={`No ${statusFilter === "all" ? "" : statusFilter} orders to show.`}
                  />
                </m.div>
              </CarouselItem>
            )}
          </AnimatePresence>

          {visibleCount < filteredAndSortedOrders.length && (
            <CarouselItem className="pt-4 basis-auto">
              <div ref={ref} className="flex justify-center py-4">
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
