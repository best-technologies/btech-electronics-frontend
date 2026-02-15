import { apiClient } from "./client";
import type { ApiRequestConfig } from "./types";
import type { BackendResponse } from "./backend-types";
import { unwrapBackendResponse } from "./backend-types";

/**
 * Auth API — matches backend from FRONTEND_INTEGRATION.md.
 * Base path: baseUrl/apiVersion/auth/...
 * Unprotected endpoints do not require Authorization. Protected ones accept accessToken.
 */

// --- Payloads (unprotected) ---

export interface SignInPayload {
  email: string;
  password: string;
}

export interface AdminLoginOtpPayload {
  email: string;
}

export interface AdminVerifyLoginOtpPayload {
  email: string;
  otp: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  referral_code?: string;
}

export interface RequestPasswordResetPayload {
  email: string;
}

export interface VerifyPasswordResetPayload {
  email: string;
  otp: string;
  new_password: string;
}

// --- Protected payloads ---

export interface OnboardWarehouseAdminPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  password?: string;
}

// --- Response data types ---

export interface SignInDataUser {
  access_token: string;
  role: "user";
}

export interface SignInDataAdminOtp {
  role: "admin";
}

export type SignInData = SignInDataUser | SignInDataAdminOtp;

export interface RegisterData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  createdAt: string;
}

export interface OnboardWarehouseAdminData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin";
  createdAt: string;
  temporaryPassword?: string;
  message?: string;
}

export interface RequestPasswordResetData {
  email: string;
}

export interface PromotedProduct {
  product_image: string | null;
  product_name: string;
  affiliate_commission: number;
  earning_per_sale: number;
  all_time_earning: number;
  sales: number;
  status: string;
  affiliate_link: string;
}

export interface CommissionPayout {
  payout_id: string;
  amount: number;
  status: string;
  method: string;
  reference: string;
  requestedAt: string;
  paidAt: string | null;
}

export interface UserProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  profile_picture: string | null;
  role: string;
  status: "active" | "suspended" | "inactive";
  permissions: string[];
  is_affiliate: boolean;
  affiliate_status: string;
  joined_date: string;
  address: string;
  stats: { totalOrders: number; totalCartItems: number };
  promoted_products: PromotedProduct[];
  commission_payouts: CommissionPayout[];
}

// --- Helpers ---

function withAuth(token: string): ApiRequestConfig["headers"] {
  return { Authorization: `Bearer ${token}` };
}

async function postAndUnwrap<T>(
  path: string,
  body?: unknown,
  config?: ApiRequestConfig
): Promise<T | null> {
  const res = await apiClient.post<BackendResponse<T>>(path, body, config);
  return unwrapBackendResponse(res);
}

async function getAndUnwrap<T>(path: string, config?: ApiRequestConfig): Promise<T | null> {
  const res = await apiClient.get<BackendResponse<T>>(path, config);
  return unwrapBackendResponse(res);
}

// --- Unprotected endpoints ---

export const authApi = {
  /** Login. Returns access_token for role `user`; for admin, returns role only (use admin verify OTP next). */
  signIn: (payload: SignInPayload) =>
    postAndUnwrap<SignInData>("/auth/sign-in", payload),

  /** Admin: request OTP to email. */
  adminRequestLoginOtp: (payload: AdminLoginOtpPayload) =>
    postAndUnwrap<null>("/auth/admin-login-otp", payload),

  /** Admin: verify OTP and sign in. Returns access_token. */
  adminVerifyLoginOtp: (payload: AdminVerifyLoginOtpPayload) =>
    postAndUnwrap<SignInDataUser>("/auth/admin-verify-login-otp", payload),

  /** Register new user. */
  register: (payload: RegisterPayload) =>
    postAndUnwrap<RegisterData>("/auth/register", payload),

  /** Forgot password: request OTP to email. */
  requestPasswordResetOtp: (payload: RequestPasswordResetPayload) =>
    postAndUnwrap<RequestPasswordResetData>("/auth/request-password-reset-email", payload),

  /** Forgot password: verify OTP and set new password. */
  verifyPasswordResetOtp: (payload: VerifyPasswordResetPayload) =>
    postAndUnwrap<null>("/auth/verify-password-reset-email", payload),

  /** Get current user profile. Requires access token. */
  fetchUserDetails: (accessToken: string) =>
    getAndUnwrap<UserProfileData>("/auth/fetch-user-details", {
      headers: withAuth(accessToken),
    }),

  /** Onboard warehouse admin. Requires access token. */
  onboardWarehouseAdmin: (accessToken: string, payload: OnboardWarehouseAdminPayload) =>
    postAndUnwrap<OnboardWarehouseAdminData>(
      "/auth/warehouse/onboard-warehouse-admin",
      payload,
      { headers: withAuth(accessToken) }
    ),
};
