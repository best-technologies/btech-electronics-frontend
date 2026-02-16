"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { invoiceApi, type ListInvoiceParams, type InvoiceSortBy } from "@/lib/api";
import { useQuery } from "@/hooks/useQuery";
import {
  InvoiceHeader,
  InvoiceOverviewSection,
  InvoiceFiltersSection,
  InvoiceTable,
  InvoicePagination,
} from "./components";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText } from "lucide-react";
import Link from "next/link";

const INVOICE_LIST_KEY_PREFIX = "invoice-list";
const DEFAULT_LIMIT = 20;

function buildListKey(params: ListInvoiceParams): string {
  return `${INVOICE_LIST_KEY_PREFIX}-${JSON.stringify(params ?? {})}`;
}

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex gap-4">
        <div className="h-10 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-10 w-36 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-muted/80 animate-pulse" />
        ))}
      </div>
      <div className="h-24 rounded-xl bg-muted/60 animate-pulse" />
      <div className="h-96 rounded-xl bg-muted/60 animate-pulse" />
    </div>
  );
}

export default function InvoicePage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromIssueDate, setFromIssueDate] = useState("");
  const [toIssueDate, setToIssueDate] = useState("");
  const [sortBy, setSortBy] = useState<InvoiceSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const listParams: ListInvoiceParams = useMemo(
    () => ({
      page,
      limit,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(status.trim() ? { status: status.trim() } : {}),
      ...(fromIssueDate ? { fromIssueDate } : {}),
      ...(toIssueDate ? { toIssueDate } : {}),
      sortBy,
      sortOrder,
    }),
    [page, limit, search, status, fromIssueDate, toIssueDate, sortBy, sortOrder]
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
    queryFn: () => invoiceApi.list(accessToken!, listParams),
    enabled: !!accessToken,
  });

  const items = listResponse?.items ?? [];
  const analysis = listResponse?.analysis;
  const meta = listResponse?.meta;

  useEffect(() => {
    document.title = "Invoices | BTech-Electronics";
  }, []);

  const applyFilters = () => setPage(1);
  const clearFilters = () => {
    setPage(1);
    setSearch("");
    setStatus("");
    setFromIssueDate("");
    setToIssueDate("");
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
      <InvoiceHeader onRefresh={() => refetch()} />

      <div className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        {analysis && <InvoiceOverviewSection analysis={analysis} />}

        <InvoiceFiltersSection
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          fromIssueDate={fromIssueDate}
          onFromIssueDateChange={setFromIssueDate}
          toIssueDate={toIssueDate}
          onToIssueDateChange={setToIssueDate}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          onApply={applyFilters}
          onClear={clearFilters}
        />

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <h3 className="text-lg font-semibold text-destructive">Unable to load invoices</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {error?.message ?? "Something went wrong. Please try again."}
            </p>
            <Button variant="outline" size="sm" className="mt-4 gap-2 rounded-lg" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && listResponse && items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
              <FileText className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-foreground">No invoices match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your first invoice to get started.</p>
            <Button asChild className="mt-4 gap-2 rounded-lg" size="sm">
              <Link href="/dashboard/invoice/new">
                New invoice
              </Link>
            </Button>
          </div>
        )}

        {!isLoading && !isError && listResponse && items.length > 0 && (
          <>
            <InvoiceTable items={items} />
            {meta && (
              <InvoicePagination
                meta={meta}
                limit={limit}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
