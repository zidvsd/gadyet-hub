"use client";

import { formatPrice } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";

// Shape of your order items after enriching with product data
export type OrderItemRow = {
  id: string;
  product_id: string;
  productName: string;
  quantity: number;
  price: number;
  image_path: string | null;
};

export const columns: ColumnDef<OrderItemRow>[] = [
  {
    accessorKey: "img_path",
    header: "Image",
    cell: ({ row }) => {
      const imagePath = row.original.image_path;

      if (!imagePath) return null;

      return (
        <Link href={`/admin/dashboard/inventory/${row.original.product_id}`}>
          <Image
            src={imagePath}
            alt={row.original.productName}
            height={52}
            width={52}
            className="object-cover rounded"
          />
        </Link>
      );
    },
  },
  {
    accessorKey: "productName",
    header: "Product",
    cell: ({ row }) => (
      <Link
        href={`/admin/dashboard/inventory/${row.original.product_id}`}
        className="hover-utility hover:text-accent "
      >
        {row.original.productName}
      </Link>
    ),
  },
  {
    accessorKey: "product_id",
    header: "Product ID",
    cell: ({ row }) => (
      <Link
        href={`/admin/dashboard/inventory/${row.original.product_id}`}
        className="hover-utility hover:text-accent  "
      >
        {row.original.product_id}
      </Link>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "price",
    header: "Subtotal",
    cell: ({ row }) => `₱${formatPrice(row.original.price)}`, // format price
  },
];
