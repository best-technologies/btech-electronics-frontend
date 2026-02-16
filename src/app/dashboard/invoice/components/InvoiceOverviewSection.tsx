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

export function InvoiceOverviewSection({ analysis }: InvoiceOverviewSectionProps) {
  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.05 }}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <TrendingUp className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">Overview</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {STATS.map(({ key, label, value, icon: Icon, className }) => (
          <Card key={key} className="overflow-hidden border-border/60 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${className}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </CardTitle>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">
                {value(analysis)}
              </p>
            </CardHeader>
          </Card>
        ))}
      </div>
      {analysis.byStatus && Object.keys(analysis.byStatus).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(analysis.byStatus)
            .filter(([, count]) => count > 0)
            .map(([status, count]) => (
              <span
                key={status}
                className="inline-flex items-center rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium text-muted-foreground"
              >
                {formatStatus(status)}: <span className="ml-1 font-semibold text-foreground">{count}</span>
              </span>
            ))}
        </div>
      )}
    </motion.section>
  );
}
