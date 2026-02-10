"use client";

import {
  ShoppingCart,
  Bell,
  User,
  Package,
  User as UserIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/ui/logout";
import { ModeToggle } from "@/components/ModeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUsers } from "@/store/useUsers";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getFirstName } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/store/useCart";

export default function Navbar() {
  const { role, loading: AuthLoading } = useAuth();
  const { users, loading: userLoading, fetchUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const { items, fetchCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const loading = AuthLoading || userLoading;
  const isFirstRender = useRef(true);

  // --- Search Logic ---
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const handler = setTimeout(() => {
      const currentQuery = searchParams.get("q") || "";
      const trimmed = searchTerm.trim();

      if (trimmed && trimmed !== currentQuery) {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      } else if (!trimmed && currentQuery) {
        router.push("/search");
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, router, searchParams]);

  useEffect(() => {
    setSearchTerm(searchParams.get("q") ?? "");
  }, [searchParams]);

  return (
    <nav className="sticky top-0 bg-background border-b border-neutral-300 shadow dark:border-neutral-700 z-50">
      <div className="custom-container flex items-center justify-between py-3">
        {/* Logo */}
        <Link href={"/"}>
          <h1 className="logo">GadyetHub</h1>
        </Link>

        {/* Search */}
        <div className="flex flex-1 justify-center px-4">
          <div className="w-full max-w-md">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full"
            />
          </div>
        </div>

        {/* Icons & Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {role && (
            <>
              <Button variant={"nav"} className="p-2">
                <ModeToggle />
              </Button>
              <Link
                href="/account?tab=notifications"
                className="group hover:bg-muted rounded-lg p-2 hover-utility"
              >
                <Bell className="size-4 group-hover:text-accent " />
              </Link>
              <Link
                href="/cart"
                className="relative group rounded-lg p-2 hover:bg-muted hover-utility"
                aria-label={`Shopping cart, ${items.length} items`}
              >
                <ShoppingCart className="size-4 group-hover:text-accent" />
                {items.length > 0 && (
                  <div className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                    {items.length}
                  </div>
                )}
              </Link>
            </>
          )}

          <div className="flex items-center">
            {role ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group hover:bg-muted rounded-lg p-2 outline-hidden">
                    <User className="size-4 group-hover:text-accent group-hover:cursor-pointer hover-utility" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {/* Profile Item */}
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account?tab=profile"
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                    >
                      <UserIcon className="size-4 shrink-0 text-foreground" />
                      <span className="truncate">
                        {loading
                          ? "Loading..."
                          : users?.[0]?.first_name
                            ? getFirstName(users[0].first_name)
                            : "My Profile"}
                      </span>
                    </Link>
                  </DropdownMenuItem>

                  {/* Orders Item */}
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account?tab=orders"
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                    >
                      <Package className="size-4 shrink-0 text-foreground" />
                      <span>Orders</span>
                    </Link>
                  </DropdownMenuItem>

                  {/* Logout Button */}
                  <div className="border-t border-muted dark:border-gray-500  my-1" />
                  <LogoutButton showText={true} />
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href={"/login"}>
                <Button className="px-6" variant="accent">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
