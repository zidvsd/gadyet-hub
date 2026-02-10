"use client";
import { useUsers } from "@/store/useUsers";
import { useEffect } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { ShieldUser, UserRound, UserSquare2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "./data-table";
import { columns } from "./columns";
export default function page() {
  const { users, loading: userLoading } = useUsers();

  const totalUser = users?.length ?? 0;
  const totalAdmins =
    users?.filter((user) => user.role === "admin").length ?? 0;
  const totalCustomers =
    users?.filter((user) => user.role === "user").length ?? 0;

  const loading = userLoading;

  return (
    <div>
      {loading ? (
        <>
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-5 w-2/3 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full mt-8">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </>
      ) : (
        <>
          <h1 className="page-heading">Users</h1>
          <p className="page-subheading">
            View and manage registered users Total Users
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full mt-8">
            <StatCard
              title="Total Users"
              icon={<UserSquare2 className="size-6" />}
              stat={totalUser}
              description="Total number of registered users in the system"
            />
            <StatCard
              title="Admin"
              icon={<ShieldUser className="size-6" />}
              stat={totalAdmins}
              description="Users with administrative privileges who manage the system"
            />
            <StatCard
              title="Customers"
              icon={<UserRound className="size-6" />}
              stat={totalCustomers}
              description="Regular users who can place orders and interact with your platform"
            />
          </div>
        </>
      )}

      {/* Users List */}
      <div className="mt-8">
        {loading ? (
          <Skeleton className=" w-full h-42 rounded-md animate-pulse" />
        ) : (
          <DataTable data={users ?? []} columns={columns} />
        )}
      </div>
    </div>
  );
}
