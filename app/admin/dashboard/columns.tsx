"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Copy, Eye, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice, truncateId } from "@/lib/utils";
import { Order } from "@/lib/types/orders";
import { orderStatusClasses } from "@/lib/styles/badgeClasses";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Define allowed statuses
export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

// Table meta for status change callback
type OrderTableMeta = {
  onStatusChange: (id: string, newStatus: OrderStatus) => void;
};

export const recentOrders: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Copy ID",
    cell: ({ row }) => {
      const id = row.original.id;
      const handleCopy = async () => {
        await navigator.clipboard.writeText(id);
        toast.success("Order ID copied");
      };

      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{truncateId(id)}</span>
          <Button
            variant="nav"
            onClick={handleCopy}
            className="border dark:border-none"
            aria-label="Copy order ID"
          >
            <Copy className="h-4 w-4 opacity-70 hover:opacity-100" />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status as OrderStatus;
      const statusClass = orderStatusClasses[status] ?? "";
      return (
        <span className={`capitalize ${statusClass}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: "total_price",
    header: "Total",
    cell: ({ row }) => formatPrice(row.original.total_price),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.created_at),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row, table }) => {
      // FIX: Variables must be defined inside the cell function scope
      const orderId = row.original.id;
      const currentStatus = row.original.status as OrderStatus;
      const meta = table.options.meta as OrderTableMeta | undefined;

      const statusOptions: OrderStatus[] = [
        "pending",
        "processing",
        "completed",
        "cancelled",
      ];

      return (
        <div className="flex items-center justify-center gap-2">
          {/* View Order Details */}
          <Link href={`/admin/dashboard/orders/${orderId}`}>
            <Button variant="nav" size="icon" className="border">
              <Eye className="size-4" />
            </Button>
          </Link>

          {/* Quick Status Update */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="nav"
                className="border w-32 justify-between flex"
              >
                <span className="truncate">
                  {currentStatus.charAt(0).toUpperCase() +
                    currentStatus.slice(1)}
                </span>
                <ChevronDown className="size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <span className="block px-2 py-1 text-xs text-muted-foreground uppercase font-semibold">
                Update Status
              </span>
              <DropdownMenuSeparator />
              {statusOptions.map((status) => (
                <DropdownMenuItem
                  key={status}
                  disabled={status === currentStatus}
                  onClick={() => meta?.onStatusChange(orderId, status)}
                >
                  <span className="flex items-center gap-2">
                    {status === currentStatus && (
                      <span className="text-accent">✓</span>
                    )}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
