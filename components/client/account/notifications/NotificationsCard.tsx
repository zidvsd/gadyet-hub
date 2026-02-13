"use client";

import { Bell, Info, Package, Tag, CheckCircle2 } from "lucide-react";
import { Notification } from "@/lib/types/notifications";
import { formatRelativeTime } from "@/lib/utils";
import { useNotifications } from "@/store/useNotifications";
import { cn } from "@/lib/utils";

interface NotificationsCardProps {
  notification: Notification;
}

export default function NotificationsCard({
  notification,
}: NotificationsCardProps) {
  const { markAsRead } = useNotifications();

  // Dynamic icon based on title content
  const getIcon = () => {
    const title = notification.title.toLowerCase();
    if (title.includes("order") || title.includes("package"))
      return <Package className="size-5" />;
    if (title.includes("promo") || title.includes("sale"))
      return <Tag className="size-5" />;
    if (title.includes("welcome") || title.includes("success"))
      return <CheckCircle2 className="size-5" />;
    return <Bell className="size-5" />;
  };

  return (
    <div
      onClick={() => !notification.is_read && markAsRead(notification.id)}
      className={cn(
        "group relative flex items-start gap-4 rounded-xl border p-4 transition-all cursor-pointer hover:bg-muted/50",
        !notification.is_read
          ? "bg-accent/5 border-accent/20 dark:bg-accent/10"
          : "bg-transparent opacity-80",
      )}
    >
      {/* Unread Indicator Dot */}
      {!notification.is_read && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_var(--accent)]" />
      )}

      {/* Icon Section */}
      <div
        className={cn(
          "shrink-0 p-2.5 rounded-full",
          !notification.is_read
            ? "bg-accent text-white"
            : "bg-muted text-muted-foreground",
        )}
      >
        {getIcon()}
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={cn(
              "text-sm font-semibold leading-none",
              !notification.is_read
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            {notification.title}
          </h3>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {formatRelativeTime(notification.created_at)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
      </div>
    </div>
  );
}
