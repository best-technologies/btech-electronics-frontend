"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export function AuthRehydrate() {
  const setHasHydrated = useAuthStore((s) => s.setHasHydrated);
  useEffect(() => {
    const p = (useAuthStore as any).persist;
    if (!p) return;
    if (p.hasHydrated && p.hasHydrated()) setHasHydrated(true);
    else {
      const u = p.onFinishHydration && p.onFinishHydration(() => setHasHydrated(true));
      if (p.rehydrate) p.rehydrate();
      return () => u && u();
    }
  }, [setHasHydrated]);
  return null;
}
