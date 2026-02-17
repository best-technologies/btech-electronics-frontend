/**
 * User Management API (Distribution).
 * Base path: distribution/user-management (prefix with apiVersion).
 * All endpoints require JWT Bearer token.
 */

import { apiClient } from "../client";
import type { ApiRequestConfig } from "../types";
import type { BackendResponse } from "../backend-types";
import { unwrapBackendResponse } from "../backend-types";

// --- Analysis ---

export interface UserManagementAnalysis {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  inactiveUsers: number;
  byRole: Record<string, number>;
  byLevel: Record<string, number>;
}

// --- User (list/dashboard item) ---

export interface UserManagementUserItem {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  role: string;
  status: string;
  level: string;
  createdAt: string;
  updatedAt: string;
}

// --- Dashboard response ---

export interface UserManagementDashboardData {
  analysis: UserManagementAnalysis;
  recentUsers: UserManagementUserItem[];
}

// --- Paginated list ---

export interface UserManagementListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UserManagementListResponse {
  analysis: UserManagementAnalysis;
  items: UserManagementUserItem[];
  meta: UserManagementListMeta;
}

// --- List params ---

export type UserManagementSortBy =
  | "createdAt"
  | "email"
  | "first_name"
  | "last_name"
  | "role"
  | "status";

export type UserManagementSortOrder = "asc" | "desc";

export interface ListUserManagementParams {
  page?: number;
  limit?: number;
  search?: string;
  email?: string;
  role?: string;
  status?: string; // active | suspended | inactive
  fromCreatedAt?: string;
  toCreatedAt?: string;
  sortBy?: UserManagementSortBy;
  sortOrder?: UserManagementSortOrder;
}

// --- Full user profile (get by id) ---

export interface UserPermission {
  id: string;
  name: string;
  displayName: string;
  category: string;
  description: string | null;
  isActive: boolean;
  grantedAt: string;
  grantedBy: string | null;
}

export interface UserStore {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: string;
  description: string | null;
}

export interface UserAffiliate {
  id: string;
  userName: string;
  userEmail: string;
  status: string;
  requestedAt: string | null;
  reviewedAt: string | null;
  category: string | null;
  reason: string | null;
  notes: string | null;
}

export interface UserBank {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface UserWallet {
  id: string;
  total_earned: number;
  available_for_withdrawal: number;
  total_withdrawn: number;
}

export interface UserDetailCounts {
  orders: number;
  commissionReferrals: number;
  commissions: number;
}

export interface UserManagementDetail {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  display_picture: string | null;
  address: string | null;
  gender: string;
  role: string;
  status: string;
  usertype?: string | null;
  is_active: boolean;
  level: string;
  is_email_verified: boolean;
  is_otp_verified: boolean;
  allowedPartialPayment: number;
  referralPercentage: number | null;
  referralPaymentCount: number | null;
  isAffiliate: boolean;
  affiliateStatus: string;
  createdAt: string;
  updatedAt: string;
  legacyPermissions: string[];
  permissions: UserPermission[];
  store: UserStore | null;
  affiliate: UserAffiliate | null;
  banks: UserBank[];
  shippingAddresses: unknown[];
  wallet: UserWallet | null;
  counts: UserDetailCounts;
}

/** Payload for PATCH /distribution/user-management/:id (all fields optional). */
export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  display_picture?: string;
  gender?: string;
  role?: string;
  status?: string;
  level?: string;
  is_active?: boolean;
  allowedPartialPayment?: number;
  usertype?: string;
  store_id?: string | null;
  permissions?: string[];
}

// --- API ---

function withAuth(token: string): ApiRequestConfig["headers"] {
  return { Authorization: `Bearer ${token}` };
}

async function getAndUnwrap<T>(path: string, config?: ApiRequestConfig): Promise<T | null> {
  const res = await apiClient.get<BackendResponse<T>>(path, config);
  return unwrapBackendResponse(res);
}

async function patchAndUnwrap<T>(
  path: string,
  body: unknown,
  config?: ApiRequestConfig
): Promise<T | null> {
  const res = await apiClient.patch<BackendResponse<T>>(path, body, config);
  return unwrapBackendResponse(res);
}

async function postAndUnwrap<T>(
  path: string,
  body: unknown,
  config?: ApiRequestConfig
): Promise<T | null> {
  const res = await apiClient.post<BackendResponse<T>>(path, body, config);
  return unwrapBackendResponse(res);
}

async function deleteAndUnwrap<T>(path: string, config?: ApiRequestConfig): Promise<T | null> {
  const res = await apiClient.delete<BackendResponse<T>>(path, config);
  return unwrapBackendResponse(res);
}

// --- All permissions (for editing) ---

