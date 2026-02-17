"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  ChevronDown,
  ChevronRight,
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
  const [byCategoryOpen, setByCategoryOpen] = useState(false);

  return (
    <motion.section
      className="space-y-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.05 }}
    >
      <div className="flex items-center gap-1.5 sm:gap-3">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary sm:h-9 sm:w-9 sm:rounded-lg">
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
        </span>
        <h2 className="text-xs font-semibold text-foreground sm:text-lg">Overview (filtered)</h2>
      </div>

      <div className="grid gap-2 grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-6">
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
                <CardHeader className="p-2 pb-2 sm:p-5 sm:pb-4">
                  <div className="flex flex-col gap-1 sm:gap-3">
                    <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 sm:text-sm sm:gap-2">
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md sm:h-10 sm:w-10 sm:rounded-lg ${stat.className}`}>
                        <Icon className="h-2.5 w-2.5 sm:h-5 sm:w-5" />
                      </span>
                      <span className="truncate">{stat.label}</span>
                    </CardTitle>
                    <span className="text-sm font-bold tabular-nums text-foreground break-words min-w-0 sm:text-xl">
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
          <button
            type="button"
            onClick={() => setByCategoryOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2 text-left hover:bg-muted/60 transition-colors touch-manipulation sm:px-5 sm:py-3"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <FolderTree className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                By category
              </p>
            </div>
            {byCategoryOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </button>
          <AnimatePresence>
            {byCategoryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={transition}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] sm:text-sm">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Category</th>
                        <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Count</th>
                        <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Qty</th>
                        <th className="text-right font-medium px-2 py-1.5 text-muted-foreground whitespace-nowrap sm:p-4">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.byCategory.map((row, i) => (
                        <tr key={i} className="border-t border-border/60 transition-colors hover:bg-muted/20">
                          <td className="px-2 py-1.5 font-medium sm:p-4">{row.category ?? "Uncategorized"}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums sm:p-4">{row.count}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums sm:p-4">{row.quantity}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums font-medium whitespace-nowrap sm:p-4">{formatCurrency(row.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.section>
  );
}
