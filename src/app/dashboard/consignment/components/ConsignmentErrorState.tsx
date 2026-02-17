"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ConsignmentErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ConsignmentErrorState({ message, onRetry }: ConsignmentErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-destructive/30 bg-destructive/5 p-6"
    >
      <h3 className="text-lg font-semibold text-destructive">Unable to load consignments</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {message ?? "Something went wrong. Please try again."}
      </p>
      <Button variant="outline" size="sm" className="mt-4 gap-2 rounded-lg" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </motion.div>
  );
}
