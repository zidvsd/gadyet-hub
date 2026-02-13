"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Phone,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Mail,
  MapPin,
  Copy,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { EditProfileForm } from "../../forms/EditProfileForm";
import { ProfileSkeleton } from "../../skeleton/ProfileSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Utils & Types
import {
  cn,
  getFirstChar,
  formatPrice,
  formatDateFull,
  truncateId,
} from "@/lib/utils";
import type { User } from "@/lib/types/users";
import type { Order } from "@/lib/types/orders";

interface ProfileTabProps {
  user: User | null;
  orders: Order[];
  isLoading: boolean;
}

export default function ProfileTab({
  user,
  orders,
  isLoading,
}: ProfileTabProps) {
  const [toggleTruncate, setToggleTruncate] = useState(true);
  console.log(user?.avatar_url);
  // 1. Memoized Calculations
  const stats = useMemo(() => {
    const completed = orders.filter((o) => o.status === "completed");
    const spent = completed.reduce((acc, o) => acc + o.total_price, 0);
    return {
      totalCount: orders.length,
      completedCount: completed.length,
      totalSpent: spent,
    };
  }, [orders]);

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      toast.success("Copied ID to clipboard!");
    }
  };

  if (isLoading) return <ProfileSkeleton />;
  if (!user)
    return (
      <div className="p-8 text-center text-muted-foreground">
        User not found.
      </div>
    );

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden border-none shadow-sm  backdrop-blur">
        <CardContent className="flex flex-col md:flex-row items-start gap-6 p-6">
          {/* Avatar Section */}
          <div className="relative w-28 h-28 shrink-0 mx-auto md:mx-0">
            <div className="relative w-full h-full rounded-full border-4 border-accent/10 bg-muted overflow-hidden flex items-center justify-center">
              {user.avatar_url ? (
                <Image
                  unoptimized
                  src={user.avatar_url}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <Avatar className="w-full h-full rounded-full">
                  <AvatarImage
                    className="grayscale"
                    src="https://github.com/shadcn.png"
                    alt="morty"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>

          {/* User Primary Info */}
          <div className="flex flex-col justify-between flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight">
                {user.first_name} {user.last_name}
              </CardTitle>

              <div className="flex flex-col items-start justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Mail className="size-4" /> {user.email}
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="size-4" /> {user.phone || "No phone"}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4" /> {user.address || "No address"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4" /> Joined{" "}
                  {formatDateFull(user.created_at)}
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-start">
              <EditProfileForm user={user} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Orders"
          icon={<ShoppingBag className="text-blue-500" />}
          stat={stats.totalCount}
          description="Orders placed all-time"
        />
        <StatCard
          title="Total Spent"
          icon={<TrendingUp className="text-green-500" />}
          stat={`₱${formatPrice(stats.totalSpent)}`}
          description="Lifetime purchase value"
        />
        <StatCard
          title="Completed"
          icon={<ShoppingBag className="text-purple-500" />}
          stat={stats.completedCount}
          description="Successfully fulfilled"
        />
      </div>

      {/* Account Details Detail Card */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-6 space-y-8">
          <div>
            <h2 className="text-xl font-semibold">Account Details</h2>
            <p className="text-sm text-muted-foreground">
              Security and identification settings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <DetailItem
                label="Full Name"
                value={`${user.first_name} ${user.last_name || ""}`}
              />
              <DetailItem
                label="Email Address"
                value={user.email}
                badge="Verified"
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                  Account ID
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {toggleTruncate ? truncateId(user.id) : user.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setToggleTruncate(!toggleTruncate)}
                  >
                    {toggleTruncate ? "Show" : "Hide"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleCopyId}
                  >
                    <Copy className="size-3 mr-1" /> Copy
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between group">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                    Password
                  </p>
                  <p className="text-sm font-medium">••••••••••••</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <KeyRound className="size-3.5 mr-1" /> Update
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for layout consistency
function DetailItem({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
          {label}
        </p>
        {badge && (
          <span className="bg-green-500/10 text-green-600 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border border-green-200">
            {badge}
          </span>
        )}
      </div>
      <p className="text-base font-medium">{value}</p>
    </div>
  );
}
