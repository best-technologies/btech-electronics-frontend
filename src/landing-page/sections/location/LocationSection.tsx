"use client";

import { motion } from "motion/react";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { AnimateOnScroll } from "@/landing-page/components/AnimateOnScroll";
import { MapEmbed } from "@/landing-page/components/MapEmbed";

export function LocationSection() {
  return (
    <section
      className="py-20 sm:py-24 lg:py-28"
      aria-labelledby="location-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll variant="fadeUp" as="header" className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Find us
          </p>
          <h2
            id="location-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Based in Ibadan, serving the region
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Ibadan, Oyo State — strategic for distribution across the South-West
            and beyond. We&apos;re here, we&apos;re real, we&apos;re reachable.
          </p>
          <div
            className="mx-auto mt-6 h-1 w-16 rounded-full bg-primary"
            aria-hidden
          />
        </AnimateOnScroll>

        <motion.div
          className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start"
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
            className="space-y-10"
          >
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin className="h-4 w-4 text-primary" aria-hidden />
                Address
              </h3>
              <address className="text-muted-foreground leading-relaxed not-italic">
                BTech-Electronics
                <br />
                Ibadan, Oyo State
                <br />
                Nigeria
              </address>
              <p className="mt-2 text-sm text-muted-foreground">
                Full address and directions available on request.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                Contact
              </h3>
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <a
                  href="tel:+234"
                  className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden />
                  <span>Phone</span>
                </a>
                <a
                  href="https://wa.me/234"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
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
            className="overflow-hidden rounded-2xl border border-border/60 shadow-lg shadow-foreground/5"
          >
            <MapEmbed />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
