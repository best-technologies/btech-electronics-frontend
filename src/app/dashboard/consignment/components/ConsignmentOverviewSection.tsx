"use client";

import { motion, AnimatePresence } from "motion/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatStatus } from "@/lib/utils";
import {
  Package,
  Layers,
  Boxes,
  Hash,
  TrendingUp,
  Banknote,
  Wallet,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";
import type { ConsignmentListAnalysis } from "@/lib/api";
import { transition } from "../constants";

interface ConsignmentOverviewSectionProps {
  analysis: ConsignmentListAnalysis;
  isOpen: boolean;
  onToggle: () => void;
}

const STATS = [
  { label: "Consignments", key: "totalConsignments", icon: Package, className: "bg-primary/10 text-primary" },
  { label: "Line items", key: "totalLineItems", icon: Layers, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { label: "Total cartons", key: "totalCartons", icon: Boxes, className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { label: "Total quantity", key: "totalQuantity", icon: Hash, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { label: "Total cost", key: "totalCost", icon: FileSpreadsheet, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", format: "currency" },
  { label: "Total paid", key: "totalPaid", icon: Banknote, className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400", format: "currency" },
  { label: "Balance to pay", key: "totalBalanceToPay", icon: Wallet, className: "bg-primary/10 text-primary", format: "currency" },
] as const;

export function ConsignmentOverviewSection({
  analysis,
  isOpen,
  onToggle,
}: ConsignmentOverviewSectionProps) {
  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-1.5 rounded-md border border-border/60 bg-card px-2.5 py-2 text-left shadow-sm hover:bg-muted/30 transition-colors touch-manipulation sm:gap-3 sm:rounded-lg sm:px-4 sm:py-3"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary sm:h-9 sm:w-9 sm:rounded-lg">
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="font-medium text-foreground text-[11px] sm:text-base">Overview (filtered)</span>
          <span className="ml-2 hidden text-sm text-muted-foreground sm:inline">
            {analysis.totalConsignments} consignment{analysis.totalConsignments !== 1 ? "s" : ""}
            {analysis.totalLineItems != null && ` · ${analysis.totalLineItems} line items`}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition}
            className="space-y-6 overflow-hidden"
          >
            <div className="grid gap-2 grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
              {STATS.map((stat, i) => {
                const Icon = stat.icon;
                const raw = analysis[stat.key as keyof ConsignmentListAnalysis];
                const value: string | number =
                  "format" in stat && stat.format === "currency" && typeof raw === "number"
                    ? formatCurrency(raw)
                    : typeof raw === "number" || typeof raw === "string"
                      ? raw
                      : "—";
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...transition, delay: 0.06 + i * 0.03 }}
                  >
                    <Card className="overflow-hidden border-border/60 bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20">
                      <CardHeader className="p-2 pb-2 sm:p-5 sm:pb-4">
                        <div className="flex flex-col gap-1 sm:gap-3">
                          <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 sm:text-sm sm:gap-2">
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md sm:h-10 sm:w-10 sm:rounded-lg ${stat.className}`}
                            >
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
            {analysis.byStatus && Object.keys(analysis.byStatus).length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...transition, delay: 0.25 }}
                className="flex flex-wrap items-center gap-3 pt-1"
              >
                <span className="text-xs font-medium text-muted-foreground">By status:</span>
                {Object.entries(analysis.byStatus)
                  .filter(([, count]) => count > 0)
                  .map(([s, count]) => (
                    <span key={s} className="inline-flex items-center gap-1.5">
                      <StatusBadge status={formatStatus(s)} className="rounded-md border" />
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">
                        × {count}
                      </span>
                    </span>
                  ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
