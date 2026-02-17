"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuthStore, selectHasManagePayment } from "@/stores/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ViewOnlyBanner } from "@/components/ViewOnlyBanner";
import { CreditCard, ArrowLeft } from "lucide-react";

export default function PaymentsPage() {
  const canManagePayment = useAuthStore(selectHasManagePayment);

  useEffect(() => {
    document.title = "Payments | BTech-Electronics";
  }, []);

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-2.5 py-3 sm:px-6 sm:py-6 lg:px-8">
          <h1 className="text-sm font-bold tracking-tight text-foreground sm:text-2xl">Payments</h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-base">
            Track payments and revenue.
          </p>
        </div>
      </div>
      {!canManagePayment && (
        <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">
          <ViewOnlyBanner areaName="payments" />
        </div>
      )}
      <div className="mx-auto max-w-7xl px-2.5 py-3 sm:px-6 sm:py-8 lg:px-8">
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-10 sm:py-16">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground mb-3 sm:h-14 sm:w-14 sm:rounded-xl sm:mb-4">
              <CreditCard className="h-5 w-5 sm:h-7 sm:w-7" />
            </span>
            <p className="text-xs text-muted-foreground text-center sm:text-base">
              Payment management coming soon.
            </p>
            <Button variant="outline" size="sm" className="mt-3 gap-1.5 h-7 text-[11px] touch-manipulation sm:mt-4 sm:gap-2 sm:h-9 sm:text-sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
