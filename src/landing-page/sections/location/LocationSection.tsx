import { ImagePlaceholder } from "@/landing-page/components/ImagePlaceholder";
import { MapPin, Phone, MessageCircle } from "lucide-react";

export function LocationSection() {
  return (
    <section
      className="w-full py-16 lg:py-20 xl:py-24 bg-muted/30"
      aria-labelledby="location-heading"
    >
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 2xl:px-24">
        <header className="text-center mb-12 lg:mb-14">
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
            Find us
          </p>
          <h2
            id="location-heading"
            className="text-3xl sm:text-4xl lg:text-[2.5rem] font-semibold tracking-tight text-foreground leading-tight"
          >
            Based in Ibadan, serving the region
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Ibadan, Oyo State — strategic for distribution across the
            South-West and beyond. We&apos;re here, we&apos;re real, we&apos;re
            reachable.
          </p>
          <div
            className="mt-6 w-16 h-0.5 bg-primary mx-auto rounded-full"
            aria-hidden
          />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-primary" aria-hidden />
                Address
              </h3>
              <address className="text-muted-foreground leading-relaxed not-italic">
                Best Technologies Electronics
                <br />
                Ibadan, Oyo State
                <br />
                Nigeria
              </address>
              <p className="mt-2 text-sm text-muted-foreground">
                Full address and directions available on request.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Contact
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="tel:+234"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden />
                  <span>Phone</span>
                </a>
                <a
                  href="https://wa.me/234"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          <div className="w-full min-w-0">
            <ImagePlaceholder
              aspectRatio="video"
              label="Map / location"
              className="rounded-xl overflow-hidden min-h-[260px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
