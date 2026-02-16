"use client";

import { motion } from "motion/react";
import { AnimateOnScroll } from "@/landing-page/components/AnimateOnScroll";

const STEPS = [
  {
    number: 1,
    title: "Get in touch",
    description: "Tell us your category and volume.",
  },
  {
    number: 2,
    title: "Catalog & quote",
    description: "We share product options and terms.",
  },
  {
    number: 3,
    title: "Order & delivery",
    description:
      "We handle the rest so you can focus on your customers.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      className="bg-muted/20 py-20 sm:py-24 lg:py-28"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll variant="fadeUp" as="header" className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Process
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            How we work with wholesalers
          </h2>
          <div
            className="mx-auto mt-6 h-1 w-16 rounded-full bg-primary"
            aria-hidden
          />
        </AnimateOnScroll>

        <motion.ol
          className="relative mt-16 grid gap-12 sm:grid-cols-3 sm:gap-8 lg:gap-12 list-none p-0 m-0"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-80px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
            hidden: {},
          }}
        >
          <div
            className="absolute left-1/2 top-10 hidden h-0.5 w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent sm:block"
            aria-hidden
          />

          {STEPS.map((step) => (
            <motion.li
              key={step.number}
              className="relative flex flex-col items-center text-center"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <motion.div
                className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-primary bg-background text-xl font-bold text-primary shadow-lg shadow-foreground/5"
                whileHover={{ scale: 1.08, rotate: 5 }}
              >
                {step.number}
              </motion.div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 max-w-xs text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
