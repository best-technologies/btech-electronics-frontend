"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { formatCurrency, formatDate, formatStatus } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowRight } from "lucide-react";
import type { Invoice } from "@/lib/api";

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

interface InvoiceTableProps {
  items: Invoice[];
}

export function InvoiceTable({ items }: InvoiceTableProps) {
  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.15 }}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <ArrowRight className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">Invoices</h2>
      </div>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left font-medium p-4 text-muted-foreground">Invoice #</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Customer</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Company</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Issue date</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Due date</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Status</th>
                <th className="text-right font-medium p-4 text-muted-foreground">Total</th>
                <th className="text-right font-medium p-4 text-muted-foreground">Paid</th>
                <th className="text-right font-medium p-4 text-muted-foreground">Balance</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {items.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-border/60 transition-colors hover:bg-muted/30"
                >
                  <td className="p-4 font-medium font-mono">
                    <Link
                      href={`/dashboard/invoice/${inv.id}`}
                      className="text-primary hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="p-4 text-foreground">{inv.customerName}</td>
                  <td className="p-4 text-muted-foreground">{inv.customerCompany ?? "—"}</td>
                  <td className="p-4 text-muted-foreground">{formatDate(inv.issueDate)}</td>
                  <td className="p-4 text-muted-foreground">{formatDate(inv.dueDate)}</td>
                  <td className="p-4">
                    <StatusBadge status={formatStatus(inv.status)} />
                  </td>
                  <td className="p-4 text-right font-medium tabular-nums">
                    {formatCurrency(inv.totalAmount)}
                  </td>
                  <td className="p-4 text-right text-muted-foreground tabular-nums">
                    {formatCurrency(inv.amountPaid)}
                  </td>
                  <td className="p-4 text-right tabular-nums">
                    {inv.balanceDue > 0 ? (
                      <span className="font-medium text-amber-600 dark:text-amber-400">
                        {formatCurrency(inv.balanceDue)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/dashboard/invoice/${inv.id}`}
                      className="inline-flex text-primary hover:text-primary/80"
                      aria-label={`View ${inv.invoiceNumber}`}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.section>
  );
}
