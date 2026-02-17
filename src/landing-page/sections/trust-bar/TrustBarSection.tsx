"use client";

import { motion } from "motion/react";

export function TrustBarSection() {
  return (
    <motion.section
      className="border-y border-border/60 bg-muted/30 py-2.5 sm:py-5"
      aria-label="Trust indicators"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, margin: "-20px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-center sm:gap-x-6">
          <p className="text-[10px] font-medium text-muted-foreground sm:text-sm">
            Serving wholesalers across Oyo and beyond
          </p>
          <span className="hidden text-border sm:inline" aria-hidden>
            •
          </span>
          <p className="text-[10px] font-medium text-muted-foreground sm:text-sm">
            Ibadan-based distribution hub
          </p>
          <span className="hidden text-border sm:inline" aria-hidden>
            •
          </span>
          <p className="text-[10px] font-medium text-muted-foreground sm:text-sm">
            Major appliances &amp; power solutions
          </p>
        </div>
      </div>
    </motion.section>
  );
}
