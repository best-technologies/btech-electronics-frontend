"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimateOnScroll } from "@/landing-page/components/AnimateOnScroll";
import { useQuery } from "@/hooks/useQuery";
import { homepageApi, type HomepageProduct } from "@/lib/api";
import { Package, RefreshCw } from "lucide-react";

const STALE_TIME_MS = 10 * 60 * 1000; // 10 min — public landing, no auth

function ProductCard({ product }: { product: HomepageProduct }) {
  const imageUrl = product.images?.[0]?.secure_url;

  return (
    <Card className="group h-full w-full overflow-hidden border-border/80 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-foreground/5">
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-muted/30 sm:rounded-t-xl">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, 240px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Package className="h-8 w-8 sm:h-12 sm:w-12" aria-hidden />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2.5 sm:p-4">
        <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-foreground sm:text-sm">
          {product.name}
        </p>
        {product.category && (
          <p className="mt-0.5 text-[9px] text-muted-foreground sm:mt-1 sm:text-xs">{product.category}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ProductCarousel({ products }: { products: HomepageProduct[] }) {
  const [isPaused, setIsPaused] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    duration: 25,
    dragFree: false,
    containScroll: "trimSnaps",
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi || isPaused) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => clearInterval(interval);
  }, [emblaApi, isPaused]);

  return (
    <div
      className="relative -mx-4 sm:-mx-6 lg:-mx-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Product carousel"
    >
      {/* Gradient masks */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-background to-transparent sm:w-12 lg:w-16"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-background to-transparent sm:w-12 lg:w-16"
        aria-hidden
      />

      {/* Scroll buttons */}
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="absolute left-1 top-1/2 z-20 h-9 w-9 -translate-y-1/2 rounded-full shadow-lg touch-manipulation sm:left-4 sm:h-10 sm:w-10"
        onClick={scrollPrev}
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="absolute right-1 top-1/2 z-20 h-9 w-9 -translate-y-1/2 rounded-full shadow-lg touch-manipulation sm:right-4 sm:h-10 sm:w-10"
        onClick={scrollNext}
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      <div ref={emblaRef} className="overflow-hidden py-1.5 touch-pan-y sm:py-2">
        <div className="flex gap-2.5 pl-2 sm:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-0 flex-[0_0_180px] sm:flex-[0_0_220px] md:flex-[0_0_240px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card className="w-[180px] shrink-0 overflow-hidden border-border/80 bg-card sm:w-[220px] md:w-[240px]">
      <CardHeader className="p-0">
        <div className="aspect-square w-full animate-pulse rounded-t-lg bg-muted/50 sm:rounded-t-xl" />
      </CardHeader>
      <CardContent className="p-2.5 sm:p-4">
        <div className="h-2.5 w-3/4 rounded bg-muted/60 animate-pulse sm:h-4" />
        <div className="mt-2 h-2.5 w-1/2 rounded bg-muted/40 animate-pulse sm:mt-2 sm:h-3" />
      </CardContent>
    </Card>
  );
}

export function CategoriesSection() {
  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: "homepage-products",
    queryFn: () => homepageApi.getProducts(),
    enabled: true,
    staleTime: STALE_TIME_MS,
    keepPreviousData: true,
  });

  const list = Array.isArray(products) ? products : [];
  const showSkeleton = isLoading && list.length === 0;

  return (
    <section
      id="categories"
      className="py-8 sm:py-24 lg:py-28"
      aria-labelledby="categories-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll variant="fadeUp" as="header" className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary sm:text-sm">
            Available now
          </p>
          <h2
            id="categories-heading"
            className="mt-2 text-lg font-bold tracking-tight text-foreground sm:mt-3 sm:text-4xl"
          >
            Currently in stock
          </h2>
          <p className="mt-2 text-xs text-muted-foreground sm:mt-4 sm:text-base md:text-lg">
            Limited stock — enquire for availability and wholesale terms.
          </p>
          <div
            className="mx-auto mt-2.5 h-1 w-16 rounded-full bg-primary sm:mt-6"
            aria-hidden
          />
        </AnimateOnScroll>

        <div
          className={`mt-5 pb-3 sm:mt-12 sm:pb-4 ${list.length > 0 ? "overflow-hidden" : "overflow-x-auto scroll-smooth [scrollbar-width:thin]"}`}
        >
          {showSkeleton && (
            <ul className="flex gap-2.5 min-w-max list-none p-0 sm:gap-6" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i}>
                  <SkeletonCard />
                </li>
              ))}
            </ul>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-3 py-6 text-center sm:px-4 sm:py-12">
              <p className="text-xs font-medium text-foreground sm:text-sm">
                Unable to load products
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Something went wrong. Please try again later.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 gap-2"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          )}

          {!showSkeleton && !isError && list.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-3 py-6 text-center sm:px-4 sm:py-12">
              <Package className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" aria-hidden />
              <p className="mt-2 text-xs font-medium text-foreground sm:mt-3 sm:text-sm">
                No products in stock at the moment
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Check back later or contact us for enquiries.
              </p>
            </div>
          )}

          {!showSkeleton && !isError && list.length > 0 && (
            <ProductCarousel products={list} />
          )}
        </div>
      </div>
    </section>
  );
}
