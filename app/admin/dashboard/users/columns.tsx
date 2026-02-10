"use client";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/types/users";
import { formatDate } from "@/lib/utils";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export const columns: ColumnDef<User>[] = [
  {
    header: "Name",
    // accessorFn is used for sorting and filtering
    accessorFn: (row) => {
      const first = row.first_name || "";
      const last = row.last_name || "";
      const full = `${first} ${last}`.trim();
      return full || "N/A";
    },
    cell: ({ row }) => {
      const { first_name, last_name } = row.original;
      const fullName = `${first_name ?? ""} ${last_name ?? ""}`.trim();

      return (
        <span className="font-medium">
          {fullName.length > 0 ? fullName : "N/A"}
        </span>
      );
    },
  },

  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      {
        const phone = row.original.phone;
        return phone ? phone : "N/A";
      }
    },
  },

  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      return (
        <span
          className={`px-2 rounded-full text-xs font-medium ${
            row.original.role === "admin"
              ? "bg-red-600 text-white" // Admin is red
              : "bg-gray-200 text-gray-800" // User is gray
          }`}
        >
          {row.original.role}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Joined",
    cell: ({ row }) => {
      return formatDate(row.original.created_at);
    },
  },
  {
    accessorKey: "id",
    header: () => <div className="pl-2">View</div>,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button variant={"nav"} className="border">
            <Link href={`/admin/dashboard/users/${row.original.id}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];
