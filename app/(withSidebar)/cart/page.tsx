"use client";

import { ArrowLeft, ShoppingCart, Trash, Shield, Truck } from "lucide-react";
import { useCart } from "@/store/useCart";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/Empty";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { QuantityInput } from "@/components/client/QuantityInput";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { useUsers } from "@/store/useUsers";
import { EditProfileForm } from "@/components/client/forms/EditProfileForm";
import { AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  StaggerItem,
  StaggerContainer,
} from "@/components/animations/StaggerContainer";

export default function Page() {
  const { items, loading, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  const { users } = useUsers();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleCheckOut = () => {
    if (loading || !users[0]) return;

    const currentUser = users[0];
    const missingInfo =
      !currentUser?.address ||
      !currentUser?.phone ||
      !currentUser?.first_name ||
      !currentUser.last_name;
    if (missingInfo) {
      toast.error("Please complete your profile details before checking out", {
        description: "We need your address and phone number for delivery",
      });
      setShowProfileModal(true);
      return;
    }
    router.push("/checkout");
  };

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <div className="custom-container my-8">
      {/* Header */}
      <div className="flex items-center gap-8 mb-8">
        <ArrowLeft className="cursor-pointer" onClick={() => router.back()} />
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <span className="text-muted-foreground">
            {items.length} items in your cart
          </span>
        </div>
      </div>

      {!loading && items.length === 0 && (
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Looks like you haven't added any items yet."
        />
      )}

      {showProfileModal && (
        <EditProfileForm
          user={users[0]}
          open={showProfileModal}
          onOpenChange={setShowProfileModal}
        />
      )}

      {(loading || items.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Column */}
          <div className="lg:col-span-2">
            <StaggerContainer
              key={`cart-list-${items.length}`}
              className="h-fit rounded-lg border overflow-hidden shadow-md bg-card"
            >
              <AnimatePresence mode="popLayout">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={`skeleton-${i}`}
                        className="flex items-center gap-4 p-4 border-b bg-card"
                      >
                        <Skeleton className="h-[72px] w-[72px] rounded-md" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-[60%]" />
                          <Skeleton className="h-3 w-[30%]" />
                        </div>
                      </div>
                    ))
                  : items.map((item, index) => (
                      <StaggerItem key={item.id}>
                        <div
                          className={`flex items-center gap-4 border-b bg-card p-4 ${index === items.length - 1 ? "border-b-0" : ""}`}
                        >
                          <Link
                            href={`/products/${item.product_id}`}
                            className="shrink-0"
                          >
                            <div className="relative h-[72px] w-[72px] overflow-hidden rounded-md border bg-muted">
                              <Image
                                src={
                                  item.product.image_path ?? "/placeholder.png"
                                }
                                alt={item.product.name}
                                fill
                                sizes="72px"
                                className="object-cover transition-transform hover:scale-110"
                              />
                            </div>
                          </Link>
                          <div className="flex-1 space-y-2">
                            <Link href={`/products/${item.product_id}`}>
                              <h3 className="font-semibold hover:text-accent transition-colors">
                                {item.product.name}
                              </h3>
                            </Link>
                            <span className="text-sm text-muted-foreground">
                              ₱{formatPrice(item.price)} each
                            </span>
                            <div className="flex items-center gap-4 mt-2">
                              <QuantityInput
                                value={item.quantity}
                                onChange={(newQty) =>
                                  updateQuantity(item.id, newQty)
                                }
                              />
                              <span className="font-semibold text-accent">
                                ₱{formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash size={18} />
                          </Button>
                        </div>
                      </StaggerItem>
                    ))}
              </AnimatePresence>
            </StaggerContainer>
          </div>

          {/* Sticky Summary Column */}
          <div className="min-w-0">
            <div className="bg-card rounded-md border p-6 h-fit shadow-md sticky top-8">
              <StaggerContainer
                key={`summary-${subtotal}`}
                className="space-y-4"
              >
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    <StaggerItem>
                      <h2 className="text-xl font-semibold">Order Summary</h2>
                    </StaggerItem>

                    <StaggerItem>
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>₱{formatPrice(subtotal)}</span>
                      </div>
                    </StaggerItem>

                    <StaggerItem>
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span className="text-green-500 font-bold">Free</span>
                      </div>
                    </StaggerItem>

                    <StaggerItem>
                      <div className="border-t pt-4 flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-accent">
                          ₱{formatPrice(subtotal)}
                        </span>
                      </div>
                    </StaggerItem>

                    <StaggerItem>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <div className="flex items-center gap-2">
                          <Truck size={14} /> Free delivery
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield size={14} /> Secure checkout
                        </div>
                      </div>
                    </StaggerItem>

                    <StaggerItem className="pt-2">
                      <div className="space-y-2">
                        <Button
                          onClick={handleCheckOut}
                          variant="accent"
                          className="w-full"
                        >
                          Proceed to Checkout
                        </Button>
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() => router.push("/")}
                        >
                          Continue Shopping
                        </Button>
                      </div>
                    </StaggerItem>
                  </>
                )}
              </StaggerContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
