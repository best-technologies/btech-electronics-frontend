/**
 * Stock / Inventory API — list, create, search, images.
 * Base path: distribution/stock (prefix with apiVersion).
 * All endpoints require JWT Bearer token.
 * @see STOCK.md
 */

import { apiClient } from "../client";
import type { ApiRequestConfig } from "../types";
import type { BackendResponse } from "../backend-types";
import { unwrapBackendResponse } from "../backend-types";

// --- Product image (Cloudinary) ---

export interface StockProductImage {
  secure_url: string;
  public_id: string;
}

// --- Product (item) type ---

export interface StockProduct {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  brand: string | null;
  model: string | null;
  category: string | null;
  unit: string;
  currentStock: number;
  costPrice: number | null;
  reorderLevel: number | null;
  warehouseLocation: string | null;
  images: StockProductImage[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Analysis types ---

export interface StockAnalysisByCategory {
  category: string | null;
  count: number;
  quantity: number;
  value: number;
}

export interface StockListAnalysis {
  totalProducts: number;
  activeProducts: number;
  totalQuantity: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  byCategory: StockAnalysisByCategory[];
}

export interface StockListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface StockListResponse {
  analysis: StockListAnalysis;
  items: StockProduct[];
  meta: StockListMeta;
}

// --- List params ---

export type StockSortBy =
  | "createdAt"
  | "name"
  | "sku"
  | "currentStock"
  | "costPrice"
  | "category";

export type StockSortOrder = "asc" | "desc";

export interface ListStockParams {
  page?: number;
  limit?: number;
  search?: string;
  sku?: string;
  name?: string;
  category?: string;
  isActive?: string; // "true" | "false"
  lowStock?: string; // "true" = out of stock only
  fromCreatedAt?: string;
  toCreatedAt?: string;
  sortBy?: StockSortBy;
  sortOrder?: StockSortOrder;
}

// --- Create payload & response ---

export interface CreateStockPayload {
  sku: string;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  category?: string;
  unit?: string;
  initialStock?: number;
  costPrice?: number;
  reorderLevel?: number;
  warehouseLocation?: string;
  isActive?: boolean;
}

/** PATCH payload: all fields optional (partial update). */
export interface UpdateStockPayload {
  sku?: string;
  name?: string;
  description?: string;
  brand?: string;
  model?: string;
  category?: string;
  unit?: string;
  costPrice?: number;
  reorderLevel?: number;
  warehouseLocation?: string;
  isActive?: boolean;
}

/** DELETE response payload (product removed; images cleared in Cloudinary; consignment items unlinked). */
export interface DeleteStockResponse {
  id: string;
  sku: string;
  name: string;
}

// --- API ---

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

const STOCK_PATH = "/distribution/stock";
const MAX_IMAGES = 10;
const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

/** Build FormData for create with optional image files. */
function buildCreateFormData(payload: CreateStockPayload, imageFiles?: File[]): FormData {
  const form = new FormData();
  form.set("sku", payload.sku);
  form.set("name", payload.name);
  if (payload.description != null && payload.description !== "") form.set("description", payload.description);
  if (payload.brand != null && payload.brand !== "") form.set("brand", payload.brand);
  if (payload.model != null && payload.model !== "") form.set("model", payload.model);
  if (payload.category != null && payload.category !== "") form.set("category", payload.category);
  if (payload.unit != null && payload.unit !== "") form.set("unit", payload.unit);
  if (payload.initialStock != null) form.set("initialStock", String(payload.initialStock));
  if (payload.costPrice != null) form.set("costPrice", String(payload.costPrice));
  if (payload.reorderLevel != null) form.set("reorderLevel", String(payload.reorderLevel));
  if (payload.warehouseLocation != null && payload.warehouseLocation !== "") form.set("warehouseLocation", payload.warehouseLocation);
  form.set("isActive", payload.isActive !== false ? "true" : "false");
  if (imageFiles?.length) {
    imageFiles.forEach((file) => form.append("images", file));
  }
  return form;
}

/** Validate image files: up to 10, 5MB each, jpg/jpeg/png. */
export function validateStockImageFiles(files: File[]): { valid: File[]; errors: string[] } {
  const errors: string[] = [];
  const valid: File[] = [];
  const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
  for (const file of files) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      errors.push(`${file.name}: only JPG and PNG are allowed.`);
      continue;
    }
    if (file.size > maxBytes) {
      errors.push(`${file.name}: max size ${MAX_FILE_SIZE_MB}MB.`);
      continue;
    }
    valid.push(file);
  }
  if (valid.length > MAX_IMAGES) {
    errors.push(`Maximum ${MAX_IMAGES} images per product.`);
    return { valid: valid.slice(0, MAX_IMAGES), errors };
  }
  return { valid, errors };
}

function buildQueryString(params: ListStockParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.search?.trim()) search.set("search", params.search.trim());
  if (params.sku?.trim()) search.set("sku", params.sku.trim());
  if (params.name?.trim()) search.set("name", params.name.trim());
  if (params.category?.trim()) search.set("category", params.category.trim());
  if (params.isActive !== undefined && params.isActive !== "") search.set("isActive", params.isActive);
  if (params.lowStock !== undefined && params.lowStock !== "") search.set("lowStock", params.lowStock);
  if (params.fromCreatedAt) search.set("fromCreatedAt", params.fromCreatedAt);
  if (params.toCreatedAt) search.set("toCreatedAt", params.toCreatedAt);
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortOrder) search.set("sortOrder", params.sortOrder);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const stockApi = {
  /** List stock with pagination and analysis. */
  list: (accessToken: string, params: ListStockParams = {}) =>
    getAndUnwrap<StockListResponse>(`${STOCK_PATH}${buildQueryString(params)}`, {
      headers: withAuth(accessToken),
    }),

  /** Create a new product (JSON). Use createWithImages to upload with images. */
  create: (accessToken: string, payload: CreateStockPayload) =>
    postAndUnwrap<StockProduct>(STOCK_PATH, payload, {
      headers: { ...withAuth(accessToken), "Content-Type": "application/json" },
    }),

  /** Create a new product with optional images (multipart/form-data). */
  createWithImages: (accessToken: string, payload: CreateStockPayload, imageFiles?: File[]) =>
    postAndUnwrap<StockProduct>(STOCK_PATH, buildCreateFormData(payload, imageFiles), {
      headers: withAuth(accessToken),
    }),

  /** Add images to an existing product (multipart/form-data). */
  addImages: (accessToken: string, productId: string, imageFiles: File[]) =>
    postAndUnwrap<StockProduct>(`${STOCK_PATH}/${productId}/images`, (() => {
      const form = new FormData();
      imageFiles.forEach((f) => form.append("images", f));
      return form;
    })(), {
      headers: withAuth(accessToken),
    }),

  /** Remove one image by Cloudinary public_id. */
  removeImage: (accessToken: string, productId: string, publicId: string) =>
    deleteAndUnwrap<StockProduct>(`${STOCK_PATH}/${productId}/images`, {
      params: { publicId },
      headers: withAuth(accessToken),
    }),

  /** Update product (partial). */
  update: (accessToken: string, productId: string, payload: UpdateStockPayload) =>
    patchAndUnwrap<StockProduct>(`${STOCK_PATH}/${productId}`, payload, {
      headers: { ...withAuth(accessToken), "Content-Type": "application/json" },
    }),

  /** Delete product. Images removed from Cloudinary; consignment items have productId set to null. */
  delete: (accessToken: string, productId: string) =>
    deleteAndUnwrap<DeleteStockResponse>(`${STOCK_PATH}/${productId}`, {
      headers: withAuth(accessToken),
    }),
};
