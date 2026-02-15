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
import {
  Package,
  ShoppingCart,
  FileText,
  RefreshCw,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import type { DashboardData } from "@/lib/api";

const DASHBOARD_QUERY_KEY = "dashboard";

function SummaryCards({ summary }: { summary: NonNullable<DashboardData["summary"]> }) {
  const { consignments, bulkOrders, documents } = summary;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Package className="h-4 w-4" />
            Consignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{consignments.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {consignments.totalItemsReceived} items · {formatCurrency(consignments.totalValue)}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-xs text-muted-foreground">
            {Object.entries(consignments.byStatus)
              .filter(([, count]) => count > 0)
              .map(([status, count]) => (
                <span key={status}>{formatStatus(status)}: {count}</span>
              ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Bulk orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{bulkOrders.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Revenue {formatCurrency(bulkOrders.totalRevenue)} · Paid {formatCurrency(bulkOrders.totalPaid)} · Pending {formatCurrency(bulkOrders.totalPending)}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-xs text-muted-foreground">
            {Object.entries(bulkOrders.byPaymentStatus)
              .filter(([, count]) => count > 0)
              .map(([status, count]) => (
                <span key={status}>{formatStatus(status)}: {count}</span>
              ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">
            {documents.consignmentDocs + documents.bulkOrderDocs}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Consignment: {documents.consignmentDocs} · Bulk order: {documents.bulkOrderDocs}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-xs text-muted-foreground">
            Consignment types: invoice {documents.consignmentByType.invoice}, packing_list {documents.consignmentByType.packing_list} · Bulk types: invoice {documents.bulkOrderByType.invoice}, delivery_note {documents.bulkOrderByType.delivery_note}, receipt {documents.bulkOrderByType.receipt}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DataTable({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">{children}</div>
      </CardContent>
    </Card>
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
    document.title = "Dashboard";
  }, []);

  const displayName =
    formatFullName(userProfile?.first_name, userProfile?.last_name).trim() ||
    userProfile?.email ||
    "User";

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-2 text-destructive">{error?.message ?? "Failed to load dashboard."}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
          Retry
        </Button>
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

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-0.5">Welcome back, {displayName}.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 shrink-0">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {summary && (
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Summary
          </h2>
          <SummaryCards summary={summary} />
        </section>
      )}

      <section id="recent-consignments">
        <h2 className="text-lg font-medium text-foreground mb-4">Recent consignments</h2>
        <DataTable title="Recent consignments">
          {recentConsignments.length === 0 ? (
            <p className="p-4 text-muted-foreground text-sm">No recent consignments.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-medium p-3">Reference</th>
                  <th className="text-left font-medium p-3">Supplier</th>
                  <th className="text-left font-medium p-3">Status</th>
                  <th className="text-left font-medium p-3">Received</th>
                  <th className="text-right font-medium p-3">Items</th>
                  <th className="text-right font-medium p-3">Qty</th>
                  <th className="text-right font-medium p-3">Value</th>
                  <th className="text-right font-medium p-3">Docs</th>
                  <th className="text-left font-medium p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentConsignments.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="p-3 font-medium">{c.referenceNumber}</td>
                    <td className="p-3">{c.supplierName}</td>
                    <td className="p-3">{formatStatus(c.status)}</td>
                    <td className="p-3">{formatDate(c.receivedAt)}</td>
                    <td className="p-3 text-right">{c.itemCount}</td>
                    <td className="p-3 text-right">{c.totalQuantity}</td>
                    <td className="p-3 text-right">{formatCurrency(c.totalValue)}</td>
                    <td className="p-3 text-right">{c.documentCount}</td>
                    <td className="p-3">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataTable>
      </section>

      <section id="recent-bulk-orders">
        <h2 className="text-lg font-medium text-foreground mb-4">Recent bulk orders</h2>
        <DataTable title="Recent bulk orders">
          {recentBulkOrders.length === 0 ? (
            <p className="p-4 text-muted-foreground text-sm">No recent bulk orders.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-medium p-3">Reference</th>
                  <th className="text-left font-medium p-3">Buyer</th>
                  <th className="text-left font-medium p-3">Company</th>
                  <th className="text-left font-medium p-3">Status</th>
                  <th className="text-left font-medium p-3">Payment</th>
                  <th className="text-right font-medium p-3">Total</th>
                  <th className="text-right font-medium p-3">Paid</th>
                  <th className="text-left font-medium p-3">Invoice</th>
                  <th className="text-right font-medium p-3">Items</th>
                  <th className="text-left font-medium p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentBulkOrders.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="p-3 font-medium">{o.referenceNumber}</td>
                    <td className="p-3">{o.buyerName}</td>
                    <td className="p-3">{o.buyerCompany ?? "—"}</td>
                    <td className="p-3">{formatStatus(o.status)}</td>
                    <td className="p-3">{formatStatus(o.paymentStatus ?? "—")}</td>
                    <td className="p-3 text-right">{formatCurrency(o.totalAmount)}</td>
                    <td className="p-3 text-right">{formatCurrency(o.amountPaid)}</td>
                    <td className="p-3">{o.invoiceNumber ?? "—"}</td>
                    <td className="p-3 text-right">{o.itemCount}</td>
                    <td className="p-3">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataTable>
      </section>

      <section id="recent-consignment-documents">
        <h2 className="text-lg font-medium text-foreground mb-4">Recent consignment documents</h2>
        <DataTable title="Recent consignment documents">
          {recentConsignmentDocs.length === 0 ? (
            <p className="p-4 text-muted-foreground text-sm">No recent consignment documents.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-medium p-3">Type</th>
                  <th className="text-left font-medium p-3">Consignment ID</th>
                  <th className="text-left font-medium p-3">Created</th>
                  <th className="text-left font-medium p-3">Link</th>
                </tr>
              </thead>
              <tbody>
                {recentConsignmentDocs.map((d) => (
                  <tr key={d.id} className="border-t border-border">
                    <td className="p-3">{d.documentType}</td>
                    <td className="p-3 font-mono text-xs">{d.consignmentId ?? "—"}</td>
                    <td className="p-3">{formatDateTime(d.createdAt)}</td>
                    <td className="p-3">
                      <a
                        href={d.secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataTable>
      </section>

      <section id="recent-bulk-order-documents">
        <h2 className="text-lg font-medium text-foreground mb-4">Recent bulk order documents</h2>
        <DataTable title="Recent bulk order documents">
          {recentBulkOrderDocs.length === 0 ? (
            <p className="p-4 text-muted-foreground text-sm">No recent bulk order documents.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-medium p-3">Type</th>
                  <th className="text-left font-medium p-3">Bulk order ID</th>
                  <th className="text-left font-medium p-3">Created</th>
                  <th className="text-left font-medium p-3">Link</th>
                </tr>
              </thead>
              <tbody>
                {recentBulkOrderDocs.map((d) => (
                  <tr key={d.id} className="border-t border-border">
                    <td className="p-3">{d.documentType}</td>
                    <td className="p-3 font-mono text-xs">{d.bulkOrderId ?? "—"}</td>
                    <td className="p-3">{formatDateTime(d.createdAt)}</td>
                    <td className="p-3">
                      <a
                        href={d.secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataTable>
      </section>

      <section id="all-consignments">
        <h2 className="text-lg font-medium text-foreground mb-4">All consignments</h2>
        <DataTable title="All consignments">
          {allConsignments.length === 0 ? (
            <p className="p-4 text-muted-foreground text-sm">No consignments.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-medium p-3">Reference</th>
                  <th className="text-left font-medium p-3">Supplier</th>
                  <th className="text-left font-medium p-3">Status</th>
                  <th className="text-left font-medium p-3">Received</th>
                  <th className="text-left font-medium p-3">Location</th>
                  <th className="text-left font-medium p-3">Received by</th>
                  <th className="text-right font-medium p-3">Items</th>
                  <th className="text-right font-medium p-3">Docs</th>
                  <th className="text-left font-medium p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {allConsignments.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="p-3 font-medium">{c.referenceNumber}</td>
                    <td className="p-3">{c.supplierName}</td>
                    <td className="p-3">{formatStatus(c.status)}</td>
                    <td className="p-3">{formatDate(c.receivedAt)}</td>
                    <td className="p-3">{c.warehouseLocation ?? "—"}</td>
                    <td className="p-3">
                      {c.receivedBy
                        ? `${c.receivedBy.first_name} ${c.receivedBy.last_name}`
                        : "—"}
                    </td>
                    <td className="p-3 text-right">{c.items?.length ?? 0}</td>
                    <td className="p-3 text-right">{c.documents?.length ?? 0}</td>
                    <td className="p-3">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataTable>
      </section>

      <section id="all-bulk-orders">
        <h2 className="text-lg font-medium text-foreground mb-4">All bulk orders</h2>
        <DataTable title="All bulk orders">
          {allBulkOrders.length === 0 ? (
            <p className="p-4 text-muted-foreground text-sm">No bulk orders.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-medium p-3">Reference</th>
                  <th className="text-left font-medium p-3">Buyer</th>
                  <th className="text-left font-medium p-3">Company</th>
                  <th className="text-left font-medium p-3">Status</th>
                  <th className="text-left font-medium p-3">Payment</th>
                  <th className="text-right font-medium p-3">Total</th>
                  <th className="text-right font-medium p-3">Paid</th>
                  <th className="text-left font-medium p-3">Invoice</th>
                  <th className="text-right font-medium p-3">Items</th>
                  <th className="text-right font-medium p-3">Docs</th>
                  <th className="text-left font-medium p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {allBulkOrders.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="p-3 font-medium">{o.referenceNumber}</td>
                    <td className="p-3">{o.buyerName}</td>
                    <td className="p-3">{o.buyerCompany ?? "—"}</td>
                    <td className="p-3">{formatStatus(o.status)}</td>
                    <td className="p-3">{formatStatus(o.paymentStatus ?? "—")}</td>
                    <td className="p-3 text-right">
                      {o.totalAmount != null ? formatCurrency(o.totalAmount) : "—"}
                    </td>
                    <td className="p-3 text-right">
                      {o.amountPaid != null ? formatCurrency(o.amountPaid) : "—"}
                    </td>
                    <td className="p-3">{o.invoiceNumber ?? "—"}</td>
                    <td className="p-3 text-right">{o.items?.length ?? 0}</td>
                    <td className="p-3 text-right">{o.documents?.length ?? 0}</td>
                    <td className="p-3">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataTable>
      </section>

      <div className="pt-4">
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
