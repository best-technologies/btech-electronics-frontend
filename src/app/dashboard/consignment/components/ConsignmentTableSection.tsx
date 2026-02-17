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
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-muted-foreground text-left">
          <th className="font-medium p-2 pl-4">Product</th>
          <th className="font-medium p-2 text-right">Cartons</th>
          <th className="font-medium p-2 text-right">Qty</th>
          <th className="font-medium p-2">Unit</th>
          <th className="font-medium p-2 text-right">Unit price (cost)</th>
          <th className="font-medium p-2 text-right">Wholesale price</th>
          <th className="font-medium p-2 text-right">Retail price</th>
          <th className="font-medium p-2 text-right">Total cost</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-t border-border/50">
            <td className="p-2 pl-4">{item.productName}</td>
            <td className="p-2 text-right">{item.cartons}</td>
            <td className="p-2 text-right">{item.quantity}</td>
            <td className="p-2">{item.unit ?? "—"}</td>
            <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
            <td className="p-2 text-right">
              {item.wholesalePrice != null ? formatCurrency(item.wholesalePrice) : "—"}
            </td>
            <td className="p-2 text-right">
              {item.retailPrice != null ? formatCurrency(item.retailPrice) : "—"}
            </td>
            <td className="p-2 text-right">{formatCurrency(item.totalCost)}</td>
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
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Package className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">Consignments</h2>
      </div>

      {meta && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-border bg-card px-6 py-4"
        >
          <p className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{meta.page}</span> of{" "}
            <span className="font-medium text-foreground">{meta.totalPages}</span>
            {" · "}
            <span className="tabular-nums">{meta.total}</span> total
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg h-9 min-w-[80px]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg h-9 min-w-[80px]"
            >
              Next
            </Button>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="flex h-9 w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-10 p-3" aria-label="Expand" />
                <th className="text-left font-medium p-4 text-muted-foreground">Reference</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Supplier</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Status</th>
                <th className="text-left font-medium p-4 text-muted-foreground whitespace-nowrap">
                  Delivery date
                </th>
                <th className="text-right font-medium p-4 text-muted-foreground">Cartons</th>
                <th className="text-right font-medium p-4 text-muted-foreground">Qty</th>
                <th className="text-right font-medium p-4 text-muted-foreground whitespace-nowrap">
                  Total cost
                </th>
                <th className="text-left font-medium p-4 text-muted-foreground">Items</th>
                <th className="w-28 p-3" aria-label="Actions" />
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
                      <td className="p-3">
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
                      <td className="p-4 font-medium">
                        <Link
                          href={`/dashboard/consignment/${c.id}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {c.referenceNumber}
                        </Link>
                      </td>
                      <td className="p-4 text-foreground">{c.supplierName}</td>
                      <td className="p-4">
                        <StatusBadge status={formatStatus(c.status)} />
                      </td>
                      <td className="p-4 text-muted-foreground whitespace-nowrap">
                        {formatDate(c.deliveryDate)}
                      </td>
                      <td className="p-4 text-right tabular-nums">{c.overallTotalCartons ?? "—"}</td>
                      <td className="p-4 text-right tabular-nums">{c.overallTotalQuantity ?? "—"}</td>
                      <td className="p-4 text-right font-medium tabular-nums whitespace-nowrap">
                        {c.overallTotalCost != null ? formatCurrency(c.overallTotalCost) : "—"}
                      </td>
                      <td className="p-4 tabular-nums">{c.items?.length ?? 0}</td>
                      <td className="p-3">
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
          className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-border bg-card px-6 py-4"
        >
          <p className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{meta.page}</span> of{" "}
            <span className="font-medium text-foreground">{meta.totalPages}</span>
            {" · "}
            <span className="tabular-nums">{meta.total}</span> total
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg h-9 min-w-[80px]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg h-9 min-w-[80px]"
            >
              Next
            </Button>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="flex h-9 w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
