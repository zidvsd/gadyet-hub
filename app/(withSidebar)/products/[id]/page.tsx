"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useProducts } from "@/store/useProducts";
import { useCart } from "@/store/useCart";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuantityInput } from "@/components/client/QuantityInput";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import RelatedProducts from "@/components/client/RelatedProducts";
import { formatPrice } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
export default function ProductPage() {
  const params = useParams();
  const productId = params.id;
  const { products, fetchProducts, loading: productsLoading } = useProducts();
  const {
    items,
    addToCart,
    fetchCart,
    loading: cartLoading,
    isAdding,
  } = useCart();
  const product = products.find((p) => p.id === productId);
  const productCategory = product?.category;
  const [quantity, setQuantity] = useState(1);
  const isInitialLoading = productsLoading || cartLoading;

  // Update local product state
  useEffect(() => {
    const found = products.find((p) => p.id === productId);
  }, [products, productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    const success = await addToCart(product.id, quantity);

    if (success) {
      toast.success(`Added ${product.name} to cart`, {
        description: `Quantity: ${quantity}`,
        action: {
          label: "View Cart",
          onClick: () => (window.location.href = "/cart"),
        },
      });
      setQuantity(1); // Reset the input
    } else {
      toast.error(`Failed to add ${product.name} to cart`);
    }
  };

  if (isInitialLoading || !product)
    return (
      <div className="custom-container grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-8 ">
        <Skeleton className="w-full h-80 " />
        <div className="space-y-4">
          <Skeleton className="w-1/3 h-8 " />
          <Skeleton className="w-full h-6 " />
          <Skeleton className="w-2/3 h-6 " />
          <Skeleton className="w-1/2 h-10 " />
        </div>
      </div>
    );

  return (
    <>
      <div className="custom-container grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 mt-8  ">
        {/* Product Image */}
        <div className="relative shadow-md w-full h-80 md:h-[500px] rounded-md overflow-hidden">
          <Image
            unoptimized
            src={product.image_path}
            alt={product.name}
            fill
            className="object-cover shadow-md rounded-md"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground">{product.category}</p>
          <p className="text-lg text-gray-600">{product.description}</p>
          <p className="text-2xl font-semibold text-accent">
            ₱{formatPrice(product.price)}
          </p>
          <p
            className={`${
              product.stock > 0 ? "text-green-600" : "text-red-600"
            } font-medium`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {/* Quantity selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <QuantityInput
                value={quantity}
                onChange={(newQty) => setQuantity(newQty)}
                disabled={isAdding}
              />
              <Button
                disabled={isAdding}
                className={`px-20 min-w-[220px] relative ${
                  isAdding
                    ? "bg-accent/90 text-white/90"
                    : "bg-accent text-white"
                }`}
                variant="accent"
                onClick={handleAddToCart}
              >
                <span className={isAdding ? "opacity-0" : "opacity-100"}>
                  Add to Cart
                </span>
                {isAdding && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2">
                    <Spinner className="size-4" />
                    <span className="text-sm">Adding...</span>
                  </div>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="custom-container pt-8">
        <Separator />
      </div>
      <div className="py-8 custom-container">
        <RelatedProducts
          category={productCategory ?? ""}
          currentProductId={product.id}
        />
      </div>
    </>
  );
}
