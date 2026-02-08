import dynamic from "next/dynamic";
import Hero from "@/components/client/home/Hero";
import FeatureBar from "@/components/client/home/FeatureBar";
import { Suspense } from "react";
import ProductsCardSkeleton from "@/components/client/ProductsCardSkeleton";
const Categories = dynamic(() => import("@/components/client/home/Categories"));
const FeaturedProducts = dynamic(
  () => import("@/components/client/home/FeaturedProducts"),
);
const Cta = dynamic(() => import("@/components/client/Cta"));

export default function Page() {
  return (
    <main>
      <Hero />
      <FeatureBar />

      <div className="custom-container">
        <Suspense
          fallback={<div className="h-32 animate-pulse bg-muted rounded-xl" />}
        >
          <Categories />
        </Suspense>
      </div>

      {/* This is the cleanest way to handle component + data loading */}
      <Suspense
        fallback={<ProductsCardSkeleton className="bg-sidebar" count={3} />}
      >
        <FeaturedProducts />
      </Suspense>

      <div className="bg-muted dark:bg-sidebar w-full">
        <Suspense fallback={null}>
          <Cta />
        </Suspense>
      </div>
    </main>
  );
}
