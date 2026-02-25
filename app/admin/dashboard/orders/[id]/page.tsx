"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Package, MapPin } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { useOrders } from "@/store/useOrders";
import { useUsers } from "@/store/useUsers";
import { useProducts } from "@/store/useProducts";
import { truncateId, formatDate, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { orderStatusClasses } from "@/lib/styles/badgeClasses";
import Link from "next/link";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { orders, loading: ordersLoading, fetchOrderById } = useOrders();
  const { users, loading: usersLoading, fetchUsers } = useUsers();
  const { products, loading: productsLoading, fetchProducts } = useProducts();

  const loading = ordersLoading || usersLoading || productsLoading;

  const cardStyle =
    "group relative bg-card p-4 overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.5 border-2 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-xl";

  useEffect(() => {
    fetchOrderById(orderId, "admin");
    fetchUsers("admin");
    fetchProducts();
  }, [fetchOrderById, fetchUsers, fetchProducts]);

  const order = useMemo(
    () => orders.find((o) => o.id === orderId),
    [orders, orderId],
  );

  const user = useMemo(
    () => users?.find((u) => u.id === order?.user_id),
    [users, order],
  );

  const orderItems = useMemo(() => {
    if (!order) return [];
    return order.order_items.map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      return {
        ...item,
        productName: product?.name ?? "Unknown product",
        image_path: product?.image_path ?? null,
      };
    });
  }, [order, products]);

  if (!orderId) return null;

  return (
    <div className="order-info w-full">
      {/* Heading */}
      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="page-heading">Order Details</h1>
            <p className="page-subheading">Order {truncateId(orderId)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* Order Info */}
        <div className={`md:col-span-1 ${cardStyle}`}>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Package />
                <h1 className="font-semibold text-xl">Order Information</h1>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Status</span>
                  <h2
                    className={
                      orderStatusClasses[order!?.status] ??
                      "px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium"
                    }
                  >
                    {order!?.status.charAt(0).toUpperCase() +
                      order!?.status.slice(1)}
                  </h2>
                </div>
                <div className="flex justify-between">
                  <span>Date</span>
                  <h2>{formatDate(order!?.created_at)}</h2>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount</span>
                  <h2 className="text-accent">
                    {formatPrice(order!?.total_price)}
                  </h2>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Customer Info */}
        <div className={`md:col-span-1 ${cardStyle}`}>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            user && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <User />
                  <h1 className="font-semibold text-xl">
                    Customer Information
                  </h1>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Name</span>
                    <Link href={`/admin/dashboard/users/${user.id}`}>
                      <h2 className="hover-utility hover:text-accent">
                        {`${user.first_name} ${user.last_name}`}
                      </h2>
                    </Link>
                  </div>
                  {user.phone && (
                    <div className="flex justify-between">
                      <span>Phone</span>
                      <h2>{user.phone}</h2>
                    </div>
                  )}
                </div>
              </>
            )
          )}
        </div>

        {/* Address */}
        <div className={`md:col-span-2 ${cardStyle}`}>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            user && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin />
                  <h1 className="font-semibold text-xl">Shipping Address</h1>
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {(user.address ?? "").split(",").map((part, idx) => (
                    <span key={idx}>{part.trim()}</span>
                  ))}
                </div>
              </>
            )
          )}
        </div>

        {/* Order Items */}
        <div className="md:col-span-2">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              <h1 className="font-semibold mb-4 text-xl">Order Items</h1>
              <DataTable columns={columns} data={orderItems} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
