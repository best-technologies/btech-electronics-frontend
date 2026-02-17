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
  InvoicesSummary,
  RecentBulkOrder,
  RecentConsignment,
  RecentDocument,
  StocksSummary,
} from "./distribution/dashboard-api";

export { invoiceApi } from "./distribution/invoice-api";
export type {
  CreateInvoiceItemPayload,
  CreateInvoicePayload,
  Invoice,
  InvoiceItem,
  InvoiceListAnalysis,
  InvoiceListMeta,
  InvoiceListResponse,
  InvoicePayment,
  InvoiceSortBy,
  InvoiceSortOrder,
  ListInvoiceParams,
} from "./distribution/invoice-api";

export { stockApi, validateStockImageFiles } from "./distribution/stock-api";
export type {
  CreateStockPayload,
  DeleteStockResponse,
  ListStockParams,
  StockAnalysisByCategory,
  StockListAnalysis,
  StockListMeta,
  StockListResponse,
  StockProduct,
  StockProductImage,
  StockSearchItem,
  StockSortBy,
  StockSortOrder,
  UpdateStockPayload,
} from "./distribution/stock-api";

export { userManagementApi } from "./distribution/user-management-api";
export type {
  CreatePermissionPayload,
  GetPermissionsResponse,
  ListUserManagementParams,
  PermissionOption,
  PermissionRecord,
  UpdatePermissionPayload,
  UpdateUserPayload,
  UpdateUserPermissionsPayload,
  UserAffiliate,
  UserBank,
  UserDetailCounts,
  UserManagementAnalysis,
  UserManagementDashboardData,
  UserManagementDetail,
  UserManagementListMeta,
  UserManagementListResponse,
  UserManagementSortBy,
  UserManagementSortOrder,
  UserManagementUserItem,
  UserPermission,
  UserStore,
  UserWallet,
} from "./distribution/user-management-api";
