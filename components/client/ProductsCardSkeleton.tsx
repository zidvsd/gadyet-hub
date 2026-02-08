import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";

interface ProductsCardSkeletonProps {
  title?: boolean; // Should it show a header?
  count?: number; // How many cards?
  columns?: string; // Responsive grid classes
  className?: string; // Background/Padding classes
}

export default function ProductsCardSkeleton({
  title = true,
  count = 3,
  columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  className,
}: ProductsCardSkeletonProps) {
  return (
    <section className={cn("py-16", className)}>
      <div className="custom-container">
        {/* Optional Header Skeleton */}
        {title && (
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-5 w-64" />
            </div>
            <Skeleton className="hidden md:block h-10 w-24" />
          </div>
        )}

        {/* The Grid - Logic matches your actual Product Grid */}
        <div className={cn("grid gap-4", columns)}>
          {Array.from({ length: count }).map((_, i) => (
            <ProductCard key={i} loading={true} />
          ))}
        </div>
      </div>
    </section>
  );
}
