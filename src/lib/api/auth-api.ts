import { apiClient } from "./client";

/**
 * Auth API — unprotected endpoints (no auth token required).
 * Base path: baseUrl/apiVersion/auth/...
 */

export interface SignInPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface AuthResponse {
  user: { id: string; email: string };
  token?: string;
}

export interface MessageResponse {
  message: string;
}

export const authApi = {
  signIn: (payload: SignInPayload) =>
    apiClient.post<AuthResponse>("/auth/sign-in", payload),

  signOut: () => apiClient.post<void>("/auth/sign-out"),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient.post<MessageResponse>("/auth/forgot-password", payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<MessageResponse>("/auth/reset-password", payload),

  resendOtp: (payload: ResendOtpPayload) =>
    apiClient.post<MessageResponse>("/auth/resend-otp", payload),
};
