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

export interface DashboardSummary {
  consignments: ConsignmentSummary;
  bulkOrders: BulkOrderSummary;
  documents: DocumentsSummary;
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

// --- Full dashboard response ---

export interface DashboardData {
  summary: DashboardSummary;
  recentConsignments: RecentConsignment[];
  recentBulkOrders: RecentBulkOrder[];
  recentConsignmentDocuments: RecentDocument[];
  recentBulkOrderDocuments: RecentDocument[];
  allConsignments: DashboardConsignmentFull[];
  allBulkOrders: DashboardBulkOrderFull[];
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
  getDashboard: (accessToken: string) =>
    getAndUnwrap<DashboardData>(DASHBOARD_PATH, {
      headers: withAuth(accessToken),
    }),
};
