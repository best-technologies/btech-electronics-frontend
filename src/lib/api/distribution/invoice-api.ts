/**
 * Distribution Invoicing API.
 * Base path: distribution/invoicing. All endpoints require JWT Bearer token.
 * @see INVOICING.md
 */

import { apiClient } from "../client";
import { API_CONFIG } from "../constants";
import type { ApiRequestConfig } from "../types";
import { ApiError } from "../types";
import type { BackendResponse } from "../backend-types";
import { unwrapBackendResponse } from "../backend-types";

// --- Analysis & meta ---

export interface InvoiceListAnalysis {
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalBalance: number;
  totalTax: number;
  byStatus: Record<string, number>;
}

export interface InvoiceListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// --- Payment (history) ---

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  paidAt: string;
  paymentMethod: string;
  reference: string | null;
  notes: string | null;
  receiptUrl: string | null;
  receiptPublicId: string | null;
  recordedById: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Line item ---

export interface InvoiceItem {
  id: string;
  description: string;
  productId: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  [key: string]: unknown;
}

// --- Delivery note ---

export interface DeliveryNote {
  id: string;
  invoiceId: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  authorisedBy: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

// --- Invoice (list + detail) ---

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bulkOrderId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerCompany: string | null;
  issueDate: string;
  dueDate: string | null;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  companyAddress: string | null;
  companyPhone: string | null;
  amountInWords: string | null;
  managerSignedBy: string | null;
  managerSignedAt: string | null;
  customerSignedBy: string | null;
  customerSignedAt: string | null;
  paymentTerms: string | null;
  notes: string | null;
  items: InvoiceItem[];
  payments?: InvoicePayment[];
  createdAt?: string;
  updatedAt?: string;
  bulkOrder?: {
    id: string;
    referenceNumber: string;
    buyerName: string;
    buyerCompany: string | null;
    totalAmount: number | null;
    status: string;
  } | null;
}

// --- List params ---

export type InvoiceSortBy =
  | "createdAt"
  | "issueDate"
  | "dueDate"
  | "invoiceNumber"
  | "totalAmount"
  | "status";

export type InvoiceSortOrder = "asc" | "desc";

export interface ListInvoiceParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  invoiceNumber?: string;
  customerName?: string;
  fromIssueDate?: string;
  toIssueDate?: string;
  fromCreatedAt?: string;
  toCreatedAt?: string;
  sortBy?: InvoiceSortBy;
  sortOrder?: InvoiceSortOrder;
}

export interface InvoiceListResponse {
  analysis: InvoiceListAnalysis;
  items: Invoice[];
  meta: InvoiceListMeta;
}

// --- Create payload ---

/** Price type used for this line (wholesale, retail, or cost); stored for record-keeping. */
export type InvoiceItemPriceType = "wholesale" | "retail" | "cost";

export interface CreateInvoiceItemPayload {
  description: string;
  productId?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  totalAmount?: number;
  /** Whether this line used wholesale, retail, or cost price; sent for record-keeping. */
  priceType?: InvoiceItemPriceType;
}

export interface CreateInvoicePayload {
  invoiceNumber?: string;
  bulkOrderId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerCompany?: string;
  issueDate: string;
  dueDate?: string;
  status?: string;
  taxAmount?: number;
  paymentTerms?: string;
  notes?: string;
  companyAddress?: string;
  companyPhone?: string;
  managerSignedBy?: string;
  customerSignedBy?: string;
  items: CreateInvoiceItemPayload[];
}

export interface CreateDeliveryNotePayload {
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  authorisedBy: string;
  note?: string;
}

export interface UpdateDeliveryNotePayload {
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  authorisedBy?: string;
  note?: string;
}

// --- API ---

const INVOICE_BASE = "/distribution/invoicing";

function withAuth(token: string): ApiRequestConfig["headers"] {
  return { Authorization: `Bearer ${token}` };
}

