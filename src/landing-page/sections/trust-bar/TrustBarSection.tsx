export function TrustBarSection() {
  return (
    <section
      className="w-full border-y border-border bg-muted/40 py-4"
      aria-label="Trust"
    >
      <div className="w-full px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 2xl:px-24">
        <p className="text-center text-sm font-medium text-muted-foreground tracking-wide">
          Serving wholesalers across Oyo and beyond
          <span className="mx-2 text-border" aria-hidden>
            •
          </span>
          Ibadan-based
          <span className="mx-2 text-border" aria-hidden>
            •
          </span>
          Major appliance & power categories
        </p>
      </div>
    </section>
  );
}
