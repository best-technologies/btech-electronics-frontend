"use client";

import { motion } from "motion/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { StockListAnalysis } from "@/lib/api";
import {
  TrendingUp,
  Package,
  CheckCircle,
  Hash,
  Banknote,
  AlertTriangle,
  PackageX,
  FolderTree,
} from "lucide-react";

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

interface StockOverviewSectionProps {
  analysis: StockListAnalysis;
}

const STAT_CARDS = [
  {
    key: "totalProducts",
    label: "Total products",
    value: (a: StockListAnalysis) => a.totalProducts,
    icon: Package,
    className: "bg-primary/10 text-primary",
  },
  {
    key: "activeProducts",
    label: "Active products",
    value: (a: StockListAnalysis) => a.activeProducts,
    icon: CheckCircle,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "totalQuantity",
    label: "Total quantity",
    value: (a: StockListAnalysis) => a.totalQuantity,
    icon: Hash,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    key: "totalValue",
    label: "Total value",
    value: (a: StockListAnalysis) => formatCurrency(a.totalValue),
    icon: Banknote,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    key: "lowStockCount",
    label: "Low stock",
    value: (a: StockListAnalysis) => a.lowStockCount,
    icon: AlertTriangle,
    className: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  {
    key: "outOfStockCount",
    label: "Out of stock",
    value: (a: StockListAnalysis) => a.outOfStockCount,
    icon: PackageX,
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
] as const;

export function StockOverviewSection({ analysis }: StockOverviewSectionProps) {
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
        <h2 className="text-lg font-semibold text-foreground">Overview (filtered)</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAT_CARDS.map((stat, i) => {
          const Icon = stat.icon;
          const value = stat.value(analysis);
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: 0.06 + i * 0.03 }}
            >
              <Card className="overflow-hidden border-border/60 bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20">
                <CardHeader className="p-5 pb-4">
                  <div className="flex flex-col gap-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.className}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      {stat.label}
                    </CardTitle>
                    <span className="text-xl font-bold tabular-nums text-foreground break-words min-w-0">
                      {value}
                    </span>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {analysis.byCategory && analysis.byCategory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.25 }}
          className="rounded-xl border border-border overflow-hidden bg-card shadow-sm"
        >
          <div className="border-b border-border bg-muted/40 px-5 py-3">
            <div className="flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                By category
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left font-medium p-4 text-muted-foreground">Category</th>
                  <th className="text-right font-medium p-4 text-muted-foreground">Count</th>
                  <th className="text-right font-medium p-4 text-muted-foreground">Quantity</th>
                  <th className="text-right font-medium p-4 text-muted-foreground whitespace-nowrap">Value</th>
                </tr>
              </thead>
              <tbody>
                {analysis.byCategory.map((row, i) => (
                  <tr key={i} className="border-t border-border/60 transition-colors hover:bg-muted/20">
                    <td className="p-4 font-medium">{row.category ?? "Uncategorized"}</td>
                    <td className="p-4 text-right tabular-nums">{row.count}</td>
                    <td className="p-4 text-right tabular-nums">{row.quantity}</td>
                    <td className="p-4 text-right tabular-nums font-medium whitespace-nowrap">{formatCurrency(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
