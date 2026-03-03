"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useProducts } from "@/store/useProducts";
import ProductForm from "@/components/admin/ProductForm";
import AnalyticsSkeleton from "@/components/client/skeleton/AnalyticsSkeleton";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { products, loading, fetchProducts } = useProducts();

  useEffect(() => {
    // Only fetch if products list is empty
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const product = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId],
  );

  if (loading && !product) {
    return <AnalyticsSkeleton />;
  }

  if (!product && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Product not found.</p>
        <Button variant="link" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6  mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground text-sm">
            Update {product?.name || "product"} details and availability
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        {product ? (
          <ProductForm initialProduct={product} />
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            Product data is unavailable.
          </div>
        )}
      </div>
    </div>
  );
}
