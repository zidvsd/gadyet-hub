"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useProducts } from "@/store/useProducts";
import ProductsCardSkeleton from "../ProductsCardSkeleton";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/StaggerContainer";
import ProductCard from "../ProductCard";

export default function FeaturedProducts() {
  const { products, fetchProducts, loading } = useProducts();
  const featuredProducts = products.filter((p) => p.is_featured);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 1. EARLY RETURN: This covers BOTH initial JS load and data fetching
  if (loading || featuredProducts.length === 0) {
    return (
      <ProductsCardSkeleton className="bg-sidebar dark:bg-muted" count={6} />
    );
  }

  // 2. REAL CONTENT: No need for a ternary here anymore!
  return (
    <section className="bg-sidebar dark:bg-muted py-16">
      <div className="custom-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Featured Products</h1>
            <span className="text-xl text-neutral-500 dark:text-neutral-400">
              Our top picks just for you
            </span>
          </div>
          <Link className="hidden md:block" href="/categories">
            <Button className="flex items-center gap-2" variant="ghost">
              View All
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>

        {/* Grid */}
        <div className="mt-8">
          <StaggerContainer inView={true}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
