import {
  Package,
  Layers,
  MapPin,
  ShieldCheck,
} from "lucide-react";

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
      className="w-full py-16 lg:py-20 xl:py-24 bg-muted/30"
      aria-labelledby="why-partner-heading"
    >
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 2xl:px-24">
        <header className="text-center mb-12 lg:mb-14">
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
            Why choose us
          </p>
          <h2
            id="why-partner-heading"
            className="text-3xl sm:text-4xl lg:text-[2.5rem] font-semibold tracking-tight text-foreground leading-tight"
          >
            Why wholesalers choose Best Technologies
          </h2>
          <div className="mt-6 w-16 h-0.5 bg-primary mx-auto rounded-full" aria-hidden />
        </header>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 list-none p-0 m-0">
          {DIFFERENTIATORS.map(({ id, icon: Icon, title, description }) => (
            <li key={id}>
              <div className="h-full rounded-xl border border-border bg-card p-6 lg:p-7 flex flex-col">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
