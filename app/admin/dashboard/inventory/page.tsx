"use client";

import { useEffect } from "react";
import { useProducts } from "@/store/useProducts";
import { columns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "./data-table";
import { toast } from "sonner";
import { StatCard } from "@/components/ui/stat-card";
import { Package, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function page() {
  const { products, loading, fetchProducts, updateProductState } =
    useProducts();

  const totalProducts = products.length;
  const lowStocks = products.filter((product) => product.stock <= 5).length;
  const inStocks = products.filter((product) => product.stock > 5).length;
  const noStocks = products.filter((product) => product.stock === 0).length;

  async function toggleFeatured(id: string, currentStatus: boolean) {
    const newStatus = !currentStatus;

    updateProductState(id, { is_featured: newStatus });
    try {
      const res = await fetch(`/api/admin/products`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          is_featured: newStatus,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to update product featured status");
      }
      toast.success(`Product ${!currentStatus ? "featured" : "unfeatured"}`);
    } catch (error) {
      updateProductState(id, { is_featured: currentStatus });
      toast.error("Failed to update featured status");
    }
  }
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("failed to delete");
      }
      toast.success("Item deleted successfully");

      await fetchProducts(undefined, true);
    } catch (error) {
      toast.error("Failed to delete item");
    }
  }

  return (
    <div className="w-full ">
      {loading ? (
        <div className="flex flex-col gap-2 items-start">
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-5 w-2/3 mb-6" />
        </div>
      ) : (
        <>
          <h1 className="page-heading">Inventory Management</h1>
          <p className="page-subheading">Manage products and stock levels</p>
        </>
      )}

      {/* cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full mt-8">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full mt-8">
          <StatCard
            title="Total Products"
            icon={<Package className="w-6 h-6" />}
            stat={totalProducts}
            description="Total number of unique items in inventory"
          />

          <StatCard
            title="In-Stock Items"
            icon={<CheckCircle className="w-6 h-6" />}
            stat={inStocks}
            description="Products currently available and ready for sale"
          />

          <StatCard
            title="Low Stock Items"
            icon={<AlertTriangle className="w-6 h-6" />}
            stat={lowStocks}
            description="Items nearing depletion and require restocking soon"
          />
          <StatCard
            title="Out of Stock"
            icon={<XCircle className="w-6 h-6" />}
            stat={noStocks}
            description="Products that are currently unavailable and need urgent action"
          />
        </div>
      )}
      {/* products table */}
      <div className="mt-8">
        {loading ? (
          <Skeleton className=" w-full h-42 rounded-md animate-pulse" />
        ) : (
          <DataTable
            onToggleFeatured={toggleFeatured}
            data={products}
            columns={columns}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
