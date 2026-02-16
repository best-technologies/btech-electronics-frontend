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
    <div className="relative overflow-hidden rounded-2xl border border-border/60 shadow-xl shadow-foreground/5">
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
      <div className="absolute left-2 top-1/2 -translate-y-1/2">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-9 w-9 rounded-full shadow-md"
          onClick={scrollPrev}
          aria-label="Previous image"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-9 w-9 rounded-full shadow-md"
          onClick={scrollNext}
          aria-label="Next image"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function WhoWeAreSection() {
  return (
    <section
      className="bg-muted/20 py-20 sm:py-24 lg:py-28"
      aria-labelledby="who-we-are-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-20 lg:space-y-24">
          <AnimateOnScroll variant="fadeUp" as="header" className="text-center">
            <h2
              id="who-we-are-heading"
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Who we are
            </h2>
          </AnimateOnScroll>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <AnimateOnScroll variant="slideLeft" className="order-2 space-y-6 lg:order-1">
              <h3 className="text-xl font-semibold text-foreground">
                About the company
              </h3>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
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
            className="grid gap-10 md:grid-cols-2 md:gap-12"
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
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <MapPin className="h-5 w-5 text-primary" aria-hidden />
                Our location
              </h3>
              <address className="text-muted-foreground leading-relaxed not-italic">
                BTech-Electronics
                <br />
                Ibadan, Oyo State
                <br />
                Nigeria
              </address>
              <p className="mt-3 text-sm text-muted-foreground">
                Full address and directions available on request.
              </p>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="overflow-hidden rounded-2xl border border-border/60"
            >
              <MapEmbed />
            </motion.div>
          </motion.div>

          <AnimateOnScroll variant="scaleIn">
            <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm lg:p-10">
              <h3 className="mb-6 text-lg font-semibold text-foreground">
                Leadership
              </h3>
              <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl sm:h-40 sm:w-40">
                  <Image
                    src="/md-img.jpg"
                    alt="Managing Director"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 128px, 160px"
                  />
                </div>
                <div className="min-w-0 space-y-2">
                  <p className="text-lg font-semibold text-foreground">
                    Managing Director
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
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
