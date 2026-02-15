"use client";

import { useEffect, useState, Fragment, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "@/stores/authStore";
import {
  consignmentApi,
  type Consignment,
  type ConsignmentItem,
  type ListConsignmentsParams,
  type ConsignmentStatus,
  type ConsignmentSortBy,
} from "@/lib/api";
import { useQuery } from "@/hooks/useQuery";
import { formatDate, formatStatus, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Pencil,
  Search,
  SlidersHorizontal,
  Package,
  Layers,
  Boxes,
  Hash,
  TrendingUp,
  Banknote,
  Wallet,
  RefreshCw,
  ArrowRight,
  Filter,
  FileSpreadsheet,
} from "lucide-react";

const CONSIGNMENT_LIST_KEY_PREFIX = "consignment-list";
const DEFAULT_LIMIT = 20;
const SORT_OPTIONS: { value: ConsignmentSortBy; label: string }[] = [
  { value: "createdAt", label: "Created" },
  { value: "deliveryDate", label: "Delivery date" },
  { value: "referenceNumber", label: "Reference" },
  { value: "overallTotalCost", label: "Total cost" },
  { value: "status", label: "Status" },
];
const STATUS_OPTIONS: { value: ConsignmentStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "received", label: "Received" },
  { value: "inspected", label: "Inspected" },
  { value: "available", label: "Available" },
  { value: "partial_out", label: "Partial out" },
  { value: "closed", label: "Closed" },
];

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] };

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
          <th className="font-medium p-2 text-right">Unit price</th>
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
            <td className="p-2 text-right">{formatCurrency(item.totalCost)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function buildListKey(params: ListConsignmentsParams): string {
  return `${CONSIGNMENT_LIST_KEY_PREFIX}-${JSON.stringify(params ?? {})}`;
}

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex gap-4">
        <div className="h-10 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-10 w-36 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-muted/80 animate-pulse" />
        ))}
      </div>
      <div className="h-24 rounded-xl bg-muted/60 animate-pulse" />
      <div className="h-96 rounded-xl bg-muted/60 animate-pulse" />
    </div>
  );
}

