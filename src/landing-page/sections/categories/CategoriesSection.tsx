"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ImagePlaceholder } from "@/landing-page/components/ImagePlaceholder";
import { AnimateOnScroll } from "@/landing-page/components/AnimateOnScroll";

const CURRENT_STOCK_ITEMS = [
  "Juice Extractor",
  "Manual Hair fryer",
  "Digital Hair fryer",
  "TB-15E Blender",
  "Hot Plate",
  "15L Yam Pounder",
  "TF-16A Solar Fan",
  "FS-188",
  "FS-738",
  "FS-628",
] as const;

export function CategoriesSection() {
  return (
    <section
      id="categories"
      className="py-20 sm:py-24 lg:py-28"
      aria-labelledby="categories-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll variant="fadeUp" as="header" className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Available now
          </p>
          <h2
            id="categories-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Currently in stock
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Limited stock — enquire for availability and wholesale terms.
          </p>
          <div
            className="mx-auto mt-6 h-1 w-16 rounded-full bg-primary"
            aria-hidden
          />
        </AnimateOnScroll>

        <motion.div
          className="mt-12 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:thin]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-50px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
            hidden: {},
          }}
        >
          <ul className="flex gap-6 min-w-max list-none p-0">
            {CURRENT_STOCK_ITEMS.map((item) => (
              <motion.li
                key={item}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card className="group w-[220px] shrink-0 overflow-hidden border-border/80 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-foreground/5 sm:w-[240px]">
                  <CardHeader className="p-0">
                    <div className="overflow-hidden rounded-t-xl">
                      <ImagePlaceholder
                        aspectRatio="square"
                        label={item}
                        className="min-h-[200px] transition-transform duration-300 group-hover:scale-105 sm:min-h-[220px]"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                      {item}
                    </p>
                  </CardContent>
                </Card>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
