import { ApiError } from "./types";

/**
 * Backend API response shape. All auth endpoints return this wrapper.
 */
export interface BackendResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  statusCode: number;
}

export function unwrapBackendResponse<T>(res: BackendResponse<T>): T | null {
  if (!res.success) {
    throw new ApiError(res.message, res.statusCode ?? 400);
  }
  return res.data ?? null;
}
