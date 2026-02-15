"use client";

import { useCallback, useEffect, useRef } from "react";
import { useQueryStore } from "@/stores/queryStore";

export interface UseQueryOptions<T> {
  /** Cache key. Must be stable (e.g. string or string array joined). */
  queryKey: string;
  /** Async function that returns the data. */
  queryFn: () => Promise<T>;
  /** If true, skip running the query (e.g. while waiting for deps). */
  enabled?: boolean;
  /** Consider cache stale after this many ms. Refetch when component mounts if stale. Default: 5 * 60 * 1000 (5 min). */
  staleTime?: number;
  /** Keep previous data while refetching. Default: true. */
  keepPreviousData?: boolean;
}

export interface UseQueryResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
  /** Remove this query from cache. */
  invalidate: () => void;
}

export function useQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 5 * 60 * 1000,
  keepPreviousData = true,
}: UseQueryOptions<T>): UseQueryResult<T> {
  const setEntry = useQueryStore((s) => s.setEntry);
  const getEntry = useQueryStore((s) => s.getEntry);
  const invalidate = useQueryStore((s) => s.invalidate);
  const entry = useQueryStore((s) => s.cache[queryKey]) as
    | (ReturnType<typeof useQueryStore.getState>["cache"][string] & { data: T | null })
    | undefined;

  const data = (entry?.data as T | null | undefined) ?? null;
  const error = entry?.error ?? null;
  const status = entry?.status ?? "idle";
  const fetchedAt = entry?.fetchedAt ?? null;
  const isLoading = status === "idle" && enabled;
  const isFetching = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const run = useCallback(async () => {
    setEntry(queryKey, { status: "loading" });
    if (!keepPreviousData) {
      setEntry(queryKey, { data: null, error: null });
    }
    try {
      const result = await queryFnRef.current();
      setEntry(queryKey, {
        data: result,
        error: null,
        status: "success",
        fetchedAt: Date.now(),
      });
    } catch (err) {
      setEntry(queryKey, {
        data: keepPreviousData ? getEntry(queryKey)?.data ?? null : null,
        error: err instanceof Error ? err : new Error(String(err)),
        status: "error",
        fetchedAt: Date.now(),
      });
    }
  }, [queryKey, setEntry, keepPreviousData, getEntry]);

  useEffect(() => {
    if (!enabled) return;
    const isStale =
      fetchedAt === null || (staleTime >= 0 && Date.now() - fetchedAt > staleTime);
    if (status !== "loading" && isStale) {
      run();
    }
  }, [queryKey, enabled, staleTime, fetchedAt, status, run]);

  const refetch = useCallback(async () => {
    await run();
  }, [run]);

  const invalidateCache = useCallback(() => {
    invalidate(queryKey);
  }, [queryKey, invalidate]);

  return {
    data,
    error,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    refetch,
    invalidate: invalidateCache,
  };
}
