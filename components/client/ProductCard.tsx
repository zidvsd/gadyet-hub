"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useCart } from "@/store/useCart";
import { formatPrice } from "@/lib/utils";
import { use, useState } from "react";
import { Spinner } from "../ui/spinner";
import { useAuth } from "@/hooks/useAuth";
interface ProductCardProps {
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    image_path?: string;
    is_featured?: boolean;
  };
  loading?: boolean; // <-- add loading prop
  handleAddToCart?: (productId: string) => void;
}

export default function ProductCard({
  product,
  loading = false,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  if (loading || !product) {
    // Skeleton version
    return (
      <div className="product-card group">
        <Skeleton className="h-62 w-full dark:bg-sidebar" /> {/* Image */}
      </div>
    );
  }
  const isOutOfStock = product.stock <= 0;
  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      toast.error("Please login", {
        description: "You need an account to add items to your cart.",
        action: {
          label: "Login",
          onClick: () => router.push("/login"),
        },
      });
      return; // Exit the function before setIsAdding(true) or calling addToCart
    }
    setIsAdding(true);
    try {
      const success = await addToCart(product.id, product.stock, 1);

      if (success) {
        toast.success(`${product.name} added to cart`, {
          action: {
            label: "View Cart",
            onClick: () => router.push("/cart"),
          },
        });
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred", {
        description: err.message,
      });
    } finally {
      setIsAdding(false);
    }
  };
  return (
    <div className="product-card group relative h-full">
      {/* <-- add relative here */}
      {product.is_featured && (
        <span className="absolute top-4 left-4 rounded-full px-2 py-1 text-xs font-bold bg-accent text-white shadow-md z-5">
          Featured
        </span>
      )}
      {/* Image */}
      <div className="product-card-image relative cursor-pointer  aspect-3/4 h-48 w-full overflow-hidden">
        <Link
          href={`/products/${product.id}`}
          className="block relative h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105"
        >
          <Image
            quality={60}
            src={product.image_path || "/placeholder.png"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Full image overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

        {/* Buttons at bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            disabled={isAdding || isOutOfStock}
            variant={"accent"}
            className={`flex-1 flex items-center justify-center gap-2 ${
              isOutOfStock
                ? "opacity-50 cursor-not-allowed grayscale"
                : "hover:bg-accent/90"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) {
                handleAddToCart();
              }
            }}
          >
            {isAdding ? (
              <Spinner className="size-4 animate-spin" />
            ) : (
              <ShoppingCart className="size-4" />
            )}
            {isOutOfStock ? "Sold Out" : isAdding ? "Adding..." : "Add to Cart"}
          </Button>

          <Link
            href={`/products/${product.id}`}
            className="w-10 h-10 rounded-full flex items-center justify-center"
          >
            <Button className="w-full h-full p-0 flex items-center justify-center border bg-white text-gray-700 hover:bg-gray-200">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2
            className="product-card-title"
            onClick={() => router.push(`/products/${product.id}`)}
          >
            {product.name}
          </h2>
          <span className="product-card-stock text-right">
            {product.stock} in stock
          </span>
        </div>
        <span className="product-card-price">
          ₱
          {typeof product.price === "number"
            ? formatPrice(product.price)
            : "0.00"}
        </span>
        <p className="product-card-desc">{product.description}</p>
      </div>
    </div>
  );
}
