"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Product } from "@/lib/types/products";

import { upperCaseFirstLetter } from "@/lib/utils";

export default function AddProductForm() {
  const [product, setProduct] = useState<
    Omit<Product, "id" | "price" | "stock"> & { price: string; stock: string }
  >({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    image_path: "",
    is_active: true,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const updateField = (key: keyof typeof product, value: any) => {
    setProduct((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.error || "Upload failed");

      updateField("image_path", json.publicUrl);
      toast.success("Image uploaded successfully");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const payload: Product = {
        ...product,
        name: product.name.trim(),
        category: upperCaseFirstLetter(product.category.trim()),
        description: product.description.trim(),
        price: Number(product.price),
        stock: Number(product.stock),
      } as Product;

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add product");

      toast.success("Product added successfully");

      // Reset form
      setProduct({
        name: "",
        description: "",
        category: "",
        price: "",
        stock: "",
        image_path: "",
        is_active: true,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 p-4">
      <h1 className="text-2xl font-bold">Add New Product</h1>

      {/* Name */}
      <div className="space-y-1">
        <Label>Name</Label>
        <Input
          value={product.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Enter product name"
        />
      </div>

      {/* Price & Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Price</Label>
          <Input
            type="number"
            value={product.price}
            onChange={(e) => updateField("price", e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="space-y-1">
          <Label>Stock</Label>
          <Input
            type="number"
            value={product.stock}
            onChange={(e) => updateField("stock", e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1">
        <Label>Category</Label>
        <Input
          value={product.category}
          onChange={(e) => updateField("category", e.target.value)}
          placeholder="Enter category"
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-1">
        <Label>Product Image</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
          }}
        />
        {uploading && (
          <p className="text-sm text-muted-foreground">Uploading...</p>
        )}
        {product.image_path && (
          <img
            src={product.image_path}
            alt="Product"
            className="mt-2 h-32 object-contain rounded border"
          />
        )}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label>Description</Label>
        <Textarea
          rows={4}
          value={product.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Enter product description"
        />
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <Label>Product Status</Label>
          <p className="text-sm text-muted-foreground">
            Inactive products won’t appear in the store
          </p>
        </div>
        <Switch
          checked={product.is_active}
          onCheckedChange={(v) => updateField("is_active", v)}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={saving || uploading}>
          {saving ? "Saving..." : "Add Product"}
        </Button>
      </div>
    </div>
  );
}
