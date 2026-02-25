"use client";

import React, { useEffect, useMemo } from "react";
import { useUsers } from "@/store/useUsers";
import { StatCard } from "@/components/ui/stat-card";
import { ShieldUser, UserRound, UserSquare2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function UsersPage() {
  const { users, loading, fetchUsers } = useUsers();

  useEffect(() => {
    // Force true ensures we refill the store if we were just looking at 1 user
    fetchUsers("admin", true);
  }, [fetchUsers]);

  // Memoize counts to keep the UI snappy
  const stats = useMemo(() => {
    const list = users ?? [];
    return {
      total: list.length,
      admins: list.filter((u) => u.role === "admin").length,
      customers: list.filter((u) => u.role === "user").length,
    };
  }, [users]);

  if (loading) return <UsersSkeleton />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-heading">Users</h1>
        <p className="page-subheading">
          View and manage registered users and their account types
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        <StatCard
          title="Total Users"
          icon={<UserSquare2 className="size-6 text-primary" />}
          stat={stats.total}
          description="Total number of registered users in the system"
        />
        <StatCard
          title="Admin"
          icon={<ShieldUser className="size-6 text-blue-500" />}
          stat={stats.admins}
          description="Users with administrative privileges"
        />
        <StatCard
          title="Customers"
          icon={<UserRound className="size-6 text-green-500" />}
          stat={stats.customers}
          description="Regular users who can place orders"
        />
      </div>

      {/* Users List */}
      <div className="mt-8">
        <DataTable data={users ?? []} columns={columns} />
      </div>
    </div>
  );
}

function UsersSkeleton() {
  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full " />
        ))}
      </div>

      {/* Table */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full " />
        <Skeleton className="h-[400px] w-full  animate-pulse" />
      </div>
    </div>
  );
}
