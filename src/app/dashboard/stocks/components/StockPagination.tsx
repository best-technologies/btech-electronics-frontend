"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { StockListMeta } from "@/lib/api";

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

interface StockPaginationProps {
  meta: StockListMeta;
  limit: number;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
}

export function StockPagination({
  meta,
  limit,
  onLimitChange,
  onPageChange,
}: StockPaginationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-2 py-2 sm:gap-5 sm:rounded-xl sm:px-6 sm:py-4"
    >
      <p className="text-[10px] text-muted-foreground sm:text-sm">
        Page <span className="font-medium text-foreground">{meta.page}</span> of{" "}
        <span className="font-medium text-foreground">{meta.totalPages}</span>
        {" · "}
        <span className="tabular-nums">{meta.total}</span> total
      </p>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasPrevPage}
          onClick={() => onPageChange(Math.max(1, meta.page - 1))}
          className="rounded-md h-7 min-w-[44px] text-[11px] touch-manipulation sm:rounded-lg sm:h-9 sm:min-w-[80px] sm:text-sm"
        >
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.page + 1)}
          className="rounded-md h-7 min-w-[44px] text-[11px] touch-manipulation sm:rounded-lg sm:h-9 sm:min-w-[80px] sm:text-sm"
        >
          Next
        </Button>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="flex h-7 w-24 rounded-md border border-input bg-background px-1.5 py-1 text-[11px] sm:h-9 sm:w-32 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm"
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>{n} per page</option>
          ))}
        </select>
      </div>
    </motion.div>
  );
}
