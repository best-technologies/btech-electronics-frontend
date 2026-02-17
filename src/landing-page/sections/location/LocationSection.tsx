"use client";

import { motion } from "motion/react";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { AnimateOnScroll } from "@/landing-page/components/AnimateOnScroll";
import { MapEmbed } from "@/landing-page/components/MapEmbed";

export function LocationSection() {
  return (
    <section
      className="py-8 sm:py-24 lg:py-28"
      aria-labelledby="location-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll variant="fadeUp" as="header" className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary sm:text-sm">
            Find us
          </p>
          <h2
            id="location-heading"
            className="mt-2 text-lg font-bold tracking-tight text-foreground sm:mt-3 sm:text-4xl"
          >
            Based in Ibadan, serving the region
          </h2>
          <p className="mt-2 text-xs text-muted-foreground sm:mt-4 sm:text-base md:text-lg">
            Ibadan, Oyo State — strategic for distribution across the South-West
            and beyond. We&apos;re here, we&apos;re real, we&apos;re reachable.
          </p>
          <div
            className="mx-auto mt-2.5 h-1 w-16 rounded-full bg-primary sm:mt-6"
            aria-hidden
          />
        </AnimateOnScroll>

        <motion.div
          className="mt-6 grid gap-4 sm:mt-16 sm:gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-60px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
            hidden: {},
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -32 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 0.5 }}
            className="space-y-4 sm:space-y-10"
          >
            <div className="rounded-xl border border-border/60 bg-card p-2.5 shadow-sm sm:rounded-2xl sm:p-8">
              <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-foreground sm:mb-4 sm:text-sm">
                <MapPin className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" aria-hidden />
                Address
              </h3>
              <address className="text-xs text-muted-foreground leading-relaxed not-italic sm:text-base">
                BTech-Electronics
                <br />
                Ibadan, Oyo State
                <br />
                Nigeria
              </address>
              <p className="mt-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
                Full address and directions available on request.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-2.5 shadow-sm sm:rounded-2xl sm:p-8">
              <h3 className="mb-2 text-xs font-semibold text-foreground sm:mb-4 sm:text-sm">
                Contact
              </h3>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                <a
                  href="tel:+234"
                  className="inline-flex min-h-[2.25rem] items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground touch-manipulation sm:min-h-[2.75rem] sm:gap-2 sm:text-base"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
                  <span>Phone</span>
                </a>
                <a
                  href="https://wa.me/234"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[2.25rem] items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground touch-manipulation sm:min-h-[2.75rem] sm:gap-2 sm:text-base"
                >
                  <MessageCircle className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, x: 32 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="overflow-hidden rounded-xl border border-border/60 shadow-lg shadow-foreground/5 sm:rounded-2xl"
          >
            <MapEmbed />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
