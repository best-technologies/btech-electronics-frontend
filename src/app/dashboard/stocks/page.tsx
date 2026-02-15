"use client";

import { useEffect } from "react";
import { Boxes } from "lucide-react";

export default function StocksPage() {
  useEffect(() => {
    document.title = "Stocks | Best Technologies";
  }, []);

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Stocks
              </h1>
              <p className="mt-0.5 text-muted-foreground">
                Manage inventory and stock levels.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-24 px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
            <Boxes className="h-7 w-7" />
          </div>
          <p className="text-sm font-medium text-foreground">Stocks</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Content coming soon.
          </p>
        </div>
      </div>
    </>
  );
}
