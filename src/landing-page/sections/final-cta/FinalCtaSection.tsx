"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section
      id="contact"
      className="w-full py-16 lg:py-20 xl:py-24"
      aria-labelledby="final-cta-heading"
    >
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 2xl:px-24">
        <div className="rounded-2xl border border-border bg-muted/40 px-8 py-12 sm:px-12 sm:py-14 lg:px-16 lg:py-16 text-center">
          <h2
            id="final-cta-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground"
          >
            Ready to source in volume?
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Get our catalog, pricing, or a callback for your category and
            volume.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base min-w-[200px]">
              Get in touch
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base min-w-[200px]"
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
          </div>
        </div>
      </div>
    </section>
  );
}
