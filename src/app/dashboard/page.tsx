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
} from "lucide-react";
import type { DashboardData } from "@/lib/api";

const DASHBOARD_QUERY_KEY = "dashboard";

function SummaryCards({ summary }: { summary: NonNullable<DashboardData["summary"]> }) {
  const { consignments, bulkOrders, documents } = summary;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="overflow-hidden border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Package className="h-4 w-4" />
              </span>
              Consignments
            </CardTitle>
            <span className="text-2xl font-bold text-foreground">{consignments.total}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {consignments.totalItemsReceived} items · {formatCurrency(consignments.totalValue)} value
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(consignments.byStatus)
              .filter(([, count]) => count > 0)
              .map(([status, count]) => (
                <span
                  key={status}
                  className="inline-flex items-center rounded-md bg-muted/80 px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {formatStatus(status)}: {count}
                </span>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShoppingCart className="h-4 w-4" />
              </span>
              Bulk Orders
            </CardTitle>
            <span className="text-2xl font-bold text-foreground">{bulkOrders.total}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1 text-xs text-muted-foreground">
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
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(bulkOrders.byPaymentStatus)
              .filter(([, count]) => count > 0)
              .map(([status, count]) => (
                <span
                  key={status}
                  className="inline-flex items-center rounded-md bg-muted/80 px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {formatStatus(status)}: {count}
                </span>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md sm:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FileText className="h-4 w-4" />
              </span>
              Documents
            </CardTitle>
            <span className="text-2xl font-bold text-foreground">
              {documents.consignmentDocs + documents.bulkOrderDocs}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Consignment: {documents.consignmentDocs} · Bulk order: {documents.bulkOrderDocs}
          </p>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <span className="rounded-md bg-muted/80 px-2 py-0.5">
              Invoice {documents.consignmentByType.invoice + documents.bulkOrderByType.invoice}
            </span>
            <span className="rounded-md bg-muted/80 px-2 py-0.5">
              Packing {documents.consignmentByType.packing_list}
            </span>
            <span className="rounded-md bg-muted/80 px-2 py-0.5">
              Delivery note {documents.bulkOrderByType.delivery_note}
            </span>
            <span className="rounded-md bg-muted/80 px-2 py-0.5">
              Receipt {documents.bulkOrderByType.receipt}
            </span>
          </div>
        </CardContent>
      </Card>
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
    <section id={id} className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">{children}</div>
        </CardContent>
      </Card>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-8 animate-pulse">
      <div className="h-10 w-48 rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-muted" />
      <div className="h-64 rounded-xl bg-muted" />
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
    document.title = "Dashboard | Best Technologies";
  }, []);

  const displayName =
    formatFullName(userProfile?.first_name, userProfile?.last_name).trim() ||
    userProfile?.email ||
    "User";

  if (isLoading) {
    return (
      <>
        <div className="border-b border-border bg-card/50">
          <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
            <div className="h-8 w-64 rounded bg-muted animate-pulse" />
            <div className="mt-2 h-5 w-96 rounded bg-muted/70 animate-pulse" />
          </div>
        </div>
        <LoadingSkeleton />
      </>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
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
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
              <p className="mt-0.5 text-muted-foreground">
                Welcome back, <span className="font-medium text-foreground">{displayName}</span>
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
              <Button size="sm" asChild className="gap-2">
                <Link href="/dashboard/consignment">
                  New Consignment
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* Summary */}
        {summary && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Overview</h2>
            </div>
            <SummaryCards summary={summary} />
          </section>
        )}

        {/* Recent Consignments */}
        <DataSection title="Recent consignments" icon={Package} id="recent-consignments">
          {recentConsignments.length === 0 ? (
            <EmptyTable message="No recent consignments." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium p-4 text-muted-foreground">Reference</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Supplier</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Status</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Received</th>
                  <th className="text-right font-medium p-4 text-muted-foreground">Items</th>
                  <th className="text-right font-medium p-4 text-muted-foreground">Qty</th>
                  <th className="text-right font-medium p-4 text-muted-foreground">Value</th>
                  <th className="text-right font-medium p-4 text-muted-foreground">Docs</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Created</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {recentConsignments.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="p-4 font-medium">
                      <Link
                        href={`/dashboard/consignment/${c.id}`}
                        className="text-primary hover:underline"
                      >
                        {c.referenceNumber}
                      </Link>
                    </td>
                    <td className="p-4">{c.supplierName}</td>
                    <td className="p-4">
                      <StatusBadge status={formatStatus(c.status)} />
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDate(c.receivedAt)}</td>
                    <td className="p-4 text-right">{c.itemCount}</td>
                    <td className="p-4 text-right">{c.totalQuantity}</td>
                    <td className="p-4 text-right font-medium">{formatCurrency(c.totalValue)}</td>
                    <td className="p-4 text-right">{c.documentCount}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(c.createdAt)}</td>
                    <td className="p-4">
                      <Link
                        href={`/dashboard/consignment/${c.id}`}
                        className="inline-flex text-primary hover:text-primary/80"
                        aria-label="View consignment"
                      >
                        <ArrowRight className="h-4 w-4" />
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium p-4 text-muted-foreground">Reference</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Buyer</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Company</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Status</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Payment</th>
                  <th className="text-right font-medium p-4 text-muted-foreground">Total</th>
                  <th className="text-right font-medium p-4 text-muted-foreground">Paid</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Invoice</th>
                  <th className="text-right font-medium p-4 text-muted-foreground">Items</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentBulkOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="p-4 font-medium">{o.referenceNumber}</td>
                    <td className="p-4">{o.buyerName}</td>
                    <td className="p-4 text-muted-foreground">{o.buyerCompany ?? "—"}</td>
                    <td className="p-4">
                      <StatusBadge status={formatStatus(o.status)} />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={formatStatus(o.paymentStatus ?? "—")} />
                    </td>
                    <td className="p-4 text-right font-medium">
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="p-4 text-right text-muted-foreground">
                      {formatCurrency(o.amountPaid)}
                    </td>
                    <td className="p-4 font-mono text-xs">{o.invoiceNumber ?? "—"}</td>
                    <td className="p-4 text-right">{o.itemCount}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(o.createdAt)}</td>
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium p-4 text-muted-foreground">Type</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Consignment ID</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Created</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Link</th>
                </tr>
              </thead>
              <tbody>
                {recentConsignmentDocs.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="p-4">
                      <StatusBadge status={formatStatus(d.documentType.replace(/_/g, " "))} />
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      {d.consignmentId ?? "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDateTime(d.createdAt)}</td>
                    <td className="p-4">
                      <a
                        href={d.secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
                      >
                        Open <ExternalLink className="h-3.5 w-3.5" />
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium p-4 text-muted-foreground">Type</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Bulk order ID</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Created</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Link</th>
                </tr>
              </thead>
              <tbody>
                {recentBulkOrderDocs.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="p-4">
                      <StatusBadge status={formatStatus(d.documentType.replace(/_/g, " "))} />
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      {d.bulkOrderId ?? "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDateTime(d.createdAt)}</td>
                    <td className="p-4">
                      <a
                        href={d.secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
                      >
                        Open <ExternalLink className="h-3.5 w-3.5" />
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium p-4 text-muted-foreground">Reference</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Supplier</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Status</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Received</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Location</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Received by</th>
                  <th className="text-right font-medium p-4 text-muted-foreground">Items</th>
                  <th className="text-right font-medium p-4 text-muted-foreground">Docs</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Created</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {allConsignments.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="p-4 font-medium">
                      <Link
                        href={`/dashboard/consignment/${c.id}`}
                        className="text-primary hover:underline"
                      >
                        {c.referenceNumber}
                      </Link>
                    </td>
                    <td className="p-4">{c.supplierName}</td>
                    <td className="p-4">
                      <StatusBadge status={formatStatus(c.status)} />
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDate(c.receivedAt)}</td>
                    <td className="p-4 text-muted-foreground">{c.warehouseLocation ?? "—"}</td>
                    <td className="p-4 text-muted-foreground">
                      {c.receivedBy
                        ? `${c.receivedBy.first_name} ${c.receivedBy.last_name}`
                        : "—"}
                    </td>
                    <td className="p-4 text-right">{c.items?.length ?? 0}</td>
                    <td className="p-4 text-right">{c.documents?.length ?? 0}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(c.createdAt)}</td>
                    <td className="p-4">
                      <Link
                        href={`/dashboard/consignment/${c.id}`}
                        className="inline-flex text-primary hover:text-primary/80"
                        aria-label="View consignment"
                      >
                        <ArrowRight className="h-4 w-4" />
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium p-4 text-muted-foreground">Reference</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Buyer</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Company</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Status</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Payment</th>
                  <th className="text-right font-medium p-4 text-muted-foreground">Total</th>
                  <th className="text-right font-medium p-4 text-muted-foreground">Paid</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Invoice</th>
                  <th className="text-right font-medium p-4 text-muted-foreground">Items</th>
                  <th className="text-right font-medium p-4 text-muted-foreground">Docs</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {allBulkOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="p-4 font-medium">{o.referenceNumber}</td>
                    <td className="p-4">{o.buyerName}</td>
                    <td className="p-4 text-muted-foreground">{o.buyerCompany ?? "—"}</td>
                    <td className="p-4">
                      <StatusBadge status={formatStatus(o.status)} />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={formatStatus(o.paymentStatus ?? "—")} />
                    </td>
                    <td className="p-4 text-right font-medium">
                      {o.totalAmount != null ? formatCurrency(o.totalAmount) : "—"}
                    </td>
                    <td className="p-4 text-right text-muted-foreground">
                      {o.amountPaid != null ? formatCurrency(o.amountPaid) : "—"}
                    </td>
                    <td className="p-4 font-mono text-xs">{o.invoiceNumber ?? "—"}</td>
                    <td className="p-4 text-right">{o.items?.length ?? 0}</td>
                    <td className="p-4 text-right">{o.documents?.length ?? 0}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataSection>

        {/* Back to home */}
        <div className="border-t border-border pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </>
  );
}