export default function ConsignmentPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [status, setStatus] = useState<ConsignmentStatus | "">("");
  const [search, setSearch] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromCreatedAt, setFromCreatedAt] = useState("");
  const [toCreatedAt, setToCreatedAt] = useState("");
  const [sortBy, setSortBy] = useState<ConsignmentSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  const listParams: ListConsignmentsParams = useMemo(
    () => ({
      page,
      limit,
      ...(status ? { status: status as ConsignmentStatus } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(referenceNumber.trim() ? { referenceNumber: referenceNumber.trim() } : {}),
      ...(invoiceNumber.trim() ? { invoiceNumber: invoiceNumber.trim() } : {}),
      ...(supplierName.trim() ? { supplierName: supplierName.trim() } : {}),
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
      ...(fromCreatedAt ? { fromCreatedAt } : {}),
      ...(toCreatedAt ? { toCreatedAt } : {}),
      sortBy,
      sortOrder,
    }),
    [
      page,
      limit,
      status,
      search,
      referenceNumber,
      invoiceNumber,
      supplierName,
      fromDate,
      toDate,
      fromCreatedAt,
      toCreatedAt,
      sortBy,
      sortOrder,
    ]
  );

  const queryKey = buildListKey(listParams);
  const {
    data: listResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => consignmentApi.list(accessToken!, listParams),
    enabled: !!accessToken,
  });

  const consignments = listResponse?.items ?? [];
  const analysis = listResponse?.analysis;
  const meta = listResponse?.meta;

  useEffect(() => {
    document.title = "Consignment | Best Technologies";
  }, []);

  const applyFilters = () => setPage(1);
  const clearFilters = () => {
    setPage(1);
    setStatus("");
    setSearch("");
    setReferenceNumber("");
    setInvoiceNumber("");
    setSupplierName("");
    setFromDate("");
    setToDate("");
    setFromCreatedAt("");
    setToCreatedAt("");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  if (isLoading && !listResponse) {
    return (
      <>
        <div className="border-b border-border bg-card/50">
          <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
            <div className="h-8 w-56 rounded-lg bg-muted animate-pulse" />
            <div className="mt-2 h-5 w-80 rounded bg-muted/70 animate-pulse" />
          </div>
        </div>
        <LoadingSkeleton />
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <motion.div
        className="border-b border-border bg-card"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Consignment
              </h1>
              <p className="mt-0.5 text-muted-foreground">
                Track incoming shipments, line items, and supplier analytics.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button asChild size="sm" className="gap-2 shadow-md shadow-primary/20 hover:shadow-primary/30">
                <Link href="/dashboard/consignment/new">
                  <Plus className="h-4 w-4" />
                  Register new consignment
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        {/* Analysis cards */}
        {analysis && (
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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
              {[
                {
                  label: "Consignments",
                  value: analysis.totalConsignments,
                  icon: Package,
                  className: "bg-primary/10 text-primary",
                },
                {
                  label: "Line items",
                  value: analysis.totalLineItems,
                  icon: Layers,
                  className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                },
                {
                  label: "Total cartons",
                  value: analysis.totalCartons,
                  icon: Boxes,
                  className: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                },
                {
                  label: "Total quantity",
                  value: analysis.totalQuantity,
                  icon: Hash,
                  className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                },
                {
                  label: "Total cost",
                  value: formatCurrency(analysis.totalCost),
                  icon: FileSpreadsheet,
                  className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                },
                {
                  label: "Total paid",
                  value: formatCurrency(analysis.totalPaid),
                  icon: Banknote,
                  className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
                },
                {
                  label: "Balance to pay",
                  value: formatCurrency(analysis.totalBalanceToPay),
                  icon: Wallet,
                  className: "bg-primary/10 text-primary",
                },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
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
                            {stat.value}
                          </span>
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            {(analysis.byStatus && Object.keys(analysis.byStatus).length > 0) && (
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
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">× {count}</span>
                    </span>
                  ))}
              </motion.div>
            )}
            {analysis.bySupplier && analysis.bySupplier.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...transition, delay: 0.28 }}
                className="rounded-xl border border-border overflow-hidden bg-card shadow-sm"
              >
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
                          <td className="p-4 text-right tabular-nums font-medium whitespace-nowrap">{formatCurrency(s.totalCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </motion.section>
        )}

        {/* Filters & table */}
        <motion.section
          className="space-y-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Filter className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-semibold text-foreground">Search & filters</h2>
          </div>

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
                        onKeyDown={(e) => e.key === "Enter" && applyFilters()}
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
                          <option key={o.value} value={o.value}>{o.label}</option>
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
                          <option key={o.value} value={o.value}>{o.label}</option>
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
                  <Button size="sm" onClick={applyFilters} className="rounded-lg h-9">Apply</Button>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-lg h-9">Clear</Button>
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
                        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-lg" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Delivery date to</Label>
                        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-lg" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Created from</Label>
                        <Input type="date" value={fromCreatedAt} onChange={(e) => setFromCreatedAt(e.target.value)} className="rounded-lg" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Created to</Label>
                        <Input type="date" value={toCreatedAt} onChange={(e) => setToCreatedAt(e.target.value)} className="rounded-lg" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardHeader>
          </Card>
        </motion.section>

        {/* Error state */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-6"
          >
            <h3 className="text-lg font-semibold text-destructive">Unable to load consignments</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {error?.message ?? "Something went wrong. Please try again."}
            </p>
            <Button variant="outline" size="sm" className="mt-4 gap-2 rounded-lg" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </motion.div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && listResponse && consignments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 px-4"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
              <Package className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-foreground">No consignments match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting filters or register a new consignment.</p>
            <Button asChild className="mt-4 gap-2 rounded-lg" size="sm">
              <Link href="/dashboard/consignment/new">
                <Plus className="h-4 w-4" />
                Register consignment
              </Link>
            </Button>
          </motion.div>
        )}

        {/* Table */}
        {!isLoading && !isError && listResponse && consignments.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.08 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Package className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-semibold text-foreground">Consignments</h2>
            </div>

            <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="w-10 p-3" aria-label="Expand" />
                      <th className="text-left font-medium p-4 text-muted-foreground">Reference</th>
                      <th className="text-left font-medium p-4 text-muted-foreground">Supplier</th>
                      <th className="text-left font-medium p-4 text-muted-foreground">Status</th>
                      <th className="text-left font-medium p-4 text-muted-foreground whitespace-nowrap">Delivery date</th>
                      <th className="text-right font-medium p-4 text-muted-foreground">Cartons</th>
                      <th className="text-right font-medium p-4 text-muted-foreground">Qty</th>
                      <th className="text-right font-medium p-4 text-muted-foreground whitespace-nowrap">Total cost</th>
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
                            animate={{ opacity: 1, x: 0 }}
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
                            <td className="p-4 text-muted-foreground whitespace-nowrap">{formatDate(c.deliveryDate)}</td>
                            <td className="p-4 text-right tabular-nums">{c.overallTotalCartons ?? "—"}</td>
                            <td className="p-4 text-right tabular-nums">{c.overallTotalQuantity ?? "—"}</td>
                            <td className="p-4 text-right font-medium tabular-nums whitespace-nowrap">
                              {c.overallTotalCost != null ? formatCurrency(c.overallTotalCost) : "—"}
                            </td>
                            <td className="p-4 tabular-nums">{c.items?.length ?? 0}</td>
                            <td className="p-3">
                              <Button variant="ghost" size="sm" asChild className="gap-2 rounded-lg">
                                <Link href={`/dashboard/consignment/${c.id}`}>
                                  <Pencil className="h-3.5 w-3.5" />
                                  Manage
                                </Link>
                              </Button>
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
                                    <p className="text-xs font-medium text-muted-foreground mb-3">Items in this consignment</p>
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

            {/* Pagination */}
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
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                    className="flex h-9 w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>{n} per page</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </motion.section>
        )}
      </div>
    </>
  );
}
