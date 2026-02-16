"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section
      id="contact"
      className="py-20 sm:py-24 lg:py-28"
      aria-labelledby="final-cta-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 via-muted/30 to-primary/5 px-8 py-16 text-center shadow-xl shadow-foreground/5 sm:px-12 sm:py-20 lg:px-20 lg:py-24"
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
            className="relative text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]"
          >
            Ready to source in volume?
          </h2>
          <p className="relative mt-4 max-w-xl mx-auto text-base text-muted-foreground sm:text-lg">
            Get our catalog, pricing, or a callback for your category and
            volume.
          </p>
          <motion.div
            className="relative mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              size="lg"
              className="h-12 min-w-[200px] rounded-lg px-6 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              Get in touch
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 min-w-[200px] rounded-lg border-2 px-6 text-base font-medium"
              asChild
            >
              <a
                href="https://wa.me/234"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                WhatsApp
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
