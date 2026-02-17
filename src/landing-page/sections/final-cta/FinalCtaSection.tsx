"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section
      id="contact"
      className="py-8 sm:py-24 lg:py-28"
      aria-labelledby="final-cta-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-muted/30 to-primary/5 px-3 py-8 text-center shadow-xl shadow-foreground/5 sm:rounded-3xl sm:px-12 sm:py-20 lg:px-20 lg:py-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        >
          {/* Decorative elements */}
          <div
            className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
            aria-hidden
          />

          <h2
            id="final-cta-heading"
            className="relative text-lg font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]"
          >
            Ready to source in volume?
          </h2>
          <p className="relative mt-2 max-w-xl mx-auto text-xs text-muted-foreground sm:mt-4 sm:text-base md:text-lg">
            Get our catalog, pricing, or a callback for your category and
            volume.
          </p>
          <motion.div
            className="relative mt-5 flex flex-col gap-2 sm:mt-10 sm:flex-row sm:gap-4 sm:justify-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              size="lg"
              className="h-9 min-h-[2.25rem] w-full touch-manipulation rounded-lg px-4 text-sm font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 sm:h-12 sm:min-h-[2.75rem] sm:min-w-[200px] sm:w-auto sm:px-6 sm:text-base"
            >
              Get in touch
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 shrink-0 sm:ml-2 sm:h-4 sm:w-4" aria-hidden />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-9 min-h-[2.25rem] w-full touch-manipulation rounded-lg border-2 px-4 text-sm font-medium sm:h-12 sm:min-h-[2.75rem] sm:min-w-[200px] sm:w-auto sm:px-6 sm:text-base"
              asChild
            >
              <a
                href="https://wa.me/234"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-1.5 sm:w-auto sm:gap-2"
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                WhatsApp
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
