"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "@/store/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { AnimatePresence, m } from "motion/react";
import NotificationsCard from "./NotificationsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/Empty";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";
import { useInView } from "react-intersection-observer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import NotificationsSkeleton from "../../skeleton/NotificationsSkeleton";

export default function NotificationsTab() {
  const { user: currentUser, role } = useAuth(); // Added role
  const [notifTab, setNotifTab] = useState("All");
  const [visibleCount, setVisibleCount] = useState(5);
  const { ref, inView } = useInView();

  const { notifications, fetchNotifications, loading, markAllAsRead } =
    useNotifications();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (notifTab === "Unread") return !n.is_read;
    return true;
  });

  const displayNotifications = filteredNotifications.slice(0, visibleCount);

  useEffect(() => {
    if (currentUser?.id) {
      // Logic: Admin fetches "all", Users fetch their specific ID
      const targetId = role === "admin" ? "all" : currentUser.id;
      fetchNotifications(targetId);
    }
  }, [currentUser?.id, role, fetchNotifications]);

  // Handle Mark All Read based on role
  const handleMarkAllRead = () => {
    if (!currentUser?.id) return;
    const targetId = role === "admin" ? "all" : currentUser.id;
    markAllAsRead(targetId);
  };

  // Infinite scroll
  useEffect(() => {
    if (inView && visibleCount < filteredNotifications.length) {
      setTimeout(() => setVisibleCount((prev) => prev + 5), 500);
    }
  }, [inView, filteredNotifications.length]);

  if (loading && notifications.length === 0) {
    return <NotificationsSkeleton />;
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        description="We'll let you know when something happens!"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
        <div className="flex gap-2">
          <Button
            variant={"ghost"}
            className={notifTab === "All" ? "bg-muted font-semibold" : ""}
            onClick={() => {
              setNotifTab("All");
              setVisibleCount(5); // Reset count on tab change
            }}
          >
            All
          </Button>

          <Button
            variant={"ghost"}
            className={notifTab === "Unread" ? "bg-muted font-semibold" : ""}
            onClick={() => {
              setNotifTab("Unread");
              setVisibleCount(5); // Reset count on tab change
            }}
          >
            Unread
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <h2 className="text-xs sm:text-sm font-medium text-muted-foreground">
            {unreadCount} unread
          </h2>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-2 border-accent/20 hover:bg-accent/5"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="size-4 text-accent" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <Carousel
        opts={{ align: "start", dragFree: true, axis: "y", watchDrag: true }}
        orientation="vertical"
        className="w-full "
      >
        <CarouselContent className="-mt-1 h-[550px] scrollbar-hide touch-none select-none">
          <AnimatePresence mode="popLayout">
            {displayNotifications.length > 0 ? (
              displayNotifications.map((notification) => (
                <CarouselItem
                  key={notification.id}
                  className="pt-2 basis-auto min-h-0"
                >
                  <m.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <NotificationsCard notification={notification} />
                  </m.div>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem className="h-full flex items-center justify-center">
                <m.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full"
                >
                  <EmptyState
                    title={
                      notifTab === "Unread"
                        ? "All caught up!"
                        : "No notifications"
                    }
                    description={
                      notifTab === "Unread"
                        ? "You have no unread messages at the moment."
                        : "We'll let you know when something happens!"
                    }
                  />
                </m.div>
              </CarouselItem>
            )}
          </AnimatePresence>

          {visibleCount < filteredNotifications.length && (
            <CarouselItem className="pt-2 basis-auto">
              <div
                ref={ref}
                className="flex items-center gap-4 rounded-xl border p-4 opacity-50"
              >
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
