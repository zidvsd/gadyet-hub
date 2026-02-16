"use client";

import { useState, useEffect } from "react";
import { Package, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useOrders } from "@/store/useOrders";
import { useNotifications } from "@/store/useNotifications";
import dynamic from "next/dynamic";
const NotificationsTab = dynamic(
  () => import("@/components/client/account/notifications/NotificationsTab"),
);

const OrdersTab = dynamic(
  () => import("@/components/client/account/orders/OrdersTab"),
);
const ProfileTab = dynamic(
  () => import("@/components/client/account/profile/ProfileTab"),
);
export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { orders } = useOrders();
  const { notifications } = useNotifications();
  const unreadNotifs = notifications.filter((n) => !n.is_read);
  const [currentTab, setCurrentTab] = useState(
    searchParams.get("tab") || "profile",
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setCurrentTab(tab);
  }, [searchParams]);

  const handleTabChange = (tabName: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tabName);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="custom-container my-8">
      <header>
        <h1 className="text-3xl font-bold">My Account</h1>
        <p className="text-muted-foreground">
          Manage your orders, notifications, and profile
        </p>
      </header>

      {/* Tab Selection */}
      <nav className="flex items-center justify-around gap-2 bg-sidebar-accent dark:bg-muted w-full sm:w-fit p-2 rounded-md mt-4">
        <Button
          onClick={() => handleTabChange("orders")}
          variant={currentTab === "orders" ? "accent" : "ghost"}
          className="flex-1 flex items-center gap-2"
        >
          <Package className="size-4" />
          <span>Orders</span>
          {orders.length > 0 && (
            <span className="ml-1 shadow-sm flex h-5 min-w-5 items-center justify-center rounded-full text-white bg-destructive px-1 text-[10px] font-bold">
              {orders.length}
            </span>
          )}
        </Button>

        <Button
          onClick={() => handleTabChange("notifications")}
          variant={currentTab === "notifications" ? "accent" : "ghost"}
          className="flex-1 flex items-center gap-2"
        >
          <Bell className="size-4" />
          <span className="hidden sm:block">Notifications</span>
          <span className="sm:hidden">Alerts</span>
          {unreadNotifs.length > 0 && (
            <span className="ml-1 shadow-sm flex h-5 min-w-5 items-center justify-center rounded-full text-white bg-destructive px-1 text-[10px] font-bold">
              {unreadNotifs.length}
            </span>
          )}
        </Button>

        <Button
          onClick={() => handleTabChange("profile")}
          variant={currentTab === "profile" ? "accent" : "ghost"}
          className="flex-1 flex items-center gap-2"
        >
          <User className="size-4" />
          <span>Profile</span>
        </Button>
      </nav>

      <main className="mt-4">
        {/* Only the active tab's JS is executed/rendered */}
        {currentTab === "orders" && <OrdersTab />}
        {currentTab === "profile" && <ProfileTab />}
        {currentTab === "notifications" && <NotificationsTab />}
      </main>
    </div>
  );
}
