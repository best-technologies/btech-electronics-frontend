"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ImagePlaceholder } from "@/landing-page/components/ImagePlaceholder";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HERO_SLIDES = [
  { id: 1, label: "Appliances & Electronics" },
  { id: 2, label: "Solar & Power Solutions" },
  { id: 3, label: "Kitchen & Home" },
  { id: 4, label: "TVs & Entertainment" },
  { id: 5, label: "Inverters & Batteries" },
] as const;

export function HeroCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    duration: 25,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className="relative w-full">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex touch-pan-y gap-4">
          {HERO_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_100%]"
            >
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-foreground/5 ring-1 ring-foreground/5">
                <ImagePlaceholder
                  aspectRatio="video"
                  label={slide.label}
                  className="min-h-[280px] sm:min-h-[320px] lg:min-h-[380px]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full bg-primary/40 transition-all duration-300 hover:bg-primary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              selectedIndex === i ? "w-6 bg-primary" : "w-2"
            }`}
            onClick={() => emblaApi?.scrollTo(i)}
          />
        ))}
      </div>
      <div className="absolute left-2 top-1/2 hidden -translate-y-1/2 gap-2 sm:flex">
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg"
          onClick={scrollPrev}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 gap-2 sm:flex">
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg"
          onClick={scrollNext}
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
