/**
 * Distribution Dashboard API.
 * GET /distribution/dashboard — full view: summary, recent and all consignments/bulk orders/documents.
 * @see README.md (Distribution Dashboard API)
 */

import { apiClient } from "../client";
import type { ApiRequestConfig } from "../types";
import type { BackendResponse } from "../backend-types";
import { unwrapBackendResponse } from "../backend-types";

// --- Summary types ---

export interface ConsignmentSummary {
  total: number;
  byStatus: {
    pending: number;
    received: number;
    inspected: number;
    available: number;
    partial_out: number;
    closed: number;
  };
  totalItemsReceived: number;
  totalValue: number;
}

export interface BulkOrderSummary {
  total: number;
  byStatus: {
    pending: number;
    confirmed: number;
    packing: number;
    completed: number;
    cancelled: number;
  };
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  byPaymentStatus: {
    pending: number;
    partial: number;
    paid: number;
  };
}

export interface DocumentsSummary {
  consignmentDocs: number;
  bulkOrderDocs: number;
  consignmentByType: {
    invoice: number;
    packing_list: number;
  };
  bulkOrderByType: {
    invoice: number;
    delivery_note: number;
    receipt: number;
  };
}

export interface StocksSummary {
  totalProducts: number;
  activeProducts: number;
  totalQuantity: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  byCategory: Array<{ category: string; count: number; [key: string]: unknown }>;
}

export interface InvoicesSummary {
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalBalanceDue: number;
  byStatus: {
    draft?: number;
    issued?: number;
    partial?: number;
    paid?: number;
    overdue?: number;
    cancelled?: number;
    [key: string]: number | undefined;
  };
}

export interface DashboardSummary {
  consignments: ConsignmentSummary;
  bulkOrders: BulkOrderSummary;
  documents: DocumentsSummary;
  stocks?: StocksSummary;
  invoices?: InvoicesSummary;
}

// --- Recent list types ---

export interface RecentConsignment {
  id: string;
  referenceNumber: string;
  supplierName: string;
  status: string;
  receivedAt: string | null;
  itemCount: number;
  totalQuantity: number;
  totalValue: number;
  documentCount: number;
  createdAt: string;
}

export interface RecentBulkOrder {
  id: string;
  referenceNumber: string;
  buyerName: string;
  buyerCompany: string | null;
  status: string;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: string | null;
  invoiceNumber: string | null;
  itemCount: number;
  documentCount: number;
  createdAt: string;
}

export interface RecentDocument {
  id: string;
  consignmentId?: string;
  bulkOrderId?: string;
  documentType: string;
  secure_url: string;
  public_id: string;
  createdAt: string;
}

// --- Full list types (nested) ---

export interface DashboardConsignmentItem {
  id: string;
  sku: string;
  description: string;
  brand: string | null;
  model: string | null;
  quantity: number;
  unit: string;
  unitCost: number | null;
  condition: string | null;
  metadata: Record<string, unknown> | null;
}

export interface DashboardDocument {
  id: string;
  documentType: string;
  secure_url: string;
  public_id: string;
  createdAt: string;
}

