"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

const NO_PERMISSION_TITLE = "You don't have permission to perform this action. Contact an administrator if you need access.";

interface StocksHeaderProps {
  onRefresh: () => void;
  /** When false, Add new stock is shown but disabled. */
  canManageStock?: boolean;
}

export function StocksHeader({ onRefresh, canManageStock = true }: StocksHeaderProps) {
  return (
    <motion.div
      className="border-b border-border bg-card"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
    >
      <div className="w-full px-2.5 py-3 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-foreground sm:text-2xl">
              Stocks
            </h1>
            <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-base">
              Master product catalog. Add products here, then use them in consignments.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-7 gap-1.5 text-[11px] touch-manipulation sm:h-9 sm:gap-2 sm:text-sm"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            {canManageStock ? (
              <Button size="sm" className="h-7 gap-1.5 text-[11px] shadow-md shadow-primary/20 hover:shadow-primary/30 touch-manipulation sm:h-9 sm:gap-2 sm:text-sm" asChild>
                <Link href="/dashboard/stocks/new">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Add new stock</span>
                  <span className="sm:hidden">Add</span>
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-7 gap-1.5 text-[11px] shadow-md cursor-not-allowed touch-manipulation sm:h-9 sm:gap-2 sm:text-sm"
                disabled
                title={NO_PERMISSION_TITLE}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Add new stock</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
