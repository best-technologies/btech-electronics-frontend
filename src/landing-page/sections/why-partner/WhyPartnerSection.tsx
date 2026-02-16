"use client";

import { motion } from "motion/react";
import {
  Package,
  Layers,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { AnimateOnScroll } from "@/landing-page/components/AnimateOnScroll";

const DIFFERENTIATORS = [
  {
    id: "volume",
    icon: Package,
    title: "Volume-ready",
    description:
      "Inventory and processes built for bulk, not unit sales.",
  },
  {
    id: "range",
    icon: Layers,
    title: "Wide range",
    description:
      "From TVs and freezers to inverters and batteries under one roof.",
  },
  {
    id: "location",
    icon: MapPin,
    title: "Strategic location",
    description:
      "Ibadan as a distribution hub for the region.",
  },
  {
    id: "reliable",
    icon: ShieldCheck,
    title: "Reliable supply",
    description:
      "Direct link to producers; you deal with one trusted partner.",
  },
] as const;

export function WhyPartnerSection() {
  return (
    <section
      className="py-20 sm:py-24 lg:py-28"
      aria-labelledby="why-partner-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll variant="fadeUp" as="header" className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Why choose us
          </p>
          <h2
            id="why-partner-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Why wholesalers choose BTech-Electronics
          </h2> 
          <div
            className="mx-auto mt-6 h-1 w-16 rounded-full bg-primary"
            aria-hidden
          />
        </AnimateOnScroll>

        <motion.ul
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 list-none p-0 m-0"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-60px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            hidden: {},
          }}
        >
          {DIFFERENTIATORS.map(({ id, icon: Icon, title, description }) => (
            <motion.li
              key={id}
              variants={{
                hidden: { opacity: 0, y: 32 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <div className="group h-full rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-foreground/5 lg:p-8">
                <motion.div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15"
                  whileHover={{ scale: 1.05, rotate: 3 }}
                >
                  <Icon className="h-6 w-6" aria-hidden />
                </motion.div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
