"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function ManagementPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);

  useEffect(() => {
    document.title = "Management | BTech-Electronics";
  }, []);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
    }
  }, [role, router]);

  if (role !== "admin") {
    return null;
  }

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Management
          </h1>
          <p className="mt-0.5 text-muted-foreground">
            Warehouse admin tools and settings.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-4">
              <Settings className="h-7 w-7" />
            </span>
            <p className="text-muted-foreground text-center">
              Management content can be added here.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
