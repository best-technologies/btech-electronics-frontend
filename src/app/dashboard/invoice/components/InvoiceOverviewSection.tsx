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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-base font-semibold text-foreground">Overview</h2>
        </div>
        {rightAction}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {STATS.map(({ key, label, value, icon: Icon, className }) => (
          <Card key={key} className="overflow-hidden border-border/60 bg-card shadow-sm">
            <CardHeader className="p-4 pb-2 pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${className}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {label}
                </CardTitle>
              </div>
              <p className="mt-1.5 text-xl font-bold text-foreground tabular-nums">
                {value(analysis)}
              </p>
            </CardHeader>
          </Card>
        ))}
      </div>
      {analysis.byStatus && Object.keys(analysis.byStatus).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(analysis.byStatus)
            .filter(([, count]) => count > 0)
            .map(([status, count]) => (
              <span
                key={status}
                className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {formatStatus(status)}: <span className="ml-1 font-semibold text-foreground">{count}</span>
              </span>
            ))}
        </div>
      )}
    </motion.section>
  );
}
