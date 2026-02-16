"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HERO_SLIDES = [
  { id: 1, src: "/hero-section/applicances-electronics.jpg", label: "Appliances & Electronics" },
  { id: 2, src: "/hero-section/solar-power-solut.jpg", label: "Solar & Power Solutions" },
  { id: 3, src: "/hero-section/kitthen-applicances.jpg", label: "Kitchen Appliances" },
  { id: 4, src: "/hero-section/tv's-electronics.jpg", label: "TVs & Electronics" },
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
    return () => {
      emblaApi.off("select", onSelect);
    };
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
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-foreground/5 ring-1 ring-foreground/5">
                <Image
                  src={slide.src}
                  alt={slide.label}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
                  priority={slide.id === 1}
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
