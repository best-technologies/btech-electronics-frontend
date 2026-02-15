/**
 * Shared API types and error handling.
 */

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiErrorBody {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: ApiErrorBody
  ) {
    super(message);
    this.name = "ApiError";
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let body: ApiErrorBody | undefined;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      try {
        body = (await response.json()) as ApiErrorBody;
      } catch {
        // ignore
      }
    }
    const message =
      body?.message ?? `Request failed with status ${response.status}`;
    return new ApiError(message, response.status, body);
  }
}

export interface ApiRequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}
