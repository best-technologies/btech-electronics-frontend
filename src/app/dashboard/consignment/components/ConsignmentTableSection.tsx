"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Package, Pencil, ChevronDown, ChevronRight } from "lucide-react";
import type { Consignment, ConsignmentItem, ConsignmentListMeta } from "@/lib/api";
import { formatDate, formatStatus, formatCurrency } from "@/lib/utils";
import { transition } from "../constants";

function ItemsRow({ items }: { items: ConsignmentItem[] }) {
  if (!items?.length) return <p className="text-muted-foreground text-sm p-3">No items.</p>;
  return (
    <table className="w-full text-[10px] border-collapse sm:text-sm">
      <thead>
        <tr className="text-muted-foreground text-left">
          <th className="font-medium px-1 py-0.5 pl-2 sm:p-2 sm:pl-4">Product</th>
          <th className="font-medium px-1 py-0.5 text-right sm:p-2">Cartons</th>
          <th className="font-medium px-1 py-0.5 text-right sm:p-2">Qty</th>
          <th className="font-medium px-1 py-0.5 sm:p-2">Unit</th>
          <th className="font-medium px-1 py-0.5 text-right sm:p-2">Unit price (cost)</th>
          <th className="font-medium px-1 py-0.5 text-right sm:p-2">Wholesale price</th>
          <th className="font-medium px-1 py-0.5 text-right sm:p-2">Retail price</th>
          <th className="font-medium px-1 py-0.5 text-right sm:p-2">Total cost</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-t border-border/50">
            <td className="px-1 py-0.5 pl-2 sm:p-2 sm:pl-4">{item.productName}</td>
            <td className="px-1 py-0.5 text-right sm:p-2">{item.cartons}</td>
            <td className="px-1 py-0.5 text-right sm:p-2">{item.quantity}</td>
            <td className="px-1 py-0.5 sm:p-2">{item.unit ?? "—"}</td>
            <td className="px-1 py-0.5 text-right sm:p-2">{formatCurrency(item.unitPrice)}</td>
            <td className="px-1 py-0.5 text-right sm:p-2">
              {item.wholesalePrice != null ? formatCurrency(item.wholesalePrice) : "—"}
            </td>
            <td className="px-1 py-0.5 text-right sm:p-2">
              {item.retailPrice != null ? formatCurrency(item.retailPrice) : "—"}
            </td>
            <td className="px-1 py-0.5 text-right sm:p-2">{formatCurrency(item.totalCost)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface ConsignmentTableSectionProps {
  consignments: Consignment[];
  meta: ConsignmentListMeta | undefined;
  page: number;
  limit: number;
  setPage: (v: number | ((p: number) => number)) => void;
  setLimit: (v: number) => void;
  canManageConsignment: boolean;
}

export function ConsignmentTableSection({
  consignments,
  meta,
  page,
  limit,
  setPage,
  setLimit,
  canManageConsignment,
}: ConsignmentTableSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.05 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-1.5 sm:gap-3">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-muted text-muted-foreground sm:h-9 sm:w-9 sm:rounded-lg">
          <Package className="h-3 w-3 sm:h-4 sm:w-4" />
        </span>
        <h2 className="text-xs font-semibold text-foreground sm:text-lg">Consignments</h2>
      </div>

      {meta && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-2 py-2 sm:gap-5 sm:rounded-xl sm:px-6 sm:py-4"
        >
          <p className="text-[10px] text-muted-foreground sm:text-sm">
            Page <span className="font-medium text-foreground">{meta.page}</span> of{" "}
            <span className="font-medium text-foreground">{meta.totalPages}</span>
            {" · "}
            <span className="tabular-nums">{meta.total}</span> total
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md h-7 min-w-[44px] text-[11px] touch-manipulation sm:rounded-lg sm:h-9 sm:min-w-[80px] sm:text-sm"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md h-7 min-w-[44px] text-[11px] touch-manipulation sm:rounded-lg sm:h-9 sm:min-w-[80px] sm:text-sm"
            >
              Next
            </Button>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="flex h-7 w-24 rounded-md border border-input bg-background px-1.5 py-1 text-[11px] sm:h-9 sm:w-32 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      )}

      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] sm:text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-10 px-1.5 py-1 sm:p-3" aria-label="Expand" />
                <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Reference</th>
                <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Supplier</th>
                <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Status</th>
                <th className="text-left font-medium px-2 py-1.5 text-muted-foreground whitespace-nowrap sm:p-4">
                  Delivery date
                </th>
                <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Cartons</th>
                <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Qty</th>
                <th className="text-right font-medium px-2 py-1.5 text-muted-foreground whitespace-nowrap sm:p-4">
                  Total cost
                </th>
                <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Items</th>
                <th className="w-28 px-1.5 py-1 sm:p-3" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {consignments.map((c, index) => (
                  <Fragment key={c.id}>
                    <motion.tr
                      className="border-t border-border/60 transition-colors hover:bg-muted/30"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...transition, delay: index * 0.02 }}
                    >
                      <td className="px-1.5 py-1 sm:p-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId((id) => (id === c.id ? null : c.id))}
                          className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                          aria-expanded={expandedId === c.id}
                        >
                          {expandedId === c.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-2 py-1.5 font-medium sm:p-4">
                        <Link
                          href={`/dashboard/consignment/${c.id}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {c.referenceNumber}
                        </Link>
                      </td>
                      <td className="px-2 py-1.5 text-foreground sm:p-4">{c.supplierName}</td>
                      <td className="px-2 py-1.5 sm:p-4">
                        <StatusBadge status={formatStatus(c.status)} />
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground whitespace-nowrap sm:p-4">
                        {formatDate(c.deliveryDate)}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums sm:p-4">{c.overallTotalCartons ?? "—"}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums sm:p-4">{c.overallTotalQuantity ?? "—"}</td>
                      <td className="px-2 py-1.5 text-right font-medium tabular-nums whitespace-nowrap sm:p-4">
                        {c.overallTotalCost != null ? formatCurrency(c.overallTotalCost) : "—"}
                      </td>
                      <td className="px-2 py-1.5 tabular-nums sm:p-4">{c.items?.length ?? 0}</td>
                      <td className="px-1.5 py-1 sm:p-3">
                        {canManageConsignment ? (
                          <Button variant="ghost" size="sm" asChild className="gap-2 rounded-lg">
                            <Link href={`/dashboard/consignment/${c.id}`}>
                              <Pencil className="h-3.5 w-3.5" />
                              Manage
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 rounded-lg cursor-not-allowed"
                            disabled
                            title="You don't have permission to perform this action. Contact an administrator if you need access."
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Manage
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                    <AnimatePresence>
                      {expandedId === c.id && (
                        <motion.tr
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={transition}
                          className="border-t border-border bg-muted/20"
                        >
                          <td colSpan={10} className="p-0">
                            <div className="py-4 px-5">
                              <p className="text-xs font-medium text-muted-foreground mb-3">
                                Items in this consignment
                              </p>
                              <ItemsRow items={c.items ?? []} />
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {meta && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-2 py-2 sm:gap-5 sm:rounded-xl sm:px-6 sm:py-4"
        >
          <p className="text-[10px] text-muted-foreground sm:text-sm">
            Page <span className="font-medium text-foreground">{meta.page}</span> of{" "}
            <span className="font-medium text-foreground">{meta.totalPages}</span>
            {" · "}
            <span className="tabular-nums">{meta.total}</span> total
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md h-7 min-w-[44px] text-[11px] touch-manipulation sm:rounded-lg sm:h-9 sm:min-w-[80px] sm:text-sm"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md h-7 min-w-[44px] text-[11px] touch-manipulation sm:rounded-lg sm:h-9 sm:min-w-[80px] sm:text-sm"
            >
              Next
            </Button>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="flex h-7 w-24 rounded-md border border-input bg-background px-1.5 py-1 text-[11px] sm:h-9 sm:w-32 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
