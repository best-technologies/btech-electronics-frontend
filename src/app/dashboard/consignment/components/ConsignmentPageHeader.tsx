"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { transition } from "../constants";

interface ConsignmentPageHeaderProps {
  onRefresh: () => void;
  canManageConsignment: boolean;
}

export function ConsignmentPageHeader({ onRefresh, canManageConsignment }: ConsignmentPageHeaderProps) {
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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Consignment</h1>
            <p className="mt-0.5 text-muted-foreground">
              Track incoming shipments, line items, and supplier analytics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            {canManageConsignment ? (
              <Button asChild size="sm" className="gap-2 shadow-md shadow-primary/20 hover:shadow-primary/30">
                <Link href="/dashboard/consignment/new">
                  <Plus className="h-4 w-4" />
                  Register new consignment
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                className="gap-2 shadow-md cursor-not-allowed"
                disabled
                title="You don't have permission to perform this action. Contact an administrator if you need access."
              >
                <Plus className="h-4 w-4" />
                Register new consignment
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
