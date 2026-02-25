"use client";

import { useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUsers } from "@/store/useUsers";
import { useOrders } from "@/store/useOrders";
import { useProducts } from "@/store/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { orderColumns } from "./columns";
import { StatCard } from "@/components/ui/stat-card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  User,
  ShoppingCart,
  DollarSign,
  Clock,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const toastShownRef = useRef(false);
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    users,
    fetchUserById,
    loading: usersLoading,
    clearUsers,
  } = useUsers();
  const { userOrders, fetchOrders, loading: ordersLoading } = useOrders();
  const { fetchProducts, loading: productsLoading } = useProducts();

  const isLoading = usersLoading || ordersLoading || productsLoading;

  // Get the user by ID from users array
  const user = useMemo(
    () => users?.find((u) => u.id === userId),
    [users, userId],
  );
  // Redirect admin users after user is loaded
  useEffect(() => {
    if (!usersLoading && user?.role === "admin" && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.error(
        "Admins do not have purchase history. Redirecting to users page.",
      );
      router.push("/admin/dashboard/users");
    }
  }, [user, usersLoading, router]);

  // Fetch data
  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      // Only fetch if we don't have this specific user already
      if (!user) {
        await fetchUserById(userId, "admin");
      }

      await Promise.all([
        fetchProducts(),
        fetchOrders("admin", userId, true), // Ensure your store uses this userId to filter!
      ]);
    };

    loadData();
  }, [userId, fetchUserById, fetchOrders, fetchProducts, user]);

  // Compute stats
  const stats = useMemo(() => {
    const totalOrders = userOrders.length;
    const totalSpent = userOrders
      .filter((o) => o.status === "completed")
      .reduce((acc, order) => acc + order.total_price, 0);

    const pendingOrders = userOrders.filter(
      (o) => o.status === "pending",
    ).length;
    const completedOrders = userOrders.filter(
      (o) => o.status === "completed",
    ).length;

    return [
      {
        title: "Total Orders",
        value: totalOrders,
        description: "All orders made by this user",
        icon: <ShoppingCart className="w-6 h-6" />,
      },
      {
        title: "Total Spent",
        value: `₱${formatPrice(totalSpent)}`,
        description: "Total amount spent",
        icon: <DollarSign className="w-6 h-6" />,
      },
      {
        title: "Pending Orders",
        value: pendingOrders,
        description: "Orders not yet completed",
        icon: <Clock className="w-6 h-6" />,
      },
      {
        title: "Completed Orders",
        value: completedOrders,
        description: "Orders successfully completed",
        icon: <CheckCircle className="w-6 h-6" />,
      },
    ];
  }, [userOrders]);

  // Skeletons while loading
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Heading Skeleton */}
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-5 w-2/3" />

        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>

        {/* DataTable Skeleton */}
        <Skeleton className="w-full h-80 rounded-md animate-pulse mt-4" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Header */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          {/* Back Button - Aligned to the top of the icon/text */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="-ml-2"
          >
            <ArrowLeft className="size-5" />
          </Button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <User className="size-7 text-muted-foreground" />
              <h1 className="page-heading">
                {user?.first_name
                  ? `${user.first_name} ${user.last_name}`
                  : "Unnamed Customer"}
              </h1>
            </div>

            <p className="page-subheading ">
              Displaying purchase history of{" "}
              <span className="font-mono text-xs">{user?.id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard
            key={s.title}
            title={s.title}
            stat={s.value}
            description={s.description}
            icon={s.icon}
          />
        ))}
      </div>

      {/* Orders Table */}
      <div>
        <DataTable columns={orderColumns} data={userOrders} />
      </div>
    </div>
  );
}
