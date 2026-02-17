/**
 * Distribution Homepage API — public endpoints for the electronics landing page.
 * Base path: distribution/homepage (prefix with apiVersion).
 * No auth required.
 * @see HOMEPAGE.md, Backend: GET /distribution/homepage/products
 */

import { apiClient } from "../client";
import type { BackendResponse } from "../backend-types";
import { unwrapBackendResponse } from "../backend-types";

const HOMEPAGE_BASE = "/distribution/homepage";

// --- Product image (Cloudinary) ---

export interface HomepageProductImage {
  secure_url: string;
  public_id: string;
}

// --- Product (reduced fields for homepage; includes images) ---

export interface HomepageProduct {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  brand: string | null;
  model: string | null;
  category: string | null;
  images: HomepageProductImage[] | null;
}

// --- API ---

/**
 * Fetch active distribution products for the homepage (max 500, newest first).
 * Returns reduced fields only. Public endpoint — no auth.
 */
export async function getHomepageProducts(): Promise<HomepageProduct[]> {
  const res = await apiClient.get<BackendResponse<HomepageProduct[]>>(
    `${HOMEPAGE_BASE}/products`
  );
  const data = unwrapBackendResponse(res);
  return Array.isArray(data) ? data : [];
}

export const homepageApi = {
  getProducts: getHomepageProducts,
};
