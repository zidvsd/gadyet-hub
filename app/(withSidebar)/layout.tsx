"use client";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search } from "lucide-react";
import Link from "next/link";

// Custom imports
import { AppSidebar } from "@/components/AppSidebar";
import Navbar from "@/components/client/layout/Navbar";
import Footer from "@/components/client/layout/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PageTransition } from "@/components/animations/PageTransition";

// Stores & Utils
import { useUsers } from "@/store/useUsers";
import { useCart } from "@/store/useCart";
import { useAuth } from "@/hooks/useAuth";

import { clientMenu } from "@/lib/layoutMenus";
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchUsers } = useUsers();
  const { fetchCart, items } = useCart();

  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && role) {
      Promise.all([fetchUsers(), fetchCart()]);
    }
  }, [role, loading, fetchUsers, fetchCart]);

  const publicPages = ["/"];

  return (
    <>
      <ProtectedRoute
        role={role}
        user={user}
        loading={loading}
        publicPages={publicPages}
      >
        {/* Desktop: Navbar + Content */}
        <div className="hidden md:block">
          <Navbar />
          <PageTransition>
            <main>{children}</main>
          </PageTransition>
        </div>

        {/* Mobile/Tablet: Sidebar + Content */}
        <SidebarProvider className="md:hidden">
          <AppSidebar items={clientMenu} />
          <div className="flex flex-col w-full ">
            <nav className="sticky top-0 z-50 flex justify-between items-center pt-2 w-full p-2 bg-background border-b border-neutral-300  shadow dark:border-muted">
              {" "}
              <div className="flex items-center gap-4">
                <Button variant={"nav"} className="px-3" asChild>
                  <SidebarTrigger />
                </Button>
                {role && (
                  <Link
                    href="/cart"
                    className="relative group inline-flex items-center justify-center rounded-lg "
                    aria-label={`Shopping cart, ${items.length} items`}
                  >
                    <Button variant={"nav"}>
                      <ShoppingCart className="size-4" />

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
                    </Button>
                  </Link>
                )}

                {role && (
                  <Link href={"/search"}>
                    <Button variant={"nav"}>
                      <Search className="" />
                    </Button>
                  </Link>
                )}
              </div>
              {/* logo */}
              <Link className="" href="/">
                <h1 className="logo">GadyetHub</h1>
              </Link>
            </nav>
            <PageTransition>
              {" "}
              <main className="w-full">{children}</main>
            </PageTransition>
          </div>
        </SidebarProvider>
        <Footer />
      </ProtectedRoute>
    </>
  );
}
