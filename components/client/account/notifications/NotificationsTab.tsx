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

export default function NotificationsTab() {
  const { user: currentUser } = useAuth();
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
      fetchNotifications(currentUser.id);
    }
  }, [currentUser?.id, fetchNotifications]);

  // infinite scroll
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
      <div className="flex items-center justify-between px-1">
        <div className="flex gap-2">
          <Button
            variant={"ghost"}
            className={notifTab === "All" ? "bg-muted font-semibold" : ""}
            onClick={() => setNotifTab("All")}
          >
            All
          </Button>

          <Button
            variant={"ghost"}
            className={notifTab === "Unread" ? "bg-muted font-semibold" : ""}
            onClick={() => setNotifTab("Unread")}
          >
            Unread
          </Button>
        </div>
        <h2 className="text-sm font-medium text-muted-foreground">
          You have {unreadCount} unread messages
        </h2>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-2"
            onClick={() => currentUser?.id && markAllAsRead(currentUser.id)}
          >
            <CheckCheck className="size-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        orientation="vertical"
        className="w-full basis-auto select-none"
      >
        <CarouselContent className="-mt-1 h-[500px] scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {displayNotifications.length > 0 ? (
              displayNotifications.map((notification) => (
                <CarouselItem
                  key={notification.id}
                  className="pt-2 basis-auto min-h-0"
                >
                  <m.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <NotificationsCard notification={notification} />
                  </m.div>
                </CarouselItem>
              ))
            ) : (
              /* Empty state for the Unread tab */
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

          {/* Sentinel for infinite loading */}
          {visibleCount < filteredNotifications.length && (
            <CarouselItem className="pt-1 basis-auto">
              <div ref={ref} className="py-4">
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500">
      <div className="flex justify-between mb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border p-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
