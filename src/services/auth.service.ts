import { authApi } from "@/lib/api/auth-api";

/**
 * Auth service — re-exports auth API (backend-integrated).
 * Use authApi or authService interchangeably.
 */
export const authService = authApi;

export type {
  AdminLoginOtpPayload,
  AdminVerifyLoginOtpPayload,
  OnboardWarehouseAdminData,
  OnboardWarehouseAdminPayload,
  RegisterData,
  RegisterPayload,
  RequestPasswordResetData,
  RequestPasswordResetPayload,
  SignInData,
  SignInDataUser,
  SignInPayload,
  UserProfileData,
  VerifyPasswordResetPayload,
} from "@/lib/api/auth-api";
