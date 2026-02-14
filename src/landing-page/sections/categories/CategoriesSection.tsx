"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ImagePlaceholder } from "@/landing-page/components/ImagePlaceholder";

/** Currently available stock — single horizontal row */
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

/* Commented out: full category groups (restore when stock expands)
const CATEGORY_GROUPS = [
  {
    id: "kitchen",
    title: "Kitchen items",
    items: [
      "Washing machine",
      "Refrigerator",
      "Oven",
      "Toaster",
      "Juice extractor",
      "Air fryer",
      "Microwave",
      "Blender",
      "Electric kettle",
      "Gas cooker",
      "Water dispenser",
      "Food processor",
    ],
  },
  {
    id: "household",
    title: "Household items",
    items: [
      "TV",
      "Speakers",
      "Standing fan",
      "Table fan",
      "Air conditioner",
      "Iron",
      "Vacuum cleaner",
      "Water heater",
      "Generator",
      "Home theatre",
      "Soundbar",
      "Set-top box",
    ],
  },
  {
    id: "solar",
    title: "Solar, inverters & batteries",
    items: [
      "Solar panel",
      "Hybrid inverter",
      "Non-hybrid inverter",
      "Lithium battery",
      "Tubular battery",
      "Solar charge controller",
      "UPS",
      "Inverter battery",
      "Solar inverter",
      "Battery charger",
      "Power inverter",
      "Deep cycle battery",
    ],
  },
  {
    id: "computing",
    title: "Computing & office",
    items: [
      "Laptop",
      "Desktop",
      "Monitor",
      "Printer",
      "Keyboard",
      "Mouse",
      "UPS",
      "Webcam",
      "Router",
      "External HDD",
      "Projector",
      "Laptop bag",
    ],
  },
  {
    id: "small-appliances",
    title: "Small appliances & personal care",
    items: [
      "Hair dryer",
      "Electric shaver",
      "Trimmer",
      "Electric toothbrush",
      "Massager",
      "Sewing machine",
      "Steam iron",
      "Coffee maker",
      "Mixer grinder",
      "Electric cooker",
      "Induction cooker",
      "Sandwich maker",
    ],
  },
  {
    id: "cooling",
    title: "Cooling & refrigeration",
    items: [
      "Deep freezer",
      "Display fridge",
      "Water cooler",
      "Ice maker",
      "Wine cooler",
      "Medical fridge",
      "Chest freezer",
      "Upright freezer",
      "Beverage cooler",
      "Commercial refrigerator",
      "Blast chiller",
      "Cold room unit",
    ],
  },
] as const;
*/

export function CategoriesSection() {
  return (
    <section
      id="categories"
      className="w-full py-16 lg:py-20 xl:py-24"
      aria-labelledby="categories-heading"
    >
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 2xl:px-24">
        <header className="mb-10 lg:mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
            Available now
          </p>
          <h2
            id="categories-heading"
            className="text-3xl sm:text-4xl lg:text-[2.5rem] font-semibold tracking-tight text-foreground leading-tight"
          >
            Currently in stock
          </h2>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Limited stock — enquire for availability and wholesale terms.
          </p>
          <div className="mt-6 w-16 h-0.5 bg-primary mx-auto rounded-full" aria-hidden />
        </header>

        <div className="overflow-x-auto pb-2 scroll-smooth [scrollbar-width:thin] -mx-1">
          <ul className="flex gap-5 min-w-max list-none p-0 m-0">
            {CURRENT_STOCK_ITEMS.map((item) => (
              <li key={item}>
                <Card className="w-[200px] sm:w-[224px] shrink-0 overflow-hidden border-border bg-card transition-shadow hover:shadow-md">
                  <CardHeader className="p-0">
                    <ImagePlaceholder
                      aspectRatio="square"
                      label={item}
                      className="rounded-t-xl min-h-[200px] sm:min-h-[224px]"
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="font-medium text-foreground text-sm leading-tight line-clamp-2">
                      {item}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
