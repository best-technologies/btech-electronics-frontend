"use client";

import { motion } from "motion/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { InvoiceListAnalysis } from "@/lib/api";
import {
  TrendingUp,
  FileText,
  Banknote,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { formatStatus } from "@/lib/utils";

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

interface InvoiceOverviewSectionProps {
  analysis: InvoiceListAnalysis;
  /** Rendered on the right of the Overview title row (e.g. Search & filters button). */
  rightAction?: React.ReactNode;
}

const STATS = [
  {
    key: "totalInvoices",
    label: "Total invoices",
    value: (a: InvoiceListAnalysis) => a.totalInvoices,
    icon: FileText,
    className: "bg-primary/10 text-primary",
  },
  {
    key: "totalAmount",
    label: "Total amount",
    value: (a: InvoiceListAnalysis) => formatCurrency(a.totalAmount),
    icon: Banknote,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    key: "totalPaid",
    label: "Paid",
    value: (a: InvoiceListAnalysis) => formatCurrency(a.totalPaid),
    icon: CheckCircle,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "totalBalance",
    label: "Balance due",
    value: (a: InvoiceListAnalysis) => formatCurrency(a.totalBalance),
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    key: "totalTax",
    label: "Total tax",
    value: (a: InvoiceListAnalysis) => formatCurrency(a.totalTax),
    icon: AlertCircle,
    className: "bg-muted text-muted-foreground",
  },
] as const;

export function InvoiceOverviewSection({ analysis, rightAction }: InvoiceOverviewSectionProps) {
  return (
    <motion.section
      className="space-y-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.05 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary sm:h-8 sm:w-8 sm:rounded-lg">
            <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </span>
          <h2 className="text-xs font-semibold text-foreground sm:text-base">Overview</h2>
        </div>
        {rightAction}
      </div>
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-5">
        {STATS.map(({ key, label, value, icon: Icon, className }) => (
          <Card key={key} className="overflow-hidden border-border/60 bg-card shadow-sm">
            <CardHeader className="p-2 pb-1.5 pt-2 sm:p-4 sm:pb-2 sm:pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 sm:text-xs sm:gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-md sm:h-8 sm:w-8 sm:rounded-lg ${className}`}>
                    <Icon className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                  </span>
                  {label}
                </CardTitle>
              </div>
              <p className="mt-1 text-sm font-bold text-foreground tabular-nums sm:mt-1.5 sm:text-xl">
                {value(analysis)}
              </p>
            </CardHeader>
          </Card>
        ))}
      </div>
      {analysis.byStatus && Object.keys(analysis.byStatus).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(analysis.byStatus)
            .filter(([, count]) => count > 0)
            .map(([status, count]) => (
              <span
                key={status}
                className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-px text-[9px] font-medium text-muted-foreground sm:rounded-md sm:px-2.5 sm:py-1 sm:text-xs"
              >
                {formatStatus(status)}: <span className="ml-0.5 font-semibold text-foreground sm:ml-1">{count}</span>
              </span>
            ))}
        </div>
      )}
    </motion.section>
  );
}
