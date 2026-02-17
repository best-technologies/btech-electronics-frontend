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
      className="gap-1 rounded-md h-7 text-[11px] border-border/60 bg-card shadow-sm hover:bg-muted/30 touch-manipulation sm:gap-2 sm:rounded-lg sm:h-9 sm:text-sm"
    >
      <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
      <span className="hidden sm:inline">Search & filters</span>
      <span className="sm:hidden">Filters</span>
      {status && (
        <span className="text-[10px] text-muted-foreground sm:text-xs">· {statusLabel}</span>
      )}
      {filtersOpen ? <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />}
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
              <CardHeader className="p-2.5 pb-2.5 sm:p-6 sm:pb-5">
                <div className="flex flex-col gap-2 sm:gap-4">
                  <div className="flex flex-wrap items-end gap-2 sm:gap-4">
                    <div className="w-full min-w-0 sm:flex-1 sm:min-w-[240px] sm:max-w-xl">
                      <Label className="sr-only">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground sm:left-3 sm:h-4 sm:w-4" />
                        <Input
                          placeholder="Search invoice number, customer..."
                          value={search}
                          onChange={(e) => onSearchChange(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && onApply()}
                          className="pl-7 h-8 rounded-md text-[11px] sm:pl-9 sm:rounded-lg sm:h-10 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="w-full sm:w-[180px]">
                      <Label htmlFor="inv-status" className="text-[10px] text-muted-foreground sm:text-xs">Status</Label>
                      <select
                        id="inv-status"
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="mt-0.5 flex h-8 w-full rounded-md border border-input bg-background px-2 py-1.5 text-[11px] sm:mt-1 sm:h-10 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm"
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value || "all"} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-[calc(50%-4px)] sm:w-[160px]">
                      <Label htmlFor="inv-from-date" className="text-[10px] text-muted-foreground sm:text-xs">Issue from</Label>
                      <Input
                        id="inv-from-date"
                        type="date"
                        value={fromIssueDate}
                        onChange={(e) => onFromIssueDateChange(e.target.value)}
                        className="mt-0.5 h-8 rounded-md text-[11px] sm:mt-1 sm:h-10 sm:rounded-lg sm:text-sm"
                      />
                    </div>
                    <div className="w-[calc(50%-4px)] sm:w-[160px]">
                      <Label htmlFor="inv-to-date" className="text-[10px] text-muted-foreground sm:text-xs">Issue to</Label>
                      <Input
                        id="inv-to-date"
                        type="date"
                        value={toIssueDate}
                        onChange={(e) => onToIssueDateChange(e.target.value)}
                        className="mt-0.5 h-8 rounded-md text-[11px] sm:mt-1 sm:h-10 sm:rounded-lg sm:text-sm"
                      />
                    </div>
                    <div className="flex items-end gap-1.5 sm:gap-2">
                      <Button type="button" size="sm" onClick={onApply} className="h-7 rounded-md text-[11px] touch-manipulation sm:h-10 sm:rounded-lg sm:text-sm">
                        Apply
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={onClear} className="h-7 rounded-md text-[11px] touch-manipulation sm:h-10 sm:rounded-lg sm:text-sm">
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-border sm:gap-3 sm:pt-2">
                    <Label className="text-[10px] text-muted-foreground sm:text-xs">Sort</Label>
                    <select
                      value={sortBy}
                      onChange={(e) => onSortByChange(e.target.value as InvoiceSortBy)}
                      className="flex h-7 rounded-md border border-input bg-background px-2 py-1 text-[11px] w-[120px] sm:h-9 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm sm:w-[160px]"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <select
                      value={sortOrder}
                      onChange={(e) => onSortOrderChange(e.target.value as "asc" | "desc")}
                      className="flex h-7 rounded-md border border-input bg-background px-2 py-1 text-[11px] w-[70px] sm:h-9 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm sm:w-[100px]"
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
