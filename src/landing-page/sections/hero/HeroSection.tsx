"use client";

import { Button } from "@/components/ui/button";
import { ImagePlaceholder } from "@/landing-page/components/ImagePlaceholder";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function HeroSection() {
  return (
    <section
      className="relative w-full min-h-[88vh] flex flex-col lg:flex-row lg:items-center py-16 lg:py-20 xl:py-24"
      aria-label="Hero"
    >
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:grid lg:grid-cols-[1.15fr_1fr] lg:gap-12 xl:gap-16 2xl:gap-20 items-center gap-10 px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 2xl:px-24">
        <div className="flex flex-col justify-center space-y-6 lg:space-y-8 text-center lg:text-left min-w-0 w-full">
          <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl 2xl:text-[3.5rem] font-semibold tracking-tight text-foreground leading-[1.08]">
            Your distribution partner for electronics — from appliances to power
            solutions.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 lg:max-w-none">
            Hundreds of millions in inventory. TVs, freezers, inverters, solar
            and lithium batteries, and more — for distributors, by a distributor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-1">
            <Button
              size="lg"
              className="text-base min-w-[180px]"
              onClick={() => scrollToId("contact")}
            >
              Request catalog
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base min-w-[180px]"
              onClick={() => scrollToId("categories")}
            >
              View product categories
            </Button>
          </div>
        </div>
        <div className="w-full min-w-0 flex items-center justify-center lg:justify-end">
          <ImagePlaceholder
            aspectRatio="video"
            label="Hero image"
            className="rounded-lg overflow-hidden min-h-[260px] sm:min-h-[300px] lg:min-h-[340px] w-full"
          />
        </div>
      </div>
    </section>
  );
}
