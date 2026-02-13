"use client";
import { orderStatusClasses } from "@/lib/styles/badgeClasses";
import { CheckCircle2, CircleX, Clock, Package } from "lucide-react";

// Assuming this is in a styles file, otherwise define it here
const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-card",
    msg: "We've received your order and are awaiting processing.",
  },
  processing: {
    icon: Package,
    color: "text-blue-600",
    bg: "bg-card",
    msg: "We are currently preparing your items for shipment.",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-card",
    msg: "This order has been delivered successfully.",
  },
  cancelled: {
    icon: CircleX,
    color: "text-red-600",
    bg: "bg-card",
    msg: "This order has been cancelled and will not be fulfilled.",
  },
};

interface OrderStatusBadgeProps {
  status: string;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const config =
    statusConfig[normalizedStatus as keyof typeof statusConfig] ||
    statusConfig.pending;
  const badgeClass =
    orderStatusClasses[normalizedStatus] || orderStatusClasses.pending;
  const Icon = config.icon;

  return (
    <div
      className={`border w-full rounded-xl p-6 flex items-start gap-4 transition-all duration-300 ${config.bg}`}
    >
      {/* Dynamic Icon */}

      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-start gap-3 ">
          <Icon className={`shrink-0 ${config.color}`} size={24} />

          <span className="font-bold text-foreground">Order Status</span>

          {/* Your specific badge class */}
          <span className={`${badgeClass} ml-auto`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {config.msg}
        </p>
      </div>
    </div>
  );
}
