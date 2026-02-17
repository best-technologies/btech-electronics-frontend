"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { dashboardApi } from "@/lib/api";
import { useQuery } from "@/hooks/useQuery";
import {
  formatFullName,
  formatDate,
  formatDateTime,
  formatCurrency,
  formatStatus,
} from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Package,
  ShoppingCart,
  FileText,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  ArrowRight,
  FileCheck,
  Receipt,
  Boxes,
  Banknote,
} from "lucide-react";
import type { DashboardData } from "@/lib/api";

const DASHBOARD_QUERY_KEY = "dashboard";

function SummaryCards({ summary }: { summary: NonNullable<DashboardData["summary"]> }) {
  const { consignments, bulkOrders, documents, stocks, invoices } = summary;
  return (
    <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
      <Card className="overflow-hidden border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="p-2.5 pb-1.5 sm:p-4 sm:pb-2">
          <div className="flex items-center justify-between gap-1">
            <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5 sm:text-sm sm:gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary sm:h-9 sm:w-9 sm:rounded-lg">
                <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              </span>
              Consignments
            </CardTitle>
            <span className="text-base font-bold text-foreground sm:text-2xl">{consignments.total}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5 p-2.5 pt-0 sm:space-y-3 sm:p-4 sm:pt-0">
          <p className="text-[10px] text-muted-foreground sm:text-xs">
            {consignments.totalItemsReceived} items · {formatCurrency(consignments.totalValue)} value
          </p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(consignments.byStatus)
              .filter(([, count]) => count > 0)
              .map(([status, count]) => (
                <span
                  key={status}
                  className="inline-flex items-center rounded bg-muted/80 px-1.5 py-px text-[9px] font-medium text-muted-foreground sm:rounded-md sm:px-2 sm:py-0.5 sm:text-xs"
                >
                  {formatStatus(status)}: {count}
                </span>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="p-2.5 pb-1.5 sm:p-4 sm:pb-2">
          <div className="flex items-center justify-between gap-1">
            <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5 sm:text-sm sm:gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 sm:h-9 sm:w-9 sm:rounded-lg">
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
              </span>
              Bulk Orders
            </CardTitle>
            <span className="text-base font-bold text-foreground sm:text-2xl">{bulkOrders.total}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5 p-2.5 pt-0 sm:space-y-3 sm:p-4 sm:pt-0">
          <div className="space-y-0.5 text-[10px] text-muted-foreground sm:space-y-1 sm:text-xs">
            <p>
              Revenue {formatCurrency(bulkOrders.totalRevenue)} · Paid{" "}
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {formatCurrency(bulkOrders.totalPaid)}
              </span>
            </p>
            <p>
              Pending{" "}
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {formatCurrency(bulkOrders.totalPending)}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(bulkOrders.byPaymentStatus)
              .filter(([, count]) => count > 0)
              .map(([status, count]) => (
                <span
                  key={status}
                  className="inline-flex items-center rounded bg-muted/80 px-1.5 py-px text-[9px] font-medium text-muted-foreground sm:rounded-md sm:px-2 sm:py-0.5 sm:text-xs"
                >
                  {formatStatus(status)}: {count}
                </span>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md sm:col-span-2 lg:col-span-1">
        <CardHeader className="p-2.5 pb-1.5 sm:p-4 sm:pb-2">
          <div className="flex items-center justify-between gap-1">
            <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5 sm:text-sm sm:gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 sm:h-9 sm:w-9 sm:rounded-lg">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              </span>
              Documents
            </CardTitle>
            <span className="text-base font-bold text-foreground sm:text-2xl">
              {documents.consignmentDocs + documents.bulkOrderDocs}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5 p-2.5 pt-0 sm:space-y-3 sm:p-4 sm:pt-0">
          <p className="text-[10px] text-muted-foreground sm:text-xs">
            Consignment: {documents.consignmentDocs} · Bulk order: {documents.bulkOrderDocs}
          </p>
          <div className="flex flex-wrap gap-1 text-[9px] sm:gap-1.5 sm:text-xs">
            <span className="rounded bg-muted/80 px-1.5 py-px sm:rounded-md sm:px-2 sm:py-0.5">
              Invoice {documents.consignmentByType.invoice + documents.bulkOrderByType.invoice}
            </span>
            <span className="rounded bg-muted/80 px-1.5 py-px sm:rounded-md sm:px-2 sm:py-0.5">
              Packing {documents.consignmentByType.packing_list}
            </span>
            <span className="rounded bg-muted/80 px-1.5 py-px sm:rounded-md sm:px-2 sm:py-0.5">
              Delivery {documents.bulkOrderByType.delivery_note}
            </span>
            <span className="rounded bg-muted/80 px-1.5 py-px sm:rounded-md sm:px-2 sm:py-0.5">
              Receipt {documents.bulkOrderByType.receipt}
            </span>
          </div>
        </CardContent>
      </Card>

      {stocks != null && (
        <Card className="overflow-hidden border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="p-2.5 pb-1.5 sm:p-4 sm:pb-2">
            <div className="flex items-center justify-between gap-1">
              <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5 sm:text-sm sm:gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 sm:h-9 sm:w-9 sm:rounded-lg">
                  <Boxes className="h-3 w-3 sm:h-4 sm:w-4" />
                </span>
                Stocks
              </CardTitle>
              <span className="text-base font-bold text-foreground sm:text-2xl">{stocks.totalProducts}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 p-2.5 pt-0 sm:space-y-3 sm:p-4 sm:pt-0">
            <p className="text-[10px] text-muted-foreground sm:text-xs">
              {stocks.activeProducts} active · {formatCurrency(stocks.totalValue)} · {stocks.totalQuantity.toLocaleString()} units
            </p>
            {(stocks.lowStockCount > 0 || stocks.outOfStockCount > 0) && (
              <div className="flex flex-wrap gap-1">
                {stocks.lowStockCount > 0 && (
                  <span className="inline-flex items-center rounded bg-amber-500/15 px-1.5 py-px text-[9px] font-medium text-amber-700 dark:text-amber-400 sm:rounded-md sm:px-2 sm:py-0.5 sm:text-xs">
                    Low: {stocks.lowStockCount}
                  </span>
                )}
                {stocks.outOfStockCount > 0 && (
                  <span className="inline-flex items-center rounded bg-destructive/15 px-1.5 py-px text-[9px] font-medium text-destructive sm:rounded-md sm:px-2 sm:py-0.5 sm:text-xs">
                    Out: {stocks.outOfStockCount}
                  </span>
                )}
              </div>
            )}
            {stocks.byCategory.length > 0 && (
              <div className="hidden flex-wrap gap-1 sm:flex sm:gap-1.5">
                {stocks.byCategory.slice(0, 5).map(({ category, count }) => (
                  <span
                    key={category}
                    className="inline-flex items-center rounded-md bg-muted/80 px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    {category || "Uncategorized"}: {count}
                  </span>
                ))}
                {stocks.byCategory.length > 5 && (
                  <span className="text-xs text-muted-foreground">+{stocks.byCategory.length - 5} more</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {invoices != null && (
        <Card className="overflow-hidden border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="p-2.5 pb-1.5 sm:p-4 sm:pb-2">
            <div className="flex items-center justify-between gap-1">
              <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5 sm:text-sm sm:gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 sm:h-9 sm:w-9 sm:rounded-lg">
                  <Banknote className="h-3 w-3 sm:h-4 sm:w-4" />
                </span>
                Invoices
              </CardTitle>
              <span className="text-base font-bold text-foreground sm:text-2xl">{invoices.totalInvoices}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 p-2.5 pt-0 sm:space-y-3 sm:p-4 sm:pt-0">
            <p className="text-[10px] text-muted-foreground sm:text-xs">
              Total {formatCurrency(invoices.totalAmount)} · Paid{" "}
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {formatCurrency(invoices.totalPaid)}
              </span>
            </p>
            {invoices.totalBalanceDue > 0 && (
              <p className="text-[10px] sm:text-xs">
                Balance{" "}
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {formatCurrency(invoices.totalBalanceDue)}
                </span>
              </p>
            )}
            <div className="flex flex-wrap gap-1">
              {Object.entries(invoices.byStatus)
                .filter(([, count]) => typeof count === "number" && count > 0)
                .map(([status, count]) => (
                  <span
                    key={status}
                    className="inline-flex items-center rounded bg-muted/80 px-1.5 py-px text-[9px] font-medium text-muted-foreground sm:rounded-md sm:px-2 sm:py-0.5 sm:text-xs"
                  >
                    {formatStatus(status)}: {count}
                  </span>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DataSection({
  title,
  icon: Icon,
  id,
  children,
}: {
  title: string;
  icon: React.ElementType;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="space-y-2 sm:space-y-4">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-muted text-muted-foreground sm:h-8 sm:w-8 sm:rounded-lg">
          <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
        </span>
        <h2 className="text-xs font-semibold text-foreground sm:text-lg">{title}</h2>
      </div>
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardContent className="p-0">
          <div className="-mx-px overflow-x-auto">{children}</div>
        </CardContent>
      </Card>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-2.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-8 animate-pulse">
      <div className="h-5 w-28 rounded bg-muted sm:h-10 sm:w-48" />
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-muted sm:h-32 sm:rounded-xl" />
        ))}
      </div>
      <div className="h-32 rounded-lg bg-muted sm:h-64 sm:rounded-xl" />
      <div className="h-32 rounded-lg bg-muted sm:h-64 sm:rounded-xl" />
    </div>
  );
}

export default function DashboardPage() {
  const userProfile = useAuthStore((s) => s.userProfile);
  const accessToken = useAuthStore((s) => s.accessToken);

  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => dashboardApi.getDashboard(accessToken!),
    enabled: !!accessToken,
  });

  useEffect(() => {
    document.title = "Dashboard | BTech-Electronics";
  }, []);

  const displayName =
    formatFullName(userProfile?.first_name, userProfile?.last_name).trim() ||
    userProfile?.email ||
    "User";

  if (isLoading) {
    return (
      <>
        <div className="border-b border-border bg-card/50">
          <div className="w-full px-2.5 py-3 sm:px-6 sm:py-8 lg:px-8">
            <div className="h-4 w-24 rounded bg-muted animate-pulse sm:h-8 sm:w-64" />
            <div className="mt-1.5 h-3 w-40 rounded bg-muted/70 animate-pulse sm:mt-2 sm:h-5 sm:w-96" />
          </div>
        </div>
        <LoadingSkeleton />
      </>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:p-6">
          <h1 className="text-lg font-semibold text-destructive">Unable to load dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error?.message ?? "Failed to load dashboard. Please try again."}
          </p>
          <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const summary = dashboard.summary;
  const recentConsignments = dashboard.recentConsignments ?? [];
  const recentBulkOrders = dashboard.recentBulkOrders ?? [];
  const recentConsignmentDocs = dashboard.recentConsignmentDocuments ?? [];
  const recentBulkOrderDocs = dashboard.recentBulkOrderDocuments ?? [];
  const allConsignments = dashboard.allConsignments ?? [];
  const allBulkOrders = dashboard.allBulkOrders ?? [];

  const EmptyTable = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center px-4 py-10 sm:py-16">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="w-full px-2.5 py-3 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-foreground sm:text-2xl">Dashboard</h1>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-base">
                Welcome back, <span className="font-medium text-foreground">{displayName}</span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="h-7 gap-1.5 text-[11px] touch-manipulation sm:h-9 sm:gap-2 sm:text-sm"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button size="sm" asChild className="h-7 gap-1.5 text-[11px] touch-manipulation sm:h-9 sm:gap-2 sm:text-sm">
                <Link href="/dashboard/consignment">
                  <span className="hidden sm:inline">New Consignment</span>
                  <span className="sm:hidden">New</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-2.5 py-3 sm:px-6 sm:py-8 lg:px-8 space-y-5 sm:space-y-10">
        {/* Summary */}
        {summary && (
          <section>
            <div className="mb-2.5 flex items-center gap-1.5 sm:mb-4 sm:gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-primary sm:h-5 sm:w-5" />
              <h2 className="text-xs font-semibold text-foreground sm:text-lg">Overview</h2>
            </div>
            <SummaryCards summary={summary} />
          </section>
        )}

        {/* Recent Consignments */}
        <DataSection title="Recent consignments" icon={Package} id="recent-consignments">
          {recentConsignments.length === 0 ? (
            <EmptyTable message="No recent consignments." />
          ) : (
            <table className="w-full text-[11px] sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Reference</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Supplier</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Status</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Received</th>
                  <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Items</th>
                  <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Qty</th>
                  <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Value</th>
                  <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Docs</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Created</th>
                  <th className="w-8 sm:w-10" />
                </tr>
              </thead>
              <tbody>
                {recentConsignments.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-2 py-1.5 font-medium sm:p-4">
                      <Link
                        href={`/dashboard/consignment/${c.id}`}
                        className="text-primary hover:underline"
                      >
                        {c.referenceNumber}
                      </Link>
                    </td>
                    <td className="px-2 py-1.5 sm:p-4">{c.supplierName}</td>
                    <td className="px-2 py-1.5 sm:p-4">
                      <StatusBadge status={formatStatus(c.status)} />
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground sm:p-4">{formatDate(c.receivedAt)}</td>
                    <td className="px-2 py-1.5 text-right sm:p-4">{c.itemCount}</td>
                    <td className="px-2 py-1.5 text-right sm:p-4">{c.totalQuantity}</td>
                    <td className="px-2 py-1.5 text-right font-medium sm:p-4">{formatCurrency(c.totalValue)}</td>
                    <td className="px-2 py-1.5 text-right sm:p-4">{c.documentCount}</td>
                    <td className="px-2 py-1.5 text-muted-foreground sm:p-4">{formatDate(c.createdAt)}</td>
                    <td className="px-2 py-1.5 sm:p-4">
                      <Link
                        href={`/dashboard/consignment/${c.id}`}
                        className="inline-flex text-primary hover:text-primary/80"
                        aria-label="View consignment"
                      >
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataSection>

        {/* Recent Bulk Orders */}
        <DataSection title="Recent bulk orders" icon={ShoppingCart} id="recent-bulk-orders">
          {recentBulkOrders.length === 0 ? (
            <EmptyTable message="No recent bulk orders." />
          ) : (
            <table className="w-full text-[11px] sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Reference</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Buyer</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Company</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Status</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Payment</th>
                  <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Total</th>
                  <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Paid</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Invoice</th>
                  <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Items</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentBulkOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-2 py-1.5 font-medium sm:p-4">{o.referenceNumber}</td>
                    <td className="px-2 py-1.5 sm:p-4">{o.buyerName}</td>
                    <td className="px-2 py-1.5 text-muted-foreground sm:p-4">{o.buyerCompany ?? "—"}</td>
                    <td className="px-2 py-1.5 sm:p-4">
                      <StatusBadge status={formatStatus(o.status)} />
                    </td>
                    <td className="px-2 py-1.5 sm:p-4">
                      <StatusBadge status={formatStatus(o.paymentStatus ?? "—")} />
                    </td>
                    <td className="px-2 py-1.5 text-right font-medium sm:p-4">
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="px-2 py-1.5 text-right text-muted-foreground sm:p-4">
                      {formatCurrency(o.amountPaid)}
                    </td>
                    <td className="px-2 py-1.5 font-mono text-[10px] sm:p-4 sm:text-xs">{o.invoiceNumber ?? "—"}</td>
                    <td className="px-2 py-1.5 text-right sm:p-4">{o.itemCount}</td>
                    <td className="px-2 py-1.5 text-muted-foreground sm:p-4">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataSection>

        {/* Recent Consignment Documents */}
        <DataSection
          title="Recent consignment documents"
          icon={FileCheck}
          id="recent-consignment-documents"
        >
          {recentConsignmentDocs.length === 0 ? (
            <EmptyTable message="No recent consignment documents." />
          ) : (
            <table className="w-full text-[11px] sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Type</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Consignment ID</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Created</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Link</th>
                </tr>
              </thead>
              <tbody>
                {recentConsignmentDocs.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-2 py-1.5 sm:p-4">
                      <StatusBadge status={formatStatus(d.documentType.replace(/_/g, " "))} />
                    </td>
                    <td className="px-2 py-1.5 font-mono text-[10px] text-muted-foreground sm:p-4 sm:text-xs">
                      {d.consignmentId ?? "—"}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground sm:p-4">{formatDateTime(d.createdAt)}</td>
                    <td className="px-2 py-1.5 sm:p-4">
                      <a
                        href={d.secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline font-medium sm:gap-1.5"
                      >
                        Open <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataSection>

        {/* Recent Bulk Order Documents */}
        <DataSection
          title="Recent bulk order documents"
          icon={Receipt}
          id="recent-bulk-order-documents"
        >
          {recentBulkOrderDocs.length === 0 ? (
            <EmptyTable message="No recent bulk order documents." />
          ) : (
            <table className="w-full text-[11px] sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Type</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Bulk order ID</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Created</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Link</th>
                </tr>
              </thead>
              <tbody>
                {recentBulkOrderDocs.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-2 py-1.5 sm:p-4">
                      <StatusBadge status={formatStatus(d.documentType.replace(/_/g, " "))} />
                    </td>
                    <td className="px-2 py-1.5 font-mono text-[10px] text-muted-foreground sm:p-4 sm:text-xs">
                      {d.bulkOrderId ?? "—"}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground sm:p-4">{formatDateTime(d.createdAt)}</td>
                    <td className="px-2 py-1.5 sm:p-4">
                      <a
                        href={d.secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline font-medium sm:gap-1.5"
                      >
                        Open <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataSection>

        {/* All Consignments */}
        <DataSection title="All consignments" icon={Package} id="all-consignments">
          {allConsignments.length === 0 ? (
            <EmptyTable message="No consignments." />
          ) : (
            <table className="w-full text-[11px] sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Reference</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Supplier</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Status</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Received</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Location</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Received by</th>
                  <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Items</th>
                  <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Docs</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Created</th>
                  <th className="w-8 sm:w-10" />
                </tr>
              </thead>
              <tbody>
                {allConsignments.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-2 py-1.5 font-medium sm:p-4">
                      <Link
                        href={`/dashboard/consignment/${c.id}`}
                        className="text-primary hover:underline"
                      >
                        {c.referenceNumber}
                      </Link>
                    </td>
                    <td className="px-2 py-1.5 sm:p-4">{c.supplierName}</td>
                    <td className="px-2 py-1.5 sm:p-4">
                      <StatusBadge status={formatStatus(c.status)} />
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground sm:p-4">{formatDate(c.receivedAt)}</td>
                    <td className="px-2 py-1.5 text-muted-foreground sm:p-4">{c.warehouseLocation ?? "—"}</td>
                    <td className="px-2 py-1.5 text-muted-foreground sm:p-4">
                      {c.receivedBy
                        ? `${c.receivedBy.first_name} ${c.receivedBy.last_name}`
                        : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-right sm:p-4">{c.items?.length ?? 0}</td>
                    <td className="px-2 py-1.5 text-right sm:p-4">{c.documents?.length ?? 0}</td>
                    <td className="px-2 py-1.5 text-muted-foreground sm:p-4">{formatDate(c.createdAt)}</td>
                    <td className="px-2 py-1.5 sm:p-4">
                      <Link
                        href={`/dashboard/consignment/${c.id}`}
                        className="inline-flex text-primary hover:text-primary/80"
                        aria-label="View consignment"
                      >
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataSection>

        {/* All Bulk Orders */}
        <DataSection title="All bulk orders" icon={ShoppingCart} id="all-bulk-orders">
          {allBulkOrders.length === 0 ? (
            <EmptyTable message="No bulk orders." />
          ) : (
            <table className="w-full text-[11px] sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Reference</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Buyer</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Company</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Status</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Payment</th>
                  <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Total</th>
                  <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Paid</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Invoice</th>
                  <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Items</th>
                  <th className="text-right font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Docs</th>
                  <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {allBulkOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-2 py-1.5 font-medium sm:p-4">{o.referenceNumber}</td>
                    <td className="px-2 py-1.5 sm:p-4">{o.buyerName}</td>
                    <td className="px-2 py-1.5 text-muted-foreground sm:p-4">{o.buyerCompany ?? "—"}</td>
                    <td className="px-2 py-1.5 sm:p-4">
                      <StatusBadge status={formatStatus(o.status)} />
                    </td>
                    <td className="px-2 py-1.5 sm:p-4">
                      <StatusBadge status={formatStatus(o.paymentStatus ?? "—")} />
                    </td>
                    <td className="px-2 py-1.5 text-right font-medium sm:p-4">
                      {o.totalAmount != null ? formatCurrency(o.totalAmount) : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-right text-muted-foreground sm:p-4">
                      {o.amountPaid != null ? formatCurrency(o.amountPaid) : "—"}
                    </td>
                    <td className="px-2 py-1.5 font-mono text-[10px] sm:p-4 sm:text-xs">{o.invoiceNumber ?? "—"}</td>
                    <td className="px-2 py-1.5 text-right sm:p-4">{o.items?.length ?? 0}</td>
                    <td className="px-2 py-1.5 text-right sm:p-4">{o.documents?.length ?? 0}</td>
                    <td className="px-2 py-1.5 text-muted-foreground sm:p-4">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataSection>

        {/* Back to home */}
        <div className="border-t border-border pt-5 sm:pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline sm:gap-2 sm:text-sm"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </>
  );
}
