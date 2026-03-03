"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Product } from "@/lib/types/products";
import { toast } from "sonner";
import Image from "next/image";
import { useProducts } from "@/store/useProducts";
interface ProductFormProps {
  initialProduct: Product;
}

export default function ProductEditPage({ initialProduct }: ProductFormProps) {
  const router = useRouter();
  const { fetchProducts } = useProducts();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [saving, setSaving] = useState(false);

  const updateField = (key: keyof Product, value: any) => {
    setProduct((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
      };

      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update product");

      await fetchProducts("", true, true);

      toast.success("Product updated successfully");
      router.push(`/admin/dashboard/inventory`); // Navigate back to list
      router.refresh();
    } catch (err) {
      toast.error("Failed to update product");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Inputs */}
        <div className="md:col-span-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={product.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Apple Watch Ultra 2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₱)</Label>
              <Input
                id="price"
                type="number"
                value={product.price}
                onChange={(e) => updateField("price", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                value={product.stock}
                onChange={(e) => updateField("stock", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={product.category}
              onChange={(e) => updateField("category", e.target.value)}
            />
          </div>
        </div>

        {/* Right Side: Image Preview */}
        <div className="space-y-4">
          <Label>Product Image</Label>
          <div className="aspect-square relative rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted">
            {product.image_path ? (
              <Image
                src={product.image_path}
                alt="Preview"
                fill
                className="object-contain p-2"
              />
            ) : (
              <span className="text-xs text-muted-foreground text-center p-4">
                No image URL provided
              </span>
            )}
          </div>
          <Input
            placeholder="Image URL (https://...)"
            value={product.image_path}
            onChange={(e) => updateField("image_path", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea
          id="desc"
          rows={4}
          value={product.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
        <div className="space-y-0.5">
          <Label className="text-base">Visibility Status</Label>
          <p className="text-sm text-muted-foreground">
            Inactive products are hidden from the customer store.
          </p>
        </div>
        <Switch
          checked={product.is_active}
          onCheckedChange={(v) => updateField("is_active", v)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => router.back()}>
          Discard Changes
        </Button>
        <Button
          variant="accent"
          onClick={handleSave}
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving ? "Saving..." : "Update Product"}
        </Button>
      </div>
    </div>
  );
}
