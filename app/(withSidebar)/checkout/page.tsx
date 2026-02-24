"use client";

// 1. Rename the icon import to avoid conflict with the User type
import {
  ArrowLeft,
  MapPin,
  Phone,
  User as UserIcon,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { EditProfileForm } from "@/components/client/forms/EditProfileForm";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/useCart";
import { useUsers } from "@/store/useUsers";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { OrderItemsCarousel } from "@/components/client/OrderItemsCarousel";
import { CheckoutSkeleton } from "@/components/client/skeleton/CheckoutSkeleton";
import { ProcessingOverlay } from "@/components/ui/processing-overlay";
import { DetailBox } from "@/components/ui/detail-box";
import { useOrders } from "@/store/useOrders";
import { User } from "@/lib/types/users";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, loading: cartLoading } = useCart();
  const { fetchOrders } = useOrders();
  const { users, loading: userLoading } = useUsers();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!cartLoading) {
      const timer = setTimeout(() => setIsHydrated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [cartLoading]);

  useEffect(() => {
    if (isHydrated && items.length === 0 && !isProcessing) {
      router.replace("/");
    }
  }, [isHydrated, items.length, isProcessing, router]);

  const currentUser = useMemo(() => {
    return (users[0] as User) || null;
  }, [users]);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items],
  );

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      toast.error("User not found", { description: "Please log in again." });
      return;
    }

    if (!currentUser.address || !currentUser.phone) {
      toast.error("Incomplete Profile", {
        description:
          "Please update your shipping address and phone number before checkout.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const orderItemsPayload = items.map((item) => ({
        product_id: item.product?.id || item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const res = await fetch("/api/client/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_price: subtotal,
          order_items: orderItemsPayload,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to place order");

      await fetchOrders("user", undefined, true);
      router.push(`/orders/${result.data.id}`);

      setTimeout(() => {
        clearCart();
      }, 500);
    } catch (err: any) {
      toast.error("Checkout Failed", {
        description: err.message || "Please try again later.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cartLoading && items.length === 0 && !isProcessing) return null;

  return (
    <div className="custom-container my-8">
      <div className="flex items-center gap-8 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="cursor-pointer" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <span className="text-muted-foreground">
            Review and place your order
          </span>
        </div>
      </div>

      {cartLoading || userLoading || !currentUser ? (
        <CheckoutSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[6fr_4fr] gap-8">
          <div className="space-y-6 min-w-0">
            <div className="bg-card rounded-lg border p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  <MapPin className="text-accent" size={20} />
                  <h2>Shipping Information</h2>
                </div>
                {/* Now currentUser is guaranteed to be type User here */}
                <EditProfileForm user={currentUser} />
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailBox
                  label="Recipient"
                  icon={<UserIcon size={14} />}
                  value={`${currentUser.first_name} ${currentUser.last_name}`}
                />
                <DetailBox
                  label="Phone Number"
                  icon={<Phone size={14} />}
                  value={currentUser.phone}
                />
                <div className="space-y-1 md:col-span-2">
                  <span className="text-xs uppercase text-muted-foreground font-bold">
                    Delivery Address
                  </span>
                  <p className="font-medium">
                    {currentUser.address ||
                      "No address provided. Please edit profile."}
                  </p>
                </div>
              </div>
            </div>

            {/* ... Rest of your UI (Payment Method, etc) */}
            <div className="bg-card rounded-lg border p-6 shadow-md space-y-4">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <CreditCard className="text-accent" size={20} />
                <h2>Payment Method</h2>
              </div>
              <Separator />
              <div className="p-4 rounded-md border-2 border-accent bg-accent/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full border-4 border-accent" />
                  <span className="font-medium">Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 min-w-0">
            <div className="bg-card rounded-lg border p-6 shadow-md space-y-4 h-fit sticky top-8">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <ShoppingBag className="text-accent" size={20} />
                <h2>Order Summary</h2>
              </div>
              <Separator />
              <div className="py-2">
                <OrderItemsCarousel items={items} />
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({items.length} items)
                  </span>
                  <span>₱{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span className="text-accent">₱{formatPrice(subtotal)}</span>
                </div>
              </div>

              <Button
                className="w-full h-10 font-bold"
                variant="accent"
                disabled={isProcessing}
                onClick={handlePlaceOrder}
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>
              <Button
                className="w-full h-10 font-bold"
                variant="secondary"
                onClick={() => router.push("/cart")}
              >
                Back to Cart
              </Button>
            </div>
          </div>
        </div>
      )}

      {isProcessing && <ProcessingOverlay isOpen={true} />}
    </div>
  );
}
