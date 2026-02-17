"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore, selectHasHydrated } from "@/stores/authStore";
import { authApi } from "@/lib/api/auth-api";
import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const userProfile = useAuthStore((s) => s.userProfile);
  const setUserProfile = useAuthStore((s) => s.setUserProfile);
  const hasHydrated = useAuthStore(selectHasHydrated);
  const setHasHydrated = useAuthStore((s) => s.setHasHydrated);

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
    <div className="flex h-screen min-h-0 bg-muted/30">
      <DashboardSidebar />
      <main className="flex-1 min-w-0 min-h-0 overflow-auto">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
}
