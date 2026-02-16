import type { ApiRequestConfig } from "./types";
import { ApiError } from "./types";
import { API_CONFIG } from "./constants";

function buildUrl(path: string, params?: ApiRequestConfig["params"]): string {
  const base = path.startsWith("http")
    ? path
    : `${API_CONFIG.basePath}${path.startsWith("/") ? path : `/${path}`}`;
  if (!params) return base;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") search.set(k, String(v));
  });
  const q = search.toString();
  return q ? `${base}?${q}` : base;
}

async function request<T>(
  path: string,
  config: ApiRequestConfig = {}
): Promise<T> {
  const {
    params,
    timeout = API_CONFIG.defaultTimeout,
    headers: configHeaders,
    body: configBody,
    ...init
  } = config;

  const url = buildUrl(path, params);
  const headers = new Headers(API_CONFIG.defaultHeaders);
  if (configHeaders) {
    new Headers(configHeaders).forEach((value, key) => headers.set(key, value));
  }
  const body = configBody;
  if (body instanceof FormData) {
    headers.delete("Content-Type");
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...init,
      body,
      headers,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return (await response.json()) as T;
    }
    return undefined as T;
  } catch (err) {
    clearTimeout(id);
    if (err instanceof ApiError) throw err;
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new ApiError("Request timeout", 408);
      }
      throw new ApiError(err.message, 0);
    }
    throw new ApiError("Unknown error", 0);
  }
}

export const apiClient = {
  get: <T>(path: string, config?: ApiRequestConfig) =>
    request<T>(path, { ...config, method: "GET" }),

  post: <T>(path: string, body?: unknown, config?: ApiRequestConfig) =>
    request<T>(path, {
      ...config,
      method: "POST",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, config?: ApiRequestConfig) =>
    request<T>(path, { ...config, method: "PUT", body: body ? JSON.stringify(body) : undefined }),

  patch: <T>(path: string, body?: unknown, config?: ApiRequestConfig) =>
    request<T>(path, { ...config, method: "PATCH", body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string, config?: ApiRequestConfig) =>
    request<T>(path, { ...config, method: "DELETE" }),
};
