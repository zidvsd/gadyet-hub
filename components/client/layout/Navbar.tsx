"use client";

import { ShoppingCart, Bell, User, Package } from "lucide-react";
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
import { User as UserIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getFirstName } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/useCart";
import { useSearchParams } from "next/navigation";
export default function Navbar() {
  const { role, loading: AuthLoading } = useAuth();
  const { users, loading: userLoading, fetchUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const { items, fetchCart } = useCart();
  const router = useRouter();
  const loading = AuthLoading || userLoading;
  const isFirstRender = useRef(true);
  const searchParams = useSearchParams();

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

  useEffect(() => {
    fetchUsers();
    fetchCart();
  }, [fetchUsers, fetchCart]);

  return (
    <nav className="sticky top-0 bg-background border-b border-neutral-300 shadow dark:border-neutral-700 z-50">
      <div className="custom-container flex items-center justify-between py-3">
        {/* Logo */}
        <Link href={"/"}>
          <h1 className="logo">GadyetHub</h1>
        </Link>

        {/* Search */}
        <div className="self-center flex justify-center items-center w-full">
          <div className="mx-4 md:w-1/2 lg:w-1/2">
            <Input
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full "
            />
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4 md:space-x-8">
          {role && (
            <>
              <div className="w-fit">
                <ModeToggle variant="nav" />
              </div>
              <Link
                href="/account?tab=notifications"
                className="group hover:bg-muted rounded-lg p-2 hover-utility"
              >
                <Bell className="size-4 cursor-pointer transition group-hover:text-accent" />
              </Link>
              <Link
                href="/cart"
                className="relative group inline-flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-muted hover-utility"
                aria-label={`Shopping cart, ${items.length} items`}
              >
                <ShoppingCart className="size-4 group-hover:text-accent hover-utility" />

                {items.length > 0 && (
                  <div
                    className="
        absolute top-[-1] right-[-1]
        flex h-4 w-4 items-center justify-center 
        rounded-full border border-transparent 
        bg-accent p-0 text-xs font-semibold text-white
        transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
      "
                  >
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
                  <button className="group hover:bg-muted  cursor-pointer rounded-lg p-2 hover-utility">
                    <User className="size-4 cursor-pointer hover-utility group-hover:text-accent" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link
                      href="/account?tab=profile"
                      className="group flex items-center py-1.5 gap-2 w-full justify-center text-center hover:text-white transition"
                    >
                      <UserIcon className="w-4 h-4 shrink-0 text-black dark:text-white group-hover:text-white transition" />
                      {loading
                        ? "Loading..."
                        : users && users.length > 0 && users[0].first_name
                          ? getFirstName(users[0].first_name)
                          : "Me"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href="/account?tab=orders"
                      className="group flex items-center py-1.5 gap-2 w-full justify-center text-center hover:text-white transition"
                    >
                      <Package className="w-4 h-4 shrink-0 text-black dark:text-white group-hover:text-white transition" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="w-fit ">
                      <LogoutButton showText={true} />
                    </div>
                  </DropdownMenuItem>
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
