"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/store/useProducts";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { products, loading, fetchProducts } = useProducts();

  const product = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId],
  );

  return (
    <div className=" space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">
            Update product details and availability
          </p>
        </div>
      </div>

      {/* Form */}
      <ProductForm />
    </div>
  );
}
