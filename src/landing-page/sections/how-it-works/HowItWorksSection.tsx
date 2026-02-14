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
      className="w-full py-16 lg:py-20 xl:py-24"
      aria-labelledby="how-it-works-heading"
    >
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 2xl:px-24">
        <header className="text-center mb-12 lg:mb-14">
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
            Process
          </p>
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl lg:text-[2.5rem] font-semibold tracking-tight text-foreground leading-tight"
          >
            How we work with wholesalers
          </h2>
          <div
            className="mt-6 w-16 h-0.5 bg-primary mx-auto rounded-full"
            aria-hidden
          />
        </header>

        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-10 lg:gap-12 list-none p-0 m-0">
          {STEPS.map((step) => (
            <li
              key={step.number}
              className="flex flex-col items-center text-center"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-lg font-semibold text-primary mb-5">
                {step.number}
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
