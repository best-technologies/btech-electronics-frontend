/**
 * API configuration. Prefer env vars in production.
 * URL structure: baseUrl / apiVersion / path (e.g. https://api.example.com/v1/auth/sign-in)
 */

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "/api";
  }
  return process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:3000/api";
};

const getApiVersion = () => {
  return process.env.NEXT_PUBLIC_API_VERSION ?? "v1";
};

const baseUrl = getBaseUrl().replace(/\/$/, "");
const apiVersion = getApiVersion();

export const API_CONFIG = {
  /** Base URL without trailing slash (e.g. https://api.example.com or /api) */
  baseUrl,
  /** Version segment (e.g. v1). Full base = baseUrl/version */
  apiVersion,
  /** baseUrl/apiVersion for request paths */
  basePath: `${baseUrl}/${apiVersion}`,
  defaultTimeout: 30_000,
  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;
