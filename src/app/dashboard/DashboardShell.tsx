"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/sign-in");
    }
  }, [accessToken, router]);

  if (!accessToken) return null;

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0 bg-muted/30">
      <DashboardSidebar />
      <main className="flex-1 min-w-0 min-h-0 overflow-auto">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
}
