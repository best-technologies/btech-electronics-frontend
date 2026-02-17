/**
 * Consignment API — CRUD for distribution consignments.
 * Base path: distribution/consignment (prefix with apiVersion).
 * All endpoints require JWT Bearer token.
 * @see CONSIGNMENT.md
 */

import { apiClient } from "../client";
import type { ApiRequestConfig } from "../types";
import type { BackendResponse } from "../backend-types";
import { unwrapBackendResponse } from "../backend-types";

// --- Create payload (matches CONSIGNMENT.md) ---
// Approach 1 (single-shot): send items array. Approach 2 (two-step): omit items or send [].

export interface ConsignmentItemPayload {
  productName: string;
  cartons: number;
  quantity: number;
  unit?: string;
  unitPrice: number;
  /** Optional: backend computes as quantity × unitPrice if omitted */
  totalCost?: number;
  sku?: string;
  description?: string;
  brand?: string;
  model?: string;
  condition?: string;
}

export interface CreateConsignmentPayload {
  referenceNumber: string;
  supplierName: string;
  supplierReference?: string;
  salesPersonName?: string;
  salesPersonPhone?: string;
  salesPersonEmail?: string;
  invoiceNumber?: string;
  deliveryNote?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  paymentModeTerms?: string;
  manufacturerOrderNumber?: string;
  dispatchDocumentNumber?: string;
  overallTotalCartons?: number;
  overallTotalQuantity?: number;
  overallTotalCost?: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  totalPaid?: number;
  balanceToPay?: number;
  amountToPayInWords?: string;
  amountPaidInWords?: string;
  receivedAt?: string;
  warehouseLocation?: string;
  notes?: string;
  /** Optional: omit or [] for two-step flow (add items later via POST .../items) */
  items?: ConsignmentItemPayload[];
}

// --- Response types (list item) ---

export interface ConsignmentItem {
  id: string;
  productName: string;
  cartons: number;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  sku: string | null;
  description: string | null;
  brand: string | null;
  model: string | null;
  condition?: string | null;
}

export type ConsignmentStatus =
  | "pending"
  | "received"
  | "inspected"
  | "available"
  | "partial_out"
  | "closed";

export interface Consignment {
  id: string;
  referenceNumber: string;
  supplierName: string;
  salesPersonName: string | null;
  invoiceNumber: string | null;
  deliveryDate: string | null;
  overallTotalCartons: number;
  overallTotalQuantity: number;
  overallTotalCost: number;
  status: ConsignmentStatus;
  createdAt: string;
  updatedAt?: string;
  items: ConsignmentItem[];
}

// --- Response types (detail) ---

export interface ConsignmentDocument {
  id: string;
  documentType: string;
  secure_url: string;
  public_id: string;
  createdAt: string;
}

