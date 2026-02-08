"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useScrollTo } from "@/hooks/use-scroll-to";
export default function Hero() {
  const scrollTo = useScrollTo();
  return (
    <section className="relative h-[480px] md:h-[520px] flex items-center overflow-hidden ">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          quality={70}
          src="/hero-bg.jpg"
          alt="Hero"
          fill
          fetchPriority="high"
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/75 to-background/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 custom-container w-full">
        <div className="max-w-xl space-y-4 w-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ">
            Discover the Latest
            <span className="block bg-hero-gradient bg-clip-text text-accent">
              Tech & Gadgets
            </span>
          </h1>

          <p className="text-lg md:text-xl  max-w-md text-neutral-500 dark:text-neutral-400">
            Explore our curated collection of cutting-edge technology and
            accessories
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/categories">
              <Button variant="accent" className="w-full" size={"lg"}>
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Button
              onClick={() => scrollTo("featured-products", 80)}
              variant="secondary"
              size={"lg"}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
