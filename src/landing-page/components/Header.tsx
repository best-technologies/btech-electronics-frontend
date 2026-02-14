"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between w-full max-w-[1440px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 2xl:px-24">
        <Link
          href="/"
          className="font-semibold text-foreground text-lg tracking-tight hover:opacity-90 transition-opacity"
        >
          Best Technologies
        </Link>
        <nav className="flex items-center gap-6" aria-label="Main">
          <button
            type="button"
            onClick={() => scrollToId("categories")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Categories
          </button>
          <Button size="sm" variant="ghost" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button size="sm" onClick={() => scrollToId("contact")}>
            Request catalog
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
