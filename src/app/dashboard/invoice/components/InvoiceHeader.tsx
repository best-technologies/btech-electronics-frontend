"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";

interface InvoiceHeaderProps {
  onRefresh: () => void;
  /** When false, New invoice is disabled (manage invoice permission required). */
  canManageInvoices?: boolean;
}

export function InvoiceHeader({ onRefresh, canManageInvoices = true }: InvoiceHeaderProps) {
  return (
    <motion.div
      className="border-b border-border bg-card"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
    >
      <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Invoices
            </h1>
            <p className="mt-0.5 text-muted-foreground">
              Create and manage invoices. Stock is reduced when an invoice is marked fully paid.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            {canManageInvoices ? (
              <Button size="sm" className="gap-2 shadow-md shadow-primary/20 hover:shadow-primary/30" asChild>
                <Link href="/dashboard/invoice/new">
                  <Plus className="h-4 w-4" />
                  New invoice
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
                New invoice
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
