"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowLeft } from "lucide-react";

export default function PaymentsPage() {
  useEffect(() => {
    document.title = "Payments | BTech-Electronics";
  }, []);

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payments</h1>
          <p className="mt-0.5 text-muted-foreground">
            Track payments and revenue.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-4">
              <CreditCard className="h-7 w-7" />
            </span>
            <p className="text-muted-foreground text-center">
              Payment management coming soon.
            </p>
            <Button variant="outline" size="sm" className="mt-4 gap-2" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