export const invoiceApi = {
  /** List invoices with analysis and pagination. */
  list: async (
    accessToken: string,
    params?: ListInvoiceParams
  ): Promise<InvoiceListResponse | null> => {
    const res = await apiClient.get<BackendResponse<InvoiceListResponse>>(INVOICE_BASE, {
      headers: withAuth(accessToken),
      params: params as Record<string, string | number | undefined>,
    });
    return unwrapBackendResponse(res);
  },

  /** Create a new invoice. */
  create: async (
    accessToken: string,
    payload: CreateInvoicePayload
  ): Promise<Invoice | null> => {
    const res = await apiClient.post<BackendResponse<Invoice>>(INVOICE_BASE, payload, {
      headers: withAuth(accessToken),
    });
    return unwrapBackendResponse(res);
  },

  /** Get delivery note for an invoice by invoice ID. Returns null when none exists. */
  getDeliveryNote: async (
    accessToken: string,
    invoiceId: string
  ): Promise<DeliveryNote | null> => {
    try {
      const res = await apiClient.get<BackendResponse<DeliveryNote>>(
        `${INVOICE_BASE}/${invoiceId}/delivery-note`,
        {
          headers: withAuth(accessToken),
        }
      );
      return unwrapBackendResponse(res);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /** Create delivery note for an invoice by invoice ID. */
  createDeliveryNote: async (
    accessToken: string,
    invoiceId: string,
    payload: CreateDeliveryNotePayload
  ): Promise<DeliveryNote | null> => {
    const res = await apiClient.post<
      BackendResponse<{
        deliveryNote: DeliveryNote;
        invoice: {
          id: string;
          invoiceNumber: string;
          customerName: string;
          customerCompany: string | null;
          issueDate: string;
          items: {
            id: string;
            description: string;
            quantity: number;
            unit: string;
          }[];
        };
      }>
    >(`${INVOICE_BASE}/${invoiceId}/delivery-note`, payload, {
      headers: withAuth(accessToken),
    });
    const data = unwrapBackendResponse(res);
    return data?.deliveryNote ?? null;
  },

  /** Update delivery note for an invoice by invoice ID. */
  updateDeliveryNote: async (
    accessToken: string,
    invoiceId: string,
    payload: UpdateDeliveryNotePayload
  ): Promise<DeliveryNote | null> => {
    const res = await apiClient.patch<BackendResponse<DeliveryNote>>(
      `${INVOICE_BASE}/${invoiceId}/delivery-note`,
      payload,
      {
        headers: withAuth(accessToken),
      }
    );
    return unwrapBackendResponse(res);
  },

  /** Delete delivery note for an invoice by invoice ID. */
  deleteDeliveryNote: async (
    accessToken: string,
    invoiceId: string
  ): Promise<{ invoiceId: string; deletedDeliveryNoteId: string } | null> => {
    const res = await apiClient.delete<
      BackendResponse<{ invoiceId: string; deletedDeliveryNoteId: string }>
    >(`${INVOICE_BASE}/${invoiceId}/delivery-note`, {
      headers: withAuth(accessToken),
    });
    const data = unwrapBackendResponse(res);
    return data ?? null;
  },

  /** Get a single invoice by ID. */
  getById: async (accessToken: string, id: string): Promise<Invoice | null> => {
    const res = await apiClient.get<BackendResponse<Invoice>>(`${INVOICE_BASE}/${id}`, {
      headers: withAuth(accessToken),
    });
    return unwrapBackendResponse(res);
  },

  /**
   * Mark invoice as paid (full or partial). PATCH /distribution/invoicing/:id/mark-paid
   * Legacy: prefer recordPayment for audit trail. Omit amountPaid for full payment.
   */
  markPaid: async (
    accessToken: string,
    id: string,
    amountPaid?: number
  ): Promise<Invoice | null> => {
    const res = await apiClient.patch<BackendResponse<Invoice>>(
      `${INVOICE_BASE}/${id}/mark-paid`,
      amountPaid != null ? { amountPaid } : {},
      { headers: withAuth(accessToken) }
    );
    return unwrapBackendResponse(res);
  },

  /**
   * Record payment (with history and optional receipt). POST /distribution/invoicing/:id/payments
   * Creates an InvoicePayment record, updates amountPaid/balanceDue/status. Stock reduced only when fully paid.
   */
  recordPayment: async (
    accessToken: string,
    id: string,
    payload: {
      amount: number;
      paymentMethod?: string;
      reference?: string;
      notes?: string;
      receipt?: File;
    }
  ): Promise<Invoice | null> => {
    const form = new FormData();
    form.append("amount", String(payload.amount));
    if (payload.paymentMethod != null && payload.paymentMethod !== "") {
      form.append("paymentMethod", payload.paymentMethod);
    }
    if (payload.reference != null && payload.reference !== "") {
      form.append("reference", payload.reference);
    }
    if (payload.notes != null && payload.notes !== "") {
      form.append("notes", payload.notes);
    }
    if (payload.receipt) {
      form.append("receipt", payload.receipt);
    }
    const res = await apiClient.post<
      BackendResponse<{ payment: InvoicePayment; invoice: Invoice }>
    >(`${INVOICE_BASE}/${id}/payments`, form, {
      headers: withAuth(accessToken),
    });
    const data = unwrapBackendResponse(res);
    return data?.invoice ?? null;
  },

  /**
   * Unmark invoice as paid. PATCH /distribution/invoicing/:id/unmark-paid
   * Only when status is `paid` and was set via mark-paid (not payment records). Restores stock.
   */
  unmarkPaid: async (accessToken: string, id: string): Promise<Invoice | null> => {
    const res = await apiClient.patch<BackendResponse<Invoice>>(
      `${INVOICE_BASE}/${id}/unmark-paid`,
      {},
      { headers: withAuth(accessToken) }
    );
    return unwrapBackendResponse(res);
  },

  /**
   * Permanently delete an invoice. Reverts stock for paid items, removes payments and receipts.
   * DELETE /distribution/invoicing/:id
   */
  delete: async (
    accessToken: string,
    id: string
  ): Promise<{ deletedInvoiceNumber: string } | null> => {
    const res = await apiClient.delete<BackendResponse<{ deletedInvoiceNumber: string }>>(
      `${INVOICE_BASE}/${id}`,
      { headers: withAuth(accessToken) }
    );
    const data = unwrapBackendResponse(res);
    return data ?? null;
  },

  /**
   * Download invoice as PDF. Returns blob and suggested filename.
   * GET /distribution/invoicing/:id/pdf
   */
  downloadPdf: async (
    accessToken: string,
    id: string,
    suggestedFilename?: string
  ): Promise<{ blob: Blob; filename: string }> => {
    const url = `${API_CONFIG.basePath}${INVOICE_BASE}/${id}/pdf`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    const blob = await response.blob();
    const contentDisposition = response.headers.get("Content-Disposition");
    const filenameMatch =
      contentDisposition &&
      /filename[*]?=(?:"([^"]+)"|([^;\s]+))/i.exec(contentDisposition);
    const filename =
      filenameMatch?.[1] ?? filenameMatch?.[2] ?? suggestedFilename ?? `invoice-${id}.pdf`;
    return { blob, filename: filename.trim() };
  },

  /**
   * Download delivery note PDF for an invoice. Returns blob and suggested filename.
   * GET /distribution/invoicing/:id/delivery-note/pdf
   */
  downloadDeliveryNotePdf: async (
    accessToken: string,
    invoiceId: string,
    suggestedFilename?: string
  ): Promise<{ blob: Blob; filename: string }> => {
    const url = `${API_CONFIG.basePath}${INVOICE_BASE}/${invoiceId}/delivery-note/pdf`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    const blob = await response.blob();
    const contentDisposition = response.headers.get("Content-Disposition");
    const filenameMatch =
      contentDisposition &&
      /filename[*]?=(?:"([^"]+)"|([^;\s]+))/i.exec(contentDisposition);
    const filename =
      filenameMatch?.[1] ??
      filenameMatch?.[2] ??
      suggestedFilename ??
      `delivery-note-${invoiceId}.pdf`;
    return { blob, filename: filename.trim() };
  },
};
