"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { HeroCarousel } from "@/landing-page/components/HeroCarousel";
import { ArrowRight, Package } from "lucide-react";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function HeroSection() {
  return (
    <section
      className="relative isolate overflow-hidden"
      aria-label="Hero"
    >
      {/* Subtle gradient background */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-3 pt-6 pb-8 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8 lg:pt-32 lg:pb-36">
        <div className="grid items-center gap-5 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            className="mx-auto max-w-2xl text-center lg:max-w-none lg:text-left"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <motion.div
              className="mb-3 inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-medium tracking-wide text-primary sm:mb-6 sm:gap-2 sm:px-4 sm:py-1.5 sm:text-xs"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <Package className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">Electronics distribution · Ibadan, Nigeria</span>
            </motion.div>

            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-[3.5rem]">
              Your distribution partner for{" "}
              <span className="text-primary">electronics</span> — from appliances
              to power solutions.
            </h1>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg sm:leading-relaxed md:text-xl">
              Hundreds of millions in inventory. TVs, freezers, inverters, solar
              and lithium batteries, and more — for distributors, by a
              distributor.
            </p>

            <motion.div
              className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4 sm:justify-center lg:justify-start"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            >
            </motion.div>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full max-w-xl px-0 sm:px-2 lg:max-w-none lg:px-0"
            initial={{ opacity: 0, scale: 0.98, x: 24 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <HeroCarousel />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
