import { create } from "zustand";

export type QueryStatus = "idle" | "loading" | "success" | "error";

export interface QueryEntry<T = unknown> {
  data: T | null;
  error: Error | null;
  status: QueryStatus;
  fetchedAt: number | null;
}

interface QueryState {
  cache: Record<string, QueryEntry>;
  setEntry: <T>(key: string, entry: Partial<QueryEntry<T>>) => void;
  getEntry: <T>(key: string) => QueryEntry<T> | undefined;
  invalidate: (key: string) => void;
  invalidateAll: () => void;
  invalidateMatching: (prefix: string) => void;
}

const createInitialEntry = <T>(): QueryEntry<T> => ({
  data: null,
  error: null,
  status: "idle",
  fetchedAt: null,
});

export const useQueryStore = create<QueryState>((set, get) => ({
  cache: {},

  setEntry: (key, entry) =>
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: {
          ...createInitialEntry(),
          ...state.cache[key],
          ...entry,
        },
      },
    })),

  getEntry: <T>(key: string): QueryEntry<T> | undefined =>
    get().cache[key] as QueryEntry<T> | undefined,

  invalidate: (key) =>
    set((state) => {
      const next = { ...state.cache };
      delete next[key];
      return { cache: next };
    }),

  invalidateAll: () => set({ cache: {} }),

  invalidateMatching: (prefix) =>
    set((state) => {
      const next = { ...state.cache };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(prefix)) delete next[k];
      });
      return { cache: next };
    }),
}));
