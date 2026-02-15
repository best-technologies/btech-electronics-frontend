import { authApi } from "@/lib/api/auth-api";

/**
 * Auth service — re-exports auth API for use in app/hooks.
 * Auth endpoints are unprotected (no token required).
 */
export const authService = authApi;

export type {
  AuthResponse,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  SignInPayload,
} from "@/lib/api/auth-api";
