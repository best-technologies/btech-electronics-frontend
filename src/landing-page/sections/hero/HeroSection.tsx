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

      <div className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8 lg:pt-32 lg:pb-36">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            className="mx-auto max-w-2xl text-center lg:max-w-none lg:text-left"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium tracking-wide text-primary"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <Package className="h-3.5 w-3.5" aria-hidden />
              Electronics distribution · Ibadan, Nigeria
            </motion.div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-[3.5rem]">
              Your distribution partner for{" "}
              <span className="text-primary">electronics</span> — from appliances
              to power solutions.
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Hundreds of millions in inventory. TVs, freezers, inverters, solar
              and lithium batteries, and more — for distributors, by a
              distributor.
            </p>

            <motion.div
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Button
                size="lg"
                className="h-12 min-w-[180px] rounded-lg px-6 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                onClick={() => scrollToId("contact")}
              >
                Request catalog
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 min-w-[180px] rounded-lg border-2 px-6 text-base font-medium"
                onClick={() => scrollToId("categories")}
              >
                View product categories
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full max-w-xl lg:max-w-none"
            initial={{ opacity: 0, scale: 0.98, x: 24 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroCarousel />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
