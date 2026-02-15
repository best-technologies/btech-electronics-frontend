export { apiClient } from "./client";
export { API_CONFIG } from "./constants";
export type { ApiErrorBody, ApiMethod, ApiRequestConfig } from "./types";
export { ApiError } from "./types";

export type { BackendResponse } from "./backend-types";
export { unwrapBackendResponse } from "./backend-types";

export { authApi } from "./auth-api";
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
  SignInDataAdminOtp,
  SignInDataUser,
  SignInPayload,
  UserProfileData,
  VerifyPasswordResetPayload,
} from "./auth-api";

export { consignmentApi } from "./distribution/consignment-api";
export type {
  AddConsignmentItemPayload,
  Consignment,
  ConsignmentAnalysisByStatus,
  ConsignmentAnalysisBySupplier,
  ConsignmentDetail,
  ConsignmentDocument,
  ConsignmentItem,
  ConsignmentItemPayload,
  ConsignmentListAnalysis,
  ConsignmentListMeta,
  ConsignmentListResponse,
  ConsignmentReceivedBy,
  ConsignmentSortBy,
  ConsignmentSortOrder,
  ConsignmentStatus,
  CreateConsignmentPayload,
  ListConsignmentsParams,
  UpdateConsignmentItemPayload,
} from "./distribution/consignment-api";

export { dashboardApi } from "./distribution/dashboard-api";
export type {
  BulkOrderSummary,
  ConsignmentSummary,
  DashboardBulkOrderFull,
  DashboardConsignmentFull,
  DashboardData,
  DashboardSummary,
  DocumentsSummary,
  RecentBulkOrder,
  RecentConsignment,
  RecentDocument,
} from "./distribution/dashboard-api";
