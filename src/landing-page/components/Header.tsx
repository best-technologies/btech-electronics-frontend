"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/landing-page/components/UserMenu";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api/auth-api";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function Header() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const userProfile = useAuthStore((s) => s.userProfile);
  const setUserProfile = useAuthStore((s) => s.setUserProfile);
  const isAuthenticated = !!accessToken;

  useEffect(() => {
    if (!accessToken || userProfile) return;
    authApi
      .fetchUserDetails(accessToken)
      .then((data) => {
        if (data) setUserProfile(data);
      })
      .catch(() => {
        // Token may be invalid; clearAuth could be called elsewhere
      });
  }, [accessToken, userProfile, setUserProfile]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            BT
          </span>
          Best Technologies
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => scrollToId("categories")}
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:block"
          >
            Categories
          </button>
          <button
            type="button"
            onClick={() => scrollToId("contact")}
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:block"
          >
            Contact
          </button>

          <Button
            size="sm"
            onClick={() => scrollToId("contact")}
            className="rounded-lg px-4 font-medium shadow-sm"
          >
            Request catalog
          </Button>

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button size="sm" variant="ghost" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