export interface ConsignmentReceivedBy {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface ConsignmentDetail extends Consignment {
  supplierReference?: string | null;
  salesPersonPhone?: string | null;
  salesPersonEmail?: string | null;
  deliveryNote?: string | null;
  deliveryTime?: string | null;
  paymentModeTerms?: string | null;
  manufacturerOrderNumber?: string | null;
  dispatchDocumentNumber?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  totalPaid?: number | null;
  balanceToPay?: number | null;
  amountToPayInWords?: string | null;
  amountPaidInWords?: string | null;
  receivedAt?: string | null;
  warehouseLocation?: string | null;
  notes?: string | null;
  receivedById?: string | null;
  documents?: ConsignmentDocument[];
  receivedBy?: ConsignmentReceivedBy | null;
}

// --- List params (CONSIGNMENT.md §5) ---

export type ConsignmentSortBy =
  | "createdAt"
  | "deliveryDate"
  | "referenceNumber"
  | "overallTotalCost"
  | "status";
export type ConsignmentSortOrder = "asc" | "desc";

export interface ListConsignmentsParams {
  page?: number;
  limit?: number;
  status?: ConsignmentStatus;
  search?: string;
  referenceNumber?: string;
  invoiceNumber?: string;
  supplierName?: string;
  fromDate?: string;
  toDate?: string;
  fromCreatedAt?: string;
  toCreatedAt?: string;
  sortBy?: ConsignmentSortBy;
  sortOrder?: ConsignmentSortOrder;
}

// --- List response (paginated + analysis) ---

export interface ConsignmentAnalysisByStatus {
  pending: number;
  received: number;
  inspected: number;
  available: number;
  partial_out: number;
  closed: number;
}

export interface ConsignmentAnalysisBySupplier {
  supplierName: string;
  count: number;
  totalCost: number;
  totalQuantity: number;
}

export interface ConsignmentListAnalysis {
  totalConsignments: number;
  totalLineItems: number;
  totalCartons: number;
  totalQuantity: number;
  totalCost: number;
  totalPaid: number;
  totalBalanceToPay: number;
  byStatus: ConsignmentAnalysisByStatus;
  bySupplier: ConsignmentAnalysisBySupplier[];
}

export interface ConsignmentListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ConsignmentListResponse {
  analysis: ConsignmentListAnalysis;
  items: Consignment[];
  meta: ConsignmentListMeta;
}

// --- Helpers ---

function withAuth(token: string): ApiRequestConfig["headers"] {
  return { Authorization: `Bearer ${token}` };
}

async function getAndUnwrap<T>(path: string, config?: ApiRequestConfig): Promise<T | null> {
  const res = await apiClient.get<BackendResponse<T>>(path, config);
  return unwrapBackendResponse(res);
}

async function postAndUnwrap<T>(
  path: string,
  body?: unknown,
  config?: ApiRequestConfig
): Promise<T | null> {
  const res = await apiClient.post<BackendResponse<T>>(path, body, config);
  return unwrapBackendResponse(res);
}

async function patchAndUnwrap<T>(
  path: string,
  body?: unknown,
  config?: ApiRequestConfig
): Promise<T | null> {
  const res = await apiClient.patch<BackendResponse<T>>(path, body, config);
  return unwrapBackendResponse(res);
}

async function deleteAndUnwrap<T>(path: string, config?: ApiRequestConfig): Promise<T | null> {
  const res = await apiClient.delete<BackendResponse<T>>(path, config);
  return unwrapBackendResponse(res);
}

// --- Add/update item payloads (CONSIGNMENT.md) ---

/** Payload for POST .../consignment/:id/items. Backend computes totalCost. */
export interface AddConsignmentItemPayload {
  productName: string;
  cartons: number;
  quantity: number;
  unitPrice: number;
  unit?: string;
  sku?: string;
  description?: string;
  brand?: string;
  model?: string;
  condition?: string;
}

/** Payload for PATCH .../consignment/:id/items/:itemId. All optional. */
export interface UpdateConsignmentItemPayload {
  productName?: string;
  cartons?: number;
  quantity?: number;
  unitPrice?: number;
  unit?: string;
  sku?: string;
  description?: string;
  brand?: string;
  model?: string;
  condition?: string;
}

/** Response shape for add/update item (returns item + consignment). */
export interface ConsignmentItemResponse {
  item: ConsignmentItem;
  consignment: Consignment;
}

/** Response shape for delete item (returns consignment only). */
export interface ConsignmentAfterItemDelete {
  consignment: Consignment;
}

// --- API ---

const BASE = "/distribution/consignment";

export const consignmentApi = {
  /** Create a new consignment (with or without items). */
  create: (accessToken: string, payload: CreateConsignmentPayload) =>
    postAndUnwrap<ConsignmentDetail>(BASE, payload, {
      headers: withAuth(accessToken),
    }),

  /** List consignments (paginated, filterable, with analysis). */
  list: (accessToken: string, params?: ListConsignmentsParams) =>
    getAndUnwrap<ConsignmentListResponse>(BASE, {
      headers: withAuth(accessToken),
      params: params as Record<string, string | number | undefined>,
    }),

  /** Get a single consignment by ID (includes documents and receivedBy). */
  getById: (accessToken: string, id: string) =>
    getAndUnwrap<ConsignmentDetail>(`${BASE}/${id}`, {
      headers: withAuth(accessToken),
    }),

  /** Add an item to a consignment. Backend computes totalCost and updates consignment totals. */
  addItem: (accessToken: string, consignmentId: string, payload: AddConsignmentItemPayload) =>
    postAndUnwrap<ConsignmentItemResponse>(`${BASE}/${consignmentId}/items`, payload, {
      headers: withAuth(accessToken),
    }),

  /** Update an item (partial). Backend recalculates totalCost and consignment totals. */
  updateItem: (
    accessToken: string,
    consignmentId: string,
    itemId: string,
    payload: UpdateConsignmentItemPayload
  ) =>
    patchAndUnwrap<ConsignmentItemResponse>(`${BASE}/${consignmentId}/items/${itemId}`, payload, {
      headers: withAuth(accessToken),
    }),

  /** Delete an item. Backend recalculates consignment totals. */
  deleteItem: (accessToken: string, consignmentId: string, itemId: string) =>
    deleteAndUnwrap<ConsignmentAfterItemDelete>(`${BASE}/${consignmentId}/items/${itemId}`, {
      headers: withAuth(accessToken),
    }),

  /** Update consignment status. PATCH .../consignment/:id/status. Setting to "received" updates stock and cannot be reverted to pending. */
  updateStatus: (accessToken: string, consignmentId: string, status: ConsignmentStatus) =>
    patchAndUnwrap<ConsignmentDetail>(`${BASE}/${consignmentId}/status`, { status }, {
      headers: withAuth(accessToken),
    }),
};
