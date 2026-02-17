"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";

interface ConsignmentEmptyStateProps {
  canManageConsignment: boolean;
}

export function ConsignmentEmptyState({ canManageConsignment }: ConsignmentEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 px-4"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
        <Package className="h-7 w-7" />
      </div>
      <p className="text-sm font-medium text-foreground">No consignments match your filters</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Try adjusting filters or register a new consignment.
      </p>
      {canManageConsignment ? (
        <Button asChild className="mt-4 gap-2 rounded-lg" size="sm">
          <Link href="/dashboard/consignment/new">
            <Plus className="h-4 w-4" />
            Register consignment
          </Link>
        </Button>
      ) : (
        <Button
          className="mt-4 gap-2 rounded-lg cursor-not-allowed"
          size="sm"
          disabled
          title="You don't have permission to perform this action. Contact an administrator if you need access."
        >
          <Plus className="h-4 w-4" />
          Register consignment
        </Button>
      )}
    </motion.div>
  );
}
