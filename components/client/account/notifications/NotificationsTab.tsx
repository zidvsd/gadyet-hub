"use client";

import { useEffect } from "react";
import { useNotifications } from "@/store/useNotifications";
import { useAuth } from "@/hooks/useAuth";

import NotificationsCard from "./NotificationsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/Empty";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/StaggerContainer";

export default function NotificationsTab() {
  const { user: currentUser } = useAuth();
  const { notifications, fetchNotifications, loading, markAllAsRead } =
    useNotifications();

  useEffect(() => {
    if (currentUser?.id) {
      fetchNotifications(currentUser.id);
    }
  }, [currentUser?.id, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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

      <StaggerContainer inView={false} className="flex flex-col gap-3">
        {notifications.map((notification) => (
          <StaggerItem key={notification.id}>
            <NotificationsCard notification={notification} />
          </StaggerItem>
        ))}
      </StaggerContainer>
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
