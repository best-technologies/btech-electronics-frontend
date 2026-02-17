"use client";

import { motion, AnimatePresence } from "motion/react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, ChevronDown, ChevronRight } from "lucide-react";
import type { InvoiceSortBy } from "@/lib/api";

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "issued", label: "Issued" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

const SORT_OPTIONS: { value: InvoiceSortBy; label: string }[] = [
  { value: "createdAt", label: "Created" },
  { value: "issueDate", label: "Issue date" },
  { value: "dueDate", label: "Due date" },
  { value: "invoiceNumber", label: "Invoice number" },
  { value: "totalAmount", label: "Total amount" },
  { value: "status", label: "Status" },
];

/** When "button", only the toggle button is rendered (e.g. for inline with Overview). When "panel", only the expandable panel. Omit for both. */
type InvoiceFiltersSlot = "button" | "panel";

interface InvoiceFiltersSectionProps {
  filtersOpen: boolean;
  onFiltersToggle: () => void;
  /** Render only the button or only the panel; omit to render both (default). */
  slot?: InvoiceFiltersSlot;
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  fromIssueDate: string;
  onFromIssueDateChange: (v: string) => void;
  toIssueDate: string;
  onToIssueDateChange: (v: string) => void;
  sortBy: InvoiceSortBy;
  onSortByChange: (v: InvoiceSortBy) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (v: "asc" | "desc") => void;
  onApply: () => void;
  onClear: () => void;
}

export function InvoiceFiltersSection({
  filtersOpen,
  onFiltersToggle,
  slot,
  search,
  onSearchChange,
  status,
  onStatusChange,
  fromIssueDate,
  onFromIssueDateChange,
  toIssueDate,
  onToIssueDateChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onApply,
  onClear,
}: InvoiceFiltersSectionProps) {
  const statusLabel = STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;

  const buttonEl = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onFiltersToggle}
      className="gap-2 rounded-lg h-9 border-border/60 bg-card shadow-sm hover:bg-muted/30"
    >
      <Filter className="h-4 w-4" />
      Search & filters
      {status && (
        <span className="text-xs text-muted-foreground">· {statusLabel}</span>
      )}
      {filtersOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </Button>
  );

  if (slot === "button") return buttonEl;

  const panelEl = (
    <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition}
            className="overflow-hidden"
          >
            <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
              <CardHeader className="p-6 pb-5">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[240px] max-w-xl">
                      <Label className="sr-only">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search invoice number, customer name, company..."
                          value={search}
                          onChange={(e) => onSearchChange(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && onApply()}
                          className="pl-9 rounded-lg h-10"
                        />
                      </div>
                    </div>
                    <div className="w-full sm:w-[180px]">
                      <Label htmlFor="inv-status" className="text-xs text-muted-foreground">Status</Label>
                      <select
                        id="inv-status"
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value || "all"} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full sm:w-[160px]">
                      <Label htmlFor="inv-from-date" className="text-xs text-muted-foreground">Issue from</Label>
                      <Input
                        id="inv-from-date"
                        type="date"
                        value={fromIssueDate}
                        onChange={(e) => onFromIssueDateChange(e.target.value)}
                        className="mt-1 h-10 rounded-lg"
                      />
                    </div>
                    <div className="w-full sm:w-[160px]">
                      <Label htmlFor="inv-to-date" className="text-xs text-muted-foreground">Issue to</Label>
                      <Input
                        id="inv-to-date"
                        type="date"
                        value={toIssueDate}
                        onChange={(e) => onToIssueDateChange(e.target.value)}
                        className="mt-1 h-10 rounded-lg"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button type="button" size="sm" onClick={onApply} className="h-10 rounded-lg">
                        Apply
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={onClear} className="h-10 rounded-lg">
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
                    <Label className="text-xs text-muted-foreground">Sort</Label>
                    <select
                      value={sortBy}
                      onChange={(e) => onSortByChange(e.target.value as InvoiceSortBy)}
                      className="flex h-9 rounded-lg border border-input bg-background px-3 py-2 text-sm w-[160px]"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <select
                      value={sortOrder}
                      onChange={(e) => onSortOrderChange(e.target.value as "asc" | "desc")}
                      className="flex h-9 rounded-lg border border-input bg-background px-3 py-2 text-sm w-[100px]"
                    >
                      <option value="asc">Asc</option>
                      <option value="desc">Desc</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        )}
    </AnimatePresence>
  );

  if (slot === "panel") return panelEl;

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">{buttonEl}</div>
      {panelEl}
    </section>
  );
}
