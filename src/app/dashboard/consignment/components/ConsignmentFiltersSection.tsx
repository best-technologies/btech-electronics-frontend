"use client";

import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader } from "@/components/ui/card";
import { Search, SlidersHorizontal, Filter, Building2, ChevronDown, ChevronRight } from "lucide-react";
import type { ConsignmentListAnalysis, ConsignmentStatus, ConsignmentSortBy } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { STATUS_OPTIONS, SORT_OPTIONS, transition } from "../constants";

interface ConsignmentFiltersSectionProps {
  filtersOpen: boolean;
  bySupplierOpen: boolean;
  onFiltersToggle: () => void;
  onBySupplierToggle: () => void;
  analysis: ConsignmentListAnalysis | undefined;
  status: ConsignmentStatus | "";
  statusLabel: string;
  search: string;
  setSearch: (v: string) => void;
  setStatus: (v: ConsignmentStatus | "") => void;
  sortBy: ConsignmentSortBy;
  setSortBy: (v: ConsignmentSortBy) => void;
  sortOrder: string;
  setSortOrder: (v: "asc" | "desc") => void;
  showFilters: boolean;
  setShowFilters: (v: boolean | ((prev: boolean) => boolean)) => void;
  referenceNumber: string;
  setReferenceNumber: (v: string) => void;
  invoiceNumber: string;
  setInvoiceNumber: (v: string) => void;
  supplierName: string;
  setSupplierName: (v: string) => void;
  fromDate: string;
  setFromDate: (v: string) => void;
  toDate: string;
  setToDate: (v: string) => void;
  fromCreatedAt: string;
  setFromCreatedAt: (v: string) => void;
  toCreatedAt: string;
  setToCreatedAt: (v: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export function ConsignmentFiltersSection({
  filtersOpen,
  bySupplierOpen,
  onFiltersToggle,
  onBySupplierToggle,
  analysis,
  status,
  statusLabel,
  search,
  setSearch,
  setStatus,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  showFilters,
  setShowFilters,
  referenceNumber,
  setReferenceNumber,
  invoiceNumber,
  setInvoiceNumber,
  supplierName,
  setSupplierName,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  fromCreatedAt,
  setFromCreatedAt,
  toCreatedAt,
  setToCreatedAt,
  onApplyFilters,
  onClearFilters,
}: ConsignmentFiltersSectionProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
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
        {analysis?.bySupplier && analysis.bySupplier.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBySupplierToggle}
            className="gap-2 rounded-lg h-9 border-border/60 bg-card shadow-sm hover:bg-muted/30"
          >
            <Building2 className="h-4 w-4" />
            By supplier
            {bySupplierOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {bySupplierOpen && analysis?.bySupplier && analysis.bySupplier.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
              <div className="border-b border-border bg-muted/40 px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  By supplier (top 10)
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left font-medium p-4 text-muted-foreground">Supplier</th>
                      <th className="text-right font-medium p-4 text-muted-foreground">Count</th>
                      <th className="text-right font-medium p-4 text-muted-foreground">Total qty</th>
                      <th className="text-right font-medium p-4 text-muted-foreground whitespace-nowrap">Total cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.bySupplier.map((s, i) => (
                      <tr key={i} className="border-t border-border/60 transition-colors hover:bg-muted/20">
                        <td className="p-4 font-medium">{s.supplierName}</td>
                        <td className="p-4 text-right tabular-nums">{s.count}</td>
                        <td className="p-4 text-right tabular-nums">{s.totalQuantity}</td>
                        <td className="p-4 text-right tabular-nums font-medium whitespace-nowrap">
                          {formatCurrency(s.totalCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                          placeholder="Search reference, invoice, supplier..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && onApplyFilters()}
                          className="pl-9 h-10 rounded-lg border-input"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="w-40">
                        <Label className="sr-only">Status</Label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as ConsignmentStatus | "")}
                          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="">All statuses</option>
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-44">
                        <Label className="sr-only">Sort by</Label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as ConsignmentSortBy)}
                          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary/20"
                        >
                          {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                        className="flex h-10 w-28 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters((s) => !s)}
                      className="gap-2 rounded-lg h-9"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      More filters
                    </Button>
                    <Button size="sm" onClick={onApplyFilters} className="rounded-lg h-9">
                      Apply
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClearFilters} className="rounded-lg h-9">
                      Clear
                    </Button>
                  </div>
                </div>
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={transition}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 mt-4 border-t border-border">
                        <div className="space-y-1">
                          <Label className="text-xs">Reference number</Label>
                          <Input
                            placeholder="Contains"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            className="rounded-lg"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Invoice number</Label>
                          <Input
                            placeholder="Contains"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            className="rounded-lg"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Supplier name</Label>
                          <Input
                            placeholder="Contains"
                            value={supplierName}
                            onChange={(e) => setSupplierName(e.target.value)}
                            className="rounded-lg"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Delivery date from</Label>
                          <Input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="rounded-lg"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Delivery date to</Label>
                          <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="rounded-lg"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Created from</Label>
                          <Input
                            type="date"
                            value={fromCreatedAt}
                            onChange={(e) => setFromCreatedAt(e.target.value)}
                            className="rounded-lg"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Created to</Label>
                          <Input
                            type="date"
                            value={toCreatedAt}
                            onChange={(e) => setToCreatedAt(e.target.value)}
                            className="rounded-lg"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardHeader>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
