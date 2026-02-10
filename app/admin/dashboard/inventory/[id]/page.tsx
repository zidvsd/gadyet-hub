"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  availabilityClasses,
  stockStatusClasses,
} from "@/lib/styles/badgeClasses";
import { useProducts } from "@/store/useProducts";
import {
  formatPrice,
  formatDate,
  truncateId,
  upperCaseFirstLetter,
} from "@/lib/utils";

import { Product } from "@/lib/types/products";
export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [toggleTruncate, setToggleTruncate] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const productId = params.id as string;

  const { products, loading: productsLoading, fetchProducts } = useProducts();
  const loading = productsLoading;

  const cardStyle =
    "bg-card p-5  rounded-xl  border border-neutral-200 shadow-md dark:shadow-none dark:border-none";

  const product: Product | undefined = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId],
  );

  if (loading) {
    return (
      <div className="product-info w-full px-4 md:px-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Main Image Skeleton */}
          <Skeleton className="w-full h-[300px] md:h-[500px] rounded-lg shadow-md" />

          {/* Info + Metadata Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Info Card */}
            <div className={`${cardStyle} space-y-4`}>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* Metadata Card */}
            <div className={`${cardStyle} space-y-4`}>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>

          {/* Description Card Skeleton */}
          <div className={cardStyle}>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[75%]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Guard clause for "Not Found" (after loading is done)
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="product-info w-full ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{product?.name}</h1>
            <p className="text-muted-foreground">Product Details</p>
          </div>
        </div>
        <Button variant="accent" size="icon" asChild>
          <Link href={`/admin/dashboard/inventory/${product.id}/edit`}>
            <SquarePen className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Full-width Thumbnail */}
        <div className="w-full rounded-lg overflow-hidden border border-neutral-200 shadow-md dark:shadow-none dark:border-none">
          {imageLoading && <Skeleton className="w-full h-72" />}
          <div className="w-full  flex justify-center items-center">
            <Image
              onLoad={() => setImageLoading(false)}
              src={product.image_path}
              alt={product.name}
              width={1024}
              height={1024}
              className="  object-cover"
            />
          </div>
        </div>

        {/* Product Info + Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Info */}
          <div className={`${cardStyle} space-y-4`}>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Price</span>
                <span className="text-accent  font-semibold">
                  {formatPrice(product?.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Stock</span>
                <span
                  className={
                    product.stock === 0
                      ? stockStatusClasses.outOfStock
                      : product.stock < 5
                        ? stockStatusClasses.lowStock
                        : stockStatusClasses.inStock
                  }
                >
                  {product.stock === 0
                    ? "Out of stock"
                    : product.stock < 5
                      ? "Low stock"
                      : "In stock"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Category</span>
                <span className="text-muted-foreground">
                  {upperCaseFirstLetter(product.category)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Availability</span>
                <span
                  className={
                    product.is_active
                      ? availabilityClasses.available
                      : availabilityClasses.unavailable
                  }
                >
                  {product.is_active ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className={`${cardStyle} space-y-2`}>
            <div className="space-y-2">
              <div
                className="flex justify-between cursor-pointer hover:text-accent"
                onClick={() => setToggleTruncate((prev) => !prev)}
              >
                <span className="hover-utility">Product ID</span>
                <span className="text-muted-foreground">
                  {toggleTruncate ? truncateId(product.id) : product.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Date Created</span>
                <span className="text-muted-foreground">
                  {formatDate(product.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated</span>
                <span className="text-muted-foreground">
                  {formatDate(product.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={`${cardStyle}`}>
          <h1 className="font-medium">Description</h1>
          <p className="text-sm mt-2 text-muted-foreground">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}
