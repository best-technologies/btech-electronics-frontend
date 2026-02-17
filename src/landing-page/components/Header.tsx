"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Menu, LayoutDashboard, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/landing-page/components/UserMenu";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api/auth-api";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function Header() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const userProfile = useAuthStore((s) => s.userProfile);
  const setUserProfile = useAuthStore((s) => s.setUserProfile);
  const clearAuth = useAuthStore((s) => s.clearAuth);
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

  function handleSignOut() {
    clearAuth();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 safe-area-inset-top">
      <nav
        className="mx-auto flex h-11 min-h-[2.75rem] max-w-7xl items-center justify-between gap-1.5 px-2.5 sm:h-16 sm:min-h-0 sm:gap-2 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-1.5 text-xs font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90 sm:gap-2 sm:text-lg"
        >
          <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md sm:h-9 sm:w-9 sm:rounded-lg">
            <Image
              src="/btech-logo.jpg"
              alt="BTech-Electronics"
              fill
              className="object-contain"
              sizes="36px"
              priority
            />
          </span>
          <span className="hidden truncate sm:inline">BTech-Electronics</span>
        </Link>

        <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
          {/* Desktop nav links */}
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
            className="h-7 min-h-[1.75rem] touch-manipulation rounded-md px-2.5 text-[11px] font-medium shadow-sm sm:h-9 sm:min-h-[2.25rem] sm:rounded-lg sm:px-4 sm:text-sm"
          >
            <span className="sm:hidden">Catalog</span>
            <span className="hidden sm:inline">Request catalog</span>
          </Button>

          {/* Desktop only: user menu or sign in */}
          {isAuthenticated ? (
            <div className="hidden sm:block">
              <UserMenu />
            </div>
          ) : (
            <Button size="sm" variant="ghost" asChild className="hidden h-9 min-h-[2.25rem] touch-manipulation sm:inline-flex">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}

          <ThemeToggle />

          {/* Mobile only: single menu at the edge (Categories, Contact, Account) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 touch-manipulation sm:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {isAuthenticated ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/sign-in" className="flex items-center gap-2">
                    Sign in
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
