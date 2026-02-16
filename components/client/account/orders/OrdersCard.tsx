"use client";

import { ShoppingBag, ChevronRight, Calendar, Clock } from "lucide-react";
import { Order } from "@/lib/types/orders";
import Link from "next/link";
import { orderStatusClasses } from "@/lib/styles/badgeClasses";
import {
  upperCaseFirstLetter,
  truncateId,
  formatPrice,
  formatDate,
  formatRelativeTime,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

interface OrdersCardProps {
  order: Order;
}

export default function OrdersCard({ order }: OrdersCardProps) {
  const statusStyle =
    orderStatusClasses[order.status.toLowerCase()] ||
    "bg-gray-100 text-gray-800";

  return (
    <div className="group relative flex items-start gap-4 rounded-2xl border p-4 transition-all hover:bg-muted/40 bg-background overflow-hidden">
      {/* Icon */}
      <div className="shrink-0 p-3 rounded-full bg-accent/10 text-accent mt-1">
        <ShoppingBag className="size-5" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        {/* Top Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground">
              Order #{truncateId(order.id)}
            </h3>

            <div className="flex flex-col md:flex-row gap-0 md:gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 opacity-50" />
                <span>{formatDate(order.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-3.5 opacity-50" />
                <span>{formatRelativeTime(order.created_at)}</span>
              </div>
            </div>
          </div>

          <span className="text-xl font-bold text-accent whitespace-nowrap">
            ₱{formatPrice(order.total_price)}
          </span>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium capitalize",
              statusStyle,
            )}
          >
            {order.status}
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground/30 transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
        </div>
      </div>

      <Link href={`/orders/${order.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View order {order.id}</span>
      </Link>
    </div>
  );
}
