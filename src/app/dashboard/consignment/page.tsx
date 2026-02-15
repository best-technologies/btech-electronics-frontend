"use client";

import { useEffect, useState, Fragment, useMemo } from "react";
import Link from "next/link";
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
import { Plus, ChevronDown, ChevronRight, Pencil, Search, SlidersHorizontal } from "lucide-react";

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
    document.title = "Consignment";
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Consignment</h1>
        <Button asChild>
          <Link href="/dashboard/consignment/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Register new consignment
          </Link>
        </Button>
      </div>

      {analysis && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Analysis (filtered set)</CardTitle>
            <p className="text-xs text-muted-foreground">
              Totals and breakdown for all consignments matching current filters.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Consignments</p>
                <p className="font-semibold">{analysis.totalConsignments}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Line items</p>
                <p className="font-semibold">{analysis.totalLineItems}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total cartons</p>
                <p className="font-semibold">{analysis.totalCartons}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total qty</p>
                <p className="font-semibold">{analysis.totalQuantity}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total cost</p>
                <p className="font-semibold">{formatCurrency(analysis.totalCost)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total paid</p>
                <p className="font-semibold">{formatCurrency(analysis.totalPaid)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Balance to pay</p>
                <p className="font-semibold">{formatCurrency(analysis.totalBalanceToPay)}</p>
              </div>
            </div>
            {analysis.byStatus && Object.keys(analysis.byStatus).length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">By status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.byStatus)
                    .filter(([, count]) => count > 0)
                    .map(([s, count]) => (
                      <span
                        key={s}
                        className="rounded-md bg-muted px-2 py-1 text-xs"
                      >
                        {formatStatus(s)}: {count}
                      </span>
                    ))}
                </div>
              </div>
            )}
            {analysis.bySupplier && analysis.bySupplier.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">By supplier (top 10)</p>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left font-medium p-2">Supplier</th>
                        <th className="text-right font-medium p-2">Count</th>
                        <th className="text-right font-medium p-2">Total qty</th>
                        <th className="text-right font-medium p-2">Total cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.bySupplier.map((s, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="p-2">{s.supplierName}</td>
                          <td className="p-2 text-right">{s.count}</td>
                          <td className="p-2 text-right">{s.totalQuantity}</td>
                          <td className="p-2 text-right">{formatCurrency(s.totalCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <Label className="sr-only">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reference, invoice, supplier, delivery note..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-36">
              <Label className="sr-only">Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ConsignmentStatus | "")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="w-40">
              <Label className="sr-only">Sort by</Label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ConsignmentSortBy)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="flex h-9 w-24 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
            <Button variant="outline" size="sm" onClick={() => setShowFilters((s) => !s)} className="gap-1">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            <Button size="sm" onClick={applyFilters}>Apply</Button>
            <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
          </div>
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 mt-3 border-t border-border">
              <div className="space-y-1">
                <Label className="text-xs">Reference number</Label>
                <Input
                  placeholder="Contains"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Invoice number</Label>
                <Input
                  placeholder="Contains"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Supplier name</Label>
                <Input
                  placeholder="Contains"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Delivery date from</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Delivery date to</Label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Created from</Label>
                <Input type="date" value={fromCreatedAt} onChange={(e) => setFromCreatedAt(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Created to</Label>
                <Input type="date" value={toCreatedAt} onChange={(e) => setToCreatedAt(e.target.value)} />
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {isLoading && <p className="text-muted-foreground">Loading consignments…</p>}
      {isError && (
        <div className="text-destructive">
          <p>{error?.message ?? "Failed to load consignments."}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}
      {!isLoading && !isError && listResponse && consignments.length === 0 && (
        <p className="text-muted-foreground">No consignments match your filters.</p>
      )}
      {!isLoading && !isError && listResponse && consignments.length > 0 && (
        <>
          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-9 p-2" aria-label="Expand" />
                  <th className="text-left font-medium p-3">Reference</th>
                  <th className="text-left font-medium p-3">Supplier</th>
                  <th className="text-left font-medium p-3">Status</th>
                  <th className="text-left font-medium p-3">Delivery date</th>
                  <th className="text-right font-medium p-3">Total cartons</th>
                  <th className="text-right font-medium p-3">Total qty</th>
                  <th className="text-right font-medium p-3">Total cost</th>
                  <th className="text-left font-medium p-3">Items</th>
                  <th className="w-20 p-2" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {consignments.map((c) => (
                  <Fragment key={c.id}>
                    <tr className="border-t border-border hover:bg-muted/30">
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={() => setExpandedId((id) => (id === c.id ? null : c.id))}
                          className="p-1 rounded hover:bg-muted text-muted-foreground"
                          aria-expanded={expandedId === c.id}
                        >
                          {expandedId === c.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 font-medium">{c.referenceNumber}</td>
                      <td className="p-3">{c.supplierName}</td>
                      <td className="p-3">{formatStatus(c.status)}</td>
                      <td className="p-3">{formatDate(c.deliveryDate)}</td>
                      <td className="p-3 text-right">{c.overallTotalCartons ?? "—"}</td>
                      <td className="p-3 text-right">{c.overallTotalQuantity ?? "—"}</td>
                      <td className="p-3 text-right">{c.overallTotalCost != null ? formatCurrency(c.overallTotalCost) : "—"}</td>
                      <td className="p-3">{c.items?.length ?? 0}</td>
                      <td className="p-2">
                        <Button variant="ghost" size="sm" asChild className="gap-1">
                          <Link href={`/dashboard/consignment/${c.id}`}>
                            <Pencil className="h-3.5 w-3.5" />
                            Manage
                          </Link>
                        </Button>
                      </td>
                    </tr>
                    {expandedId === c.id && (
                      <tr className="border-t border-border bg-muted/20">
                        <td colSpan={10} className="p-0">
                          <div className="py-2">
                            <p className="text-xs font-medium text-muted-foreground px-4 pb-1">Items in this consignment</p>
                            <ItemsRow items={c.items ?? []} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {meta && (
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages} · {meta.total} total
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="flex h-8 w-28 rounded-md border border-input bg-background px-2 py-1 text-sm"
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>{n} per page</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
