"use client";

import React, { useEffect, useMemo } from "react";
import { useProducts } from "@/store/useProducts";
import { columns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "./data-table";
import { toast } from "sonner";
import { StatCard } from "@/components/ui/stat-card";
import { Package, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function InventoryPage() {
  const { products, loading, fetchProducts, updateProductState } =
    useProducts();

  useEffect(() => {
    fetchProducts("", true, true);
  }, [fetchProducts]);

  const stats = useMemo(
    () => ({
      total: products.length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
      inStock: products.filter((p) => p.stock > 5).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
    }),
    [products],
  );

  async function toggleFeatured(id: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    updateProductState(id, { is_featured: newStatus });

    try {
      const res = await fetch(`/api/admin/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_featured: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Product ${newStatus ? "featured" : "unfeatured"}`);
    } catch (error) {
      updateProductState(id, { is_featured: currentStatus }); // Rollback
      toast.error("Failed to update featured status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Item deleted successfully");
      await fetchProducts("", true, true);
    } catch (error) {
      toast.error("Failed to delete item");
    }
  }

  // Early return for loading state
  if (loading) return <InventorySkeleton />;

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="page-heading">Inventory Management</h1>
        <p className="page-subheading">Manage products and stock levels</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        <StatCard
          title="Total Products"
          icon={<Package className="w-6 h-6" />}
          stat={stats.total}
          description="Total number of unique items in inventory"
        />

        <StatCard
          title="In-Stock Items"
          icon={<CheckCircle className="w-6 h-6" />}
          stat={stats.inStock}
          description="Products available and ready for sale"
        />

        <StatCard
          title="Low Stock Items"
          icon={<AlertTriangle className="w-6 h-6" />}
          stat={stats.lowStock}
          description="Items requiring restocking soon (5 or less)"
        />

        <StatCard
          title="Out of Stock"
          icon={<XCircle className="w-6 h-6" />}
          stat={stats.outOfStock}
          description="Products that require urgent restocking"
        />
      </div>

      <div className="mt-8">
        <DataTable
          onToggleFeatured={toggleFeatured}
          data={products}
          columns={columns}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="w-full space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2 items-start">
        <Skeleton className="h-8 w-1/3 mb-2" />
        <Skeleton className="h-5 w-2/3 mb-6" />
      </div>

      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="w-full h-96 rounded-md animate-pulse" />
      </div>
    </div>
  );
}
