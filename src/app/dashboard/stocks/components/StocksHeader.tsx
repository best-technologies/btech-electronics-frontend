"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

interface StocksHeaderProps {
  onRefresh: () => void;
}

export function StocksHeader({ onRefresh }: StocksHeaderProps) {
  return (
    <motion.div
      className="border-b border-border bg-card"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
    >
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Stocks
            </h1>
            <p className="mt-0.5 text-muted-foreground">
              Master product catalog. Add products here, then use them in consignments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <StocksHeaderAddButton />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StocksHeaderAddButton() {
  return (
    <Button size="sm" className="gap-2 shadow-md shadow-primary/20 hover:shadow-primary/30" asChild>
      <Link href="/dashboard/stocks/new">
        <Plus className="h-4 w-4" />
        Add new stock
      </Link>
    </Button>
  );
}
