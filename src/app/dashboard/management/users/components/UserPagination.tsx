"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { UserManagementListMeta } from "@/lib/api";

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

interface UserPaginationProps {
  meta: UserManagementListMeta;
  limit: number;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
}

export function UserPagination({
  meta,
  limit,
  onLimitChange,
  onPageChange,
}: UserPaginationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-border bg-card px-6 py-4"
    >
      <p className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{meta.page}</span> of{" "}
        <span className="font-medium text-foreground">{meta.totalPages}</span>
        {" · "}
        <span className="tabular-nums">{meta.total}</span> total
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasPrevPage}
          onClick={() => onPageChange(Math.max(1, meta.page - 1))}
          className="rounded-lg h-9 min-w-[80px]"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.page + 1)}
          className="rounded-lg h-9 min-w-[80px]"
        >
          Next
        </Button>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="flex h-9 w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} per page
            </option>
          ))}
        </select>
      </div>
    </motion.div>
  );
}
