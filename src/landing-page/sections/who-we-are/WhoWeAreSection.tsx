import { ImagePlaceholder } from "@/landing-page/components/ImagePlaceholder";
import { MapPin } from "lucide-react";

export function WhoWeAreSection() {
  return (
    <section
      className="w-full py-16 lg:py-20 xl:py-24 bg-muted/30"
      aria-labelledby="who-we-are-heading"
    >
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 2xl:px-24 space-y-16 lg:space-y-20">
        <h2
          id="who-we-are-heading"
          className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground text-center"
        >
          Who we are
        </h2>

        {/* Company story + image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="space-y-5 order-2 lg:order-1">
            <h3 className="text-lg font-semibold text-foreground">
              About the company
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Best Technologies Electronics is a distribution center in Ibadan,
              Oyo State. We sit between leading producers and Nigerian
              wholesalers — holding significant inventory across appliances and
              power solutions so you can order in volume with confidence.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              From TVs and refrigeration to kitchen appliances, solar and
              lithium batteries, and hybrid and non-hybrid inverters, we serve
              wholesalers who need a single, reliable partner for bulk supply.
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <ImagePlaceholder
              aspectRatio="4/3"
              label="Company / office"
              className="rounded-lg overflow-hidden min-h-[220px]"
            />
          </div>
        </div>

        {/* Location / address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" aria-hidden />
              Our location
            </h3>
            <address className="text-muted-foreground leading-relaxed not-italic">
              Best Technologies Electronics
              <br />
              Ibadan, Oyo State
              <br />
              Nigeria
            </address>
            <p className="mt-3 text-sm text-muted-foreground">
              Full address and directions available on request.
            </p>
          </div>
          <div>
            <ImagePlaceholder
              aspectRatio="video"
              label="Map / location"
              className="rounded-lg overflow-hidden min-h-[160px]"
            />
          </div>
        </div>

        {/* Leadership — MD */}
        <div className="border border-border rounded-xl bg-background p-8 lg:p-10">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Leadership
          </h3>
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="shrink-0">
              <ImagePlaceholder
                aspectRatio="square"
                label="Managing Director"
                className="rounded-full w-32 h-32 sm:w-40 sm:h-40 overflow-hidden"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <p className="font-semibold text-foreground text-lg">
                Managing Director
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Leading Best Technologies&apos; operations and partnerships
                across the region. Focused on reliable supply and long-term
                relationships with wholesalers and producers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
