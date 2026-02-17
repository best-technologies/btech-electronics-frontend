"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore, selectHasHydrated } from "@/stores/authStore";
import { authApi } from "@/lib/api/auth-api";
import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const userProfile = useAuthStore((s) => s.userProfile);
  const setUserProfile = useAuthStore((s) => s.setUserProfile);
  const hasHydrated = useAuthStore(selectHasHydrated);
  const setHasHydrated = useAuthStore((s) => s.setHasHydrated);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // With skipHydration: true we must trigger rehydration on the client, then mark hydrated when done.
  useEffect(() => {
    const persist = (useAuthStore as unknown as { persist?: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void; rehydrate: () => void | Promise<void> } }).persist;
    if (!persist) return;
    if (persist.hasHydrated?.()) {
      setHasHydrated(true);
      return;
    }
    const unsub = persist.onFinishHydration?.(() => setHasHydrated(true));
    persist.rehydrate?.();
    return () => unsub?.();
  }, [setHasHydrated]);

  // Fetch user profile when we have a token but no profile (e.g. after refresh; profile is not persisted).
  useEffect(() => {
    if (!hasHydrated || !accessToken || userProfile) return;
    authApi
      .fetchUserDetails(accessToken)
      .then((data) => {
        if (data) setUserProfile(data);
      })
      .catch(() => {});
  }, [hasHydrated, accessToken, userProfile, setUserProfile]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken) {
      router.replace("/");
    }
  }, [hasHydrated, accessToken, router]);

  if (!hasHydrated) return null;
  if (!accessToken) return null;

  return (
    <div className="flex h-screen min-h-0 flex-col bg-muted/30 lg:flex-row">
      {/* Mobile top bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-card px-2.5 lg:hidden">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 font-semibold text-foreground"
        >
          <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md">
            <Image
              src="/btech-logo.jpg"
              alt="BTech-Electronics"
              fill
              className="object-contain"
              sizes="24px"
            />
          </span>
          <span className="text-xs">Dashboard</span>
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 touch-manipulation"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
          aria-hidden
        />
      )}

      {/* Sidebar: always visible on lg+, slide-out drawer on mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-64 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DashboardSidebar onNavigate={closeSidebar} />
      </div>

      <main className="flex-1 min-w-0 min-h-0 overflow-auto">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
}
