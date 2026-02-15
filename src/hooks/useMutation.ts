"use client";

import { useCallback, useState } from "react";
import { useQueryStore } from "@/stores/queryStore";

export interface UseMutationOptions<TData, TVariables> {
  /** Async function (e.g. API call). Receives variables, returns data. */
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Optional: invalidate these query keys (or prefix) after success. */
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  /** If provided, invalidate all cache entries whose key starts with this prefix after success. */
  invalidateKeys?: string;
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<void>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  error: Error | null;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

export function useMutation<TData, TVariables>({
  mutationFn,
  onSuccess,
  onError,
  invalidateKeys,
}: UseMutationOptions<TData, TVariables>): UseMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const invalidateMatching = useQueryStore((s) => s.invalidateMatching);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setStatus("pending");
      setError(null);
      try {
        const result = await mutationFn(variables);
        setData(result);
        setStatus("success");
        onSuccess?.(result, variables);
        if (invalidateKeys) invalidateMatching(invalidateKeys);
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        setStatus("error");
        onError?.(e, variables);
        throw err;
      }
    },
    [mutationFn, onSuccess, onError, invalidateKeys, invalidateMatching]
  );

  const mutate = useCallback(
    async (variables: TVariables) => {
      await mutateAsync(variables);
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setStatus("idle");
  }, []);

  return {
    mutate,
    mutateAsync,
    data,
    error,
    isPending: status === "pending",
    isSuccess: status === "success",
    isError: status === "error",
    reset,
  };
}
