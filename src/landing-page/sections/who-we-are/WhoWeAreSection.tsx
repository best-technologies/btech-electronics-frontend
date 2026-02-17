"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "motion/react";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimateOnScroll } from "@/landing-page/components/AnimateOnScroll";
import { MapEmbed } from "@/landing-page/components/MapEmbed";

const COMPANY_CAROUSEL_SLIDES = [
  { src: "/who-we-are/img-1.JPG", label: "Company / office" },
  { src: "/who-we-are/img-2.JPG", label: "Company / office" },
  { src: "/who-we-are/img-3.JPG", label: "Company / office" },
] as const;

function CompanyImageCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    duration: 20,
  });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 shadow-xl shadow-foreground/5 sm:rounded-2xl">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {COMPANY_CAROUSEL_SLIDES.map((slide) => (
            <div key={slide.src} className="min-w-0 flex-[0_0_100%]">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={slide.src}
                  alt={slide.label}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute left-1 top-1/2 -translate-y-1/2 sm:left-2">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-7 w-7 rounded-full shadow-md touch-manipulation sm:h-9 sm:w-9"
          onClick={scrollPrev}
          aria-label="Previous image"
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 sm:right-2">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-7 w-7 rounded-full shadow-md touch-manipulation sm:h-9 sm:w-9"
          onClick={scrollNext}
          aria-label="Next image"
        >
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
}

export function WhoWeAreSection() {
  return (
    <section
      className="bg-muted/20 py-8 sm:py-24 lg:py-28"
      aria-labelledby="who-we-are-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 sm:space-y-20 lg:space-y-24">
          <AnimateOnScroll variant="fadeUp" as="header" className="text-center">
            <h2
              id="who-we-are-heading"
              className="text-lg font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Who we are
            </h2>
          </AnimateOnScroll>

          <div className="grid gap-5 sm:gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <AnimateOnScroll variant="slideLeft" className="order-2 space-y-3 lg:order-1 sm:space-y-6">
              <h3 className="text-base font-semibold text-foreground sm:text-xl">
                About the company
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed sm:space-y-4 sm:text-base">
                <p>
                  BTech-Electronics is a distribution center in
                  Ibadan, Oyo State. We sit between leading producers and
                  Nigerian wholesalers — holding significant inventory across
                  appliances and power solutions so you can order in volume with
                  confidence.
                </p>
                <p>
                  From TVs and refrigeration to kitchen appliances, solar and
                  lithium batteries, and hybrid and non-hybrid inverters, we
                  serve wholesalers who need a single, reliable partner for bulk
                  supply.
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="slideRight" className="order-1 lg:order-2">
              <CompanyImageCarousel />
            </AnimateOnScroll>
          </div>

          <motion.div
            className="grid gap-4 sm:gap-10 md:grid-cols-2 md:gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.15 } },
              hidden: {},
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
              className="rounded-xl border border-border/60 bg-card p-2.5 shadow-sm sm:rounded-2xl sm:p-8"
            >
              <h3 className="mb-2.5 flex items-center gap-1.5 text-base font-semibold text-foreground sm:mb-4 sm:text-lg">
                <MapPin className="h-4 w-4 text-primary sm:h-5 sm:w-5" aria-hidden />
                Our location
              </h3>
              <address className="text-sm text-muted-foreground leading-relaxed not-italic sm:text-base">
                BTech-Electronics
                <br />
                Ibadan, Oyo State
                <br />
                Nigeria
              </address>
              <p className="mt-2 text-xs text-muted-foreground sm:mt-3 sm:text-sm">
                Full address and directions available on request.
              </p>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="overflow-hidden rounded-xl border border-border/60 sm:rounded-2xl"
            >
              <MapEmbed />
            </motion.div>
          </motion.div>

          <AnimateOnScroll variant="scaleIn">
            <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm sm:rounded-2xl sm:p-8 lg:p-10">
              <h3 className="mb-2.5 text-sm font-semibold text-foreground sm:mb-6 sm:text-lg">
                Leadership
              </h3>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-8">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg sm:h-40 sm:w-40 sm:rounded-2xl">
                  <Image
                    src="/md-img.jpg"
                    alt="Managing Director"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 128px, 160px"
                  />
                </div>
                <div className="min-w-0 space-y-0.5 sm:space-y-2">
                  <p className="text-sm font-semibold text-foreground sm:text-lg">
                    Managing Director
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed sm:text-base">
                    Leading BTech-Electronics&apos; operations and partnerships
                    across the region. Focused on reliable supply and long-term
                    relationships with wholesalers and producers.
                  </p>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