export interface DashboardConsignmentReceivedBy {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface DashboardConsignmentFull {
  id: string;
  referenceNumber: string;
  supplierName: string;
  supplierReference: string | null;
  receivedAt: string | null;
  status: string;
  warehouseLocation: string | null;
  notes: string | null;
  receivedById: string | null;
  createdAt: string;
  updatedAt: string;
  items: DashboardConsignmentItem[];
  documents: DashboardDocument[];
  receivedBy: DashboardConsignmentReceivedBy | null;
}

export interface DashboardBulkOrderItemConsignmentItem {
  id: string;
  sku: string;
  description: string;
  brand: string | null;
  model: string | null;
  quantity: number;
  unit: string;
  unitCost: number | null;
}

export interface DashboardBulkOrderItem {
  id: string;
  bulkOrderId: string;
  consignmentItemId: string;
  quantity: number;
  unitPrice: number | null;
  consignmentItem: DashboardBulkOrderItemConsignmentItem;
}

export interface DashboardBulkOrderFull {
  id: string;
  referenceNumber: string;
  buyerName: string;
  buyerEmail: string | null;
  buyerPhone: string | null;
  buyerCompany: string | null;
  status: string;
  totalAmount: number | null;
  amountPaid: number | null;
  paymentStatus: string | null;
  paymentMethod: string | null;
  paidAt: string | null;
  invoiceNumber: string | null;
  notes: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  items: DashboardBulkOrderItem[];
  documents: DashboardDocument[];
}

// --- Full dashboard response (frontend shape) ---

export interface DashboardData {
  summary: DashboardSummary;
  recentConsignments: RecentConsignment[];
  recentBulkOrders: RecentBulkOrder[];
  recentConsignmentDocuments: RecentDocument[];
  recentBulkOrderDocuments: RecentDocument[];
  allConsignments: DashboardConsignmentFull[];
  allBulkOrders: DashboardBulkOrderFull[];
}

// --- Raw backend response (API returns this; we map to DashboardData) ---

interface BackendAnalysisConsignments {
  totalConsignments: number;
  totalLineItems: number;
  totalCartons: number;
  totalQuantity: number;
  totalCost: number;
  totalPaid: number;
  totalBalanceToPay: number;
  byStatus: Record<string, number>;
  bySupplier?: Array<{ supplierName: string; count: number; totalCost: number; totalQuantity: number }>;
}

interface BackendAnalysisBulkOrders {
  totalBulkOrders: number;
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  byStatus: Record<string, number>;
  byPaymentStatus: Record<string, number>;
}

interface BackendAnalysisDocuments {
  consignmentDocs: number;
  bulkOrderDocs: number;
  consignmentByType: Record<string, number>;
  bulkOrderByType: Record<string, number>;
}

interface BackendAnalysisStocks {
  totalProducts: number;
  activeProducts: number;
  totalQuantity: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  byCategory: Array<{ category: string; count: number; [key: string]: unknown }>;
}

interface BackendAnalysisInvoices {
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalBalanceDue: number;
  byStatus: Record<string, number>;
}

interface BackendAnalysis {
  consignments: BackendAnalysisConsignments;
  bulkOrders: BackendAnalysisBulkOrders;
  documents: BackendAnalysisDocuments;
  stocks?: BackendAnalysisStocks;
  invoices?: BackendAnalysisInvoices;
}

interface BackendConsignmentItem {
  id: string;
  referenceNumber: string;
  supplierName: string;
  status: string;
  receivedAt: string | null;
  itemCount: number;
  totalQuantity: number;
  totalValue: number;
  documentCount: number;
  createdAt?: string;
  items?: unknown[];
  documents?: unknown[];
  receivedBy?: { id: string; first_name: string; last_name: string; email: string } | null;
  warehouseLocation?: string | null;
  notes?: string | null;
}

interface BackendBulkOrderItem {
  id: string;
  referenceNumber: string;
  buyerName: string;
  buyerCompany: string | null;
  status: string;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: string | null;
  invoiceNumber: string | null;
  itemCount: number;
  documentCount: number;
  createdAt?: string;
  items?: unknown[];
  documents?: unknown[];
}

interface BackendDashboardResponse {
  analysis: BackendAnalysis;
  consignments: { items: BackendConsignmentItem[]; meta?: unknown };
  bulkOrders: { items: BackendBulkOrderItem[]; meta?: unknown };
  recentConsignmentDocuments: Array<{
    id: string;
    consignmentId?: string;
    documentType: string;
    secure_url: string;
    public_id: string;
    createdAt: string;
  }>;
  recentBulkOrderDocuments: Array<{
    id: string;
    bulkOrderId?: string;
    documentType: string;
    secure_url: string;
    public_id: string;
    createdAt: string;
  }>;
}

function mapBackendToDashboard(raw: BackendDashboardResponse | null): DashboardData | null {
  if (!raw) return null;

  const a = raw.analysis;
  const consignmentItems = raw.consignments?.items ?? [];
  const bulkOrderItems = raw.bulkOrders?.items ?? [];
  const recentConsignmentDocs = raw.recentConsignmentDocuments ?? [];
  const recentBulkOrderDocs = raw.recentBulkOrderDocuments ?? [];

  const summary: DashboardSummary = {
    consignments: {
      total: a?.consignments?.totalConsignments ?? 0,
      byStatus: (a?.consignments?.byStatus as DashboardSummary["consignments"]["byStatus"]) ?? {
        pending: 0,
        received: 0,
        inspected: 0,
        available: 0,
        partial_out: 0,
        closed: 0,
      },
      totalItemsReceived: a?.consignments?.totalLineItems ?? 0,
      totalValue: a?.consignments?.totalCost ?? 0,
    },
    bulkOrders: {
      total: a?.bulkOrders?.totalBulkOrders ?? 0,
      byStatus: (a?.bulkOrders?.byStatus as DashboardSummary["bulkOrders"]["byStatus"]) ?? {
        pending: 0,
        confirmed: 0,
        packing: 0,
        completed: 0,
        cancelled: 0,
      },
      totalRevenue: a?.bulkOrders?.totalRevenue ?? 0,
      totalPaid: a?.bulkOrders?.totalPaid ?? 0,
      totalPending: a?.bulkOrders?.totalPending ?? 0,
      byPaymentStatus: (a?.bulkOrders?.byPaymentStatus as DashboardSummary["bulkOrders"]["byPaymentStatus"]) ?? {
        pending: 0,
        partial: 0,
        paid: 0,
      },
    },
    documents: {
      consignmentDocs: a?.documents?.consignmentDocs ?? 0,
      bulkOrderDocs: a?.documents?.bulkOrderDocs ?? 0,
      consignmentByType: (a?.documents?.consignmentByType as DashboardSummary["documents"]["consignmentByType"]) ?? {
        invoice: 0,
        packing_list: 0,
      },
      bulkOrderByType: (a?.documents?.bulkOrderByType as DashboardSummary["documents"]["bulkOrderByType"]) ?? {
        invoice: 0,
        delivery_note: 0,
        receipt: 0,
      },
    },
    ...(a?.stocks && {
      stocks: {
        totalProducts: a.stocks.totalProducts ?? 0,
        activeProducts: a.stocks.activeProducts ?? 0,
        totalQuantity: a.stocks.totalQuantity ?? 0,
        totalValue: a.stocks.totalValue ?? 0,
        lowStockCount: a.stocks.lowStockCount ?? 0,
        outOfStockCount: a.stocks.outOfStockCount ?? 0,
        byCategory: Array.isArray(a.stocks.byCategory) ? a.stocks.byCategory : [],
      },
    }),
    ...(a?.invoices && {
      invoices: {
        totalInvoices: a.invoices.totalInvoices ?? 0,
        totalAmount: a.invoices.totalAmount ?? 0,
        totalPaid: a.invoices.totalPaid ?? 0,
        totalBalanceDue: a.invoices.totalBalanceDue ?? 0,
        byStatus: (a.invoices.byStatus as InvoicesSummary["byStatus"]) ?? {},
      },
    }),
  };

  const recentConsignments: RecentConsignment[] = consignmentItems.map((c) => ({
    id: c.id,
    referenceNumber: c.referenceNumber,
    supplierName: c.supplierName,
    status: c.status,
    receivedAt: c.receivedAt ?? null,
    itemCount: c.itemCount ?? 0,
    totalQuantity: c.totalQuantity ?? 0,
    totalValue: c.totalValue ?? 0,
    documentCount: c.documentCount ?? 0,
    createdAt: c.createdAt ?? new Date().toISOString(),
  }));

  const recentBulkOrders: RecentBulkOrder[] = bulkOrderItems.map((o) => ({
    id: o.id,
    referenceNumber: o.referenceNumber,
    buyerName: o.buyerName,
    buyerCompany: o.buyerCompany ?? null,
    status: o.status,
    totalAmount: o.totalAmount ?? 0,
    amountPaid: o.amountPaid ?? 0,
    paymentStatus: o.paymentStatus ?? null,
    invoiceNumber: o.invoiceNumber ?? null,
    itemCount: o.itemCount ?? 0,
    documentCount: o.documentCount ?? 0,
    createdAt: o.createdAt ?? new Date().toISOString(),
  }));

  const recentConsignmentDocuments: RecentDocument[] = recentConsignmentDocs.map((d) => ({
    id: d.id,
    consignmentId: d.consignmentId,
    documentType: d.documentType,
    secure_url: d.secure_url,
    public_id: d.public_id,
    createdAt: d.createdAt,
  }));

  const recentBulkOrderDocuments: RecentDocument[] = recentBulkOrderDocs.map((d) => ({
    id: d.id,
    bulkOrderId: d.bulkOrderId,
    documentType: d.documentType,
    secure_url: d.secure_url,
    public_id: d.public_id,
    createdAt: d.createdAt,
  }));

  const allConsignments: DashboardConsignmentFull[] = consignmentItems.map((c) => ({
    id: c.id,
    referenceNumber: c.referenceNumber,
    supplierName: c.supplierName,
    supplierReference: null,
    receivedAt: c.receivedAt ?? null,
    status: c.status,
    warehouseLocation: c.warehouseLocation ?? null,
    notes: c.notes ?? null,
    receivedById: c.receivedBy?.id ?? null,
    createdAt: c.createdAt ?? new Date().toISOString(),
    updatedAt: c.createdAt ?? new Date().toISOString(),
    items: (c.items as DashboardConsignmentItem[]) ?? [],
    documents: (c.documents as DashboardDocument[]) ?? [],
    receivedBy: c.receivedBy
      ? { id: c.receivedBy.id, first_name: c.receivedBy.first_name, last_name: c.receivedBy.last_name, email: c.receivedBy.email }
      : null,
  }));

  const allBulkOrders: DashboardBulkOrderFull[] = bulkOrderItems.map((o) => ({
    id: o.id,
    referenceNumber: o.referenceNumber,
    buyerName: o.buyerName,
    buyerEmail: null,
    buyerPhone: null,
    buyerCompany: o.buyerCompany ?? null,
    status: o.status,
    totalAmount: o.totalAmount ?? null,
    amountPaid: o.amountPaid ?? null,
    paymentStatus: o.paymentStatus ?? null,
    paymentMethod: null,
    paidAt: null,
    invoiceNumber: o.invoiceNumber ?? null,
    notes: null,
    createdById: null,
    createdAt: o.createdAt ?? new Date().toISOString(),
    updatedAt: o.createdAt ?? new Date().toISOString(),
    items: (o.items as DashboardBulkOrderItem[]) ?? [],
    documents: (o.documents as DashboardDocument[]) ?? [],
  }));

  return {
    summary,
    recentConsignments,
    recentBulkOrders,
    recentConsignmentDocuments,
    recentBulkOrderDocuments,
    allConsignments,
    allBulkOrders,
  };
}

// --- API ---

function withAuth(token: string): ApiRequestConfig["headers"] {
  return { Authorization: `Bearer ${token}` };
}

async function getAndUnwrap<T>(path: string, config?: ApiRequestConfig): Promise<T | null> {
  const res = await apiClient.get<BackendResponse<T>>(path, config);
  return unwrapBackendResponse(res);
}

const DASHBOARD_PATH = "/distribution/dashboard";

export const dashboardApi = {
  /** Get full distribution dashboard (summary, recent, and all consignments/bulk orders/documents). */
  getDashboard: async (accessToken: string): Promise<DashboardData | null> => {
    const raw = await getAndUnwrap<BackendDashboardResponse>(DASHBOARD_PATH, {
      headers: withAuth(accessToken),
    });
    return mapBackendToDashboard(raw);
  },
};