export interface PermissionOption {
  id: string;
  name: string;
  displayName: string;
  category?: string;
  description: string | null;
}

export interface GetPermissionsResponse {
  permissions: PermissionOption[];
  categorized: Record<string, PermissionOption[]>;
}

export interface UpdateUserPermissionsPayload {
  permissionIds: string[];
}

// --- Permission CRUD (manage permission definitions) ---

export interface PermissionRecord extends PermissionOption {
  isActive?: boolean;
}

export interface CreatePermissionPayload {
  name: string;
  displayName: string;
  category: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdatePermissionPayload {
  name?: string;
  displayName?: string;
  category?: string;
  description?: string;
  isActive?: boolean;
}

const BASE = "/distribution/user-management";

export const userManagementApi = {
  /** Dashboard: analysis + max 10 recent users. */
  getDashboard: async (accessToken: string): Promise<UserManagementDashboardData | null> => {
    return getAndUnwrap<UserManagementDashboardData>(BASE, {
      headers: withAuth(accessToken),
    });
  },

  /** All users: paginated with filters and analysis. */
  getAll: async (
    accessToken: string,
    params: ListUserManagementParams = {}
  ): Promise<UserManagementListResponse | null> => {
    const searchParams: Record<string, string | number | undefined> = {};
    if (params.page != null) searchParams.page = params.page;
    if (params.limit != null) searchParams.limit = params.limit;
    if (params.search?.trim()) searchParams.search = params.search.trim();
    if (params.email?.trim()) searchParams.email = params.email.trim();
    if (params.role?.trim()) searchParams.role = params.role.trim();
    if (params.status?.trim()) searchParams.status = params.status.trim();
    if (params.fromCreatedAt) searchParams.fromCreatedAt = params.fromCreatedAt;
    if (params.toCreatedAt) searchParams.toCreatedAt = params.toCreatedAt;
    if (params.sortBy) searchParams.sortBy = params.sortBy;
    if (params.sortOrder) searchParams.sortOrder = params.sortOrder;

    return getAndUnwrap<UserManagementListResponse>(`${BASE}/all`, {
      params: searchParams,
      headers: withAuth(accessToken),
    });
  },

  /** Get user by ID (full profile, permissions, related data). */
  getById: async (
    accessToken: string,
    id: string
  ): Promise<UserManagementDetail | null> => {
    return getAndUnwrap<UserManagementDetail>(`${BASE}/${encodeURIComponent(id)}`, {
      headers: withAuth(accessToken),
    });
  },

  /** Update user. Only provided fields are updated. Returns updated user. */
  updateUser: async (
    accessToken: string,
    userId: string,
    payload: UpdateUserPayload
  ): Promise<UserManagementDetail | null> => {
    return patchAndUnwrap<UserManagementDetail>(
      `${BASE}/${encodeURIComponent(userId)}`,
      payload,
      { headers: withAuth(accessToken) }
    );
  },

  /** Get all active permissions (flat and by category) for editing user permissions. */
  getPermissions: async (
    accessToken: string
  ): Promise<GetPermissionsResponse | null> => {
    return getAndUnwrap<GetPermissionsResponse>(`${BASE}/permissions`, {
      headers: withAuth(accessToken),
    });
  },

  /** Replace user permissions. Empty array clears all. Returns updated user. */
  updateUserPermissions: async (
    accessToken: string,
    userId: string,
    payload: UpdateUserPermissionsPayload
  ): Promise<UserManagementDetail | null> => {
    return patchAndUnwrap<UserManagementDetail>(
      `${BASE}/${encodeURIComponent(userId)}/permissions`,
      payload,
      { headers: withAuth(accessToken) }
    );
  },

  /** Create a new permission. */
  createPermission: async (
    accessToken: string,
    payload: CreatePermissionPayload
  ): Promise<PermissionRecord | null> => {
    return postAndUnwrap<PermissionRecord>(`${BASE}/permissions`, payload, {
      headers: withAuth(accessToken),
    });
  },

  /** Update a permission by ID. */
  updatePermission: async (
    accessToken: string,
    permissionId: string,
    payload: UpdatePermissionPayload
  ): Promise<PermissionRecord | null> => {
    return patchAndUnwrap<PermissionRecord>(
      `${BASE}/permissions/${encodeURIComponent(permissionId)}`,
      payload,
      { headers: withAuth(accessToken) }
    );
  },

  /** Delete a permission. Removes from all users. */
  deletePermission: async (
    accessToken: string,
    permissionId: string
  ): Promise<unknown> => {
    return deleteAndUnwrap<unknown>(
      `${BASE}/permissions/${encodeURIComponent(permissionId)}`,
      { headers: withAuth(accessToken) }
    );
  },
};
