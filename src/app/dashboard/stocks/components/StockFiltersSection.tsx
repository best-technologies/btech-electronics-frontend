"use client";

import { motion, AnimatePresence } from "motion/react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, SlidersHorizontal, Filter, ChevronDown, ChevronUp } from "lucide-react";
import type { ListStockParams, StockSortBy } from "@/lib/api";

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

const SORT_OPTIONS: { value: StockSortBy; label: string }[] = [
  { value: "createdAt", label: "Created" },
  { value: "name", label: "Name" },
  { value: "sku", label: "SKU" },
  { value: "currentStock", label: "Current stock" },
  { value: "costPrice", label: "Cost price" },
  { value: "wholesalePrice", label: "Wholesale price" },
  { value: "retailPrice", label: "Retail price" },
  { value: "category", label: "Category" },
];

interface StockFiltersSectionProps {
  search: string;
  onSearchChange: (v: string) => void;
  sku: string;
  onSkuChange: (v: string) => void;
  name: string;
  onNameChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  isActive: string;
  onIsActiveChange: (v: string) => void;
  lowStock: string;
  onLowStockChange: (v: string) => void;
  fromCreatedAt: string;
  onFromCreatedAtChange: (v: string) => void;
  toCreatedAt: string;
  onToCreatedAtChange: (v: string) => void;
  sortBy: StockSortBy;
  onSortByChange: (v: StockSortBy) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (v: "asc" | "desc") => void;
  showFilters: boolean;
  onShowFiltersChange: (v: boolean) => void;
  filtersSectionOpen?: boolean;
  onFiltersSectionOpenChange?: (v: boolean) => void;
  onApply: () => void;
  onClear: () => void;
}

export function StockFiltersSection({
  search,
  onSearchChange,
  sku,
  onSkuChange,
  name,
  onNameChange,
  category,
  onCategoryChange,
  isActive,
  onIsActiveChange,
  lowStock,
  onLowStockChange,
  fromCreatedAt,
  onFromCreatedAtChange,
  toCreatedAt,
  onToCreatedAtChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  showFilters,
  onShowFiltersChange,
  filtersSectionOpen = false,
  onFiltersSectionOpenChange,
  onApply,
  onClear,
}: StockFiltersSectionProps) {
  const isExpanded = onFiltersSectionOpenChange ? filtersSectionOpen : true;

  return (
    <motion.section
      className="space-y-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.1 }}
    >
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => onFiltersSectionOpenChange?.(true)}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left shadow-sm transition-colors hover:bg-muted/30 hover:border-primary/30"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Filter className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-foreground">Search & filters</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      ) : (
        <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
          <CardHeader className="p-6 pb-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Filter className="h-4 w-4" />
                </span>
                <h2 className="text-lg font-semibold text-foreground">Search & filters</h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onFiltersSectionOpenChange?.(false)}
                className="gap-1.5 text-muted-foreground shrink-0"
              >
                <ChevronUp className="h-4 w-4" />
                Collapse
              </Button>
            </div>
            <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[240px] max-w-xl">
                <Label className="sr-only">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search SKU, name, description, brand, category..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onApply()}
                    className="pl-9 h-10 rounded-lg border-input"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-36">
                  <Label className="sr-only">Status</Label>
                  <select
                    value={isActive}
                    onChange={(e) => onIsActiveChange(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">All</option>
                    <option value="true">Active only</option>
                    <option value="false">Inactive only</option>
                  </select>
                </div>
                <div className="w-36">
                  <Label className="sr-only">Stock level</Label>
                  <select
                    value={lowStock}
                    onChange={(e) => onLowStockChange(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All</option>
                    <option value="true">Out of stock only</option>
                  </select>
                </div>
                <div className="w-44">
                  <Label className="sr-only">Sort by</Label>
                  <select
                    value={sortBy}
                    onChange={(e) => onSortByChange(e.target.value as StockSortBy)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary/20"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <select
                  value={sortOrder}
                  onChange={(e) => onSortOrderChange(e.target.value as "asc" | "desc")}
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
                onClick={() => onShowFiltersChange(!showFilters)}
                className="gap-2 rounded-lg h-9"
              >
                <SlidersHorizontal className="h-4 w-4" />
                More filters
              </Button>
              <Button size="sm" onClick={onApply} className="rounded-lg h-9">Apply</Button>
              <Button variant="ghost" size="sm" onClick={onClear} className="rounded-lg h-9">Clear</Button>
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
                      <Label className="text-xs">SKU (contains)</Label>
                      <Input placeholder="SKU" value={sku} onChange={(e) => onSkuChange(e.target.value)} className="rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Name (contains)</Label>
                      <Input placeholder="Name" value={name} onChange={(e) => onNameChange(e.target.value)} className="rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Category</Label>
                      <Input placeholder="Category" value={category} onChange={(e) => onCategoryChange(e.target.value)} className="rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Created from</Label>
                      <Input type="date" value={fromCreatedAt} onChange={(e) => onFromCreatedAtChange(e.target.value)} className="rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Created to</Label>
                      <Input type="date" value={toCreatedAt} onChange={(e) => onToCreatedAtChange(e.target.value)} className="rounded-lg" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </CardHeader>
        </Card>
      )}
    </motion.section>
  );
}
