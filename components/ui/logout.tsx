"use client";

import React, { forwardRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { useUsers } from "@/store/useUsers";
import { useProducts } from "@/store/useProducts";
import { useOrders } from "@/store/useOrders";
import { useCart } from "@/store/useCart";
import { cn } from "@/lib/utils"; // Shadcn utility for merging classes

interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  showText?: boolean;
}

// Wrapping in forwardRef is the "magic" that makes it work inside SidebarMenuButton/DropdownMenuItem
export const LogoutButton = forwardRef<HTMLButtonElement, LogoutButtonProps>(
  ({ showText = true, className, ...props }, ref) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent parent link/button triggers
      e.preventDefault();

      setIsLoggingOut(true);
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          toast.error("Failed to logout");
          return;
        }

        // Clear Cookie Role
        document.cookie =
          "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

        // Clear Zustand states
        useUsers.getState().clearUsers();
        useOrders.getState().clearOrders();
        useProducts.getState().clearProducts();
        useCart.getState().clearCart();

        toast.success("Logged out successfully!");

        // Use window.location for a full refresh to clear any residual cache
        window.location.href = "/login";
      } catch (err: any) {
        toast.error("Logout failed: " + err.message);
      } finally {
        setIsLoggingOut(false);
      }
    };

    return (
      <button
        ref={ref}
        onClick={handleLogout}
        disabled={isLoggingOut}
        {...props} // Spreading props ensures sidebar/dropdown styles are applied
        className={cn(
          "flex w-full items-center gap-3 px-3.5 py-1.5 text-sm outline-none  cursor-pointer rounded-sm",
          "hover:bg-accent hover:text-accent-foreground text",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        <LogOut className="h-4 w-4 shrink-0 " />
        {showText && (
          <span className="truncate">
            {isLoggingOut ? "Logging Out..." : "Log Out"}
          </span>
        )}
      </button>
    );
  },
);

LogoutButton.displayName = "LogoutButton";

export default LogoutButton;
