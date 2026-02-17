"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthStore, selectHasManageStock } from "@/stores/authStore";
import { stockApi, type ListStockParams, type StockSortBy } from "@/lib/api";
import { useQuery } from "@/hooks/useQuery";
import {
  StocksHeader,
  StockOverviewSection,
  StockFiltersSection,
  StockTable,
  StockPagination,
} from "./components";
import { ViewOnlyBanner } from "@/components/ViewOnlyBanner";
import { Boxes, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const STOCK_LIST_KEY_PREFIX = "stock-list";
const DEFAULT_LIMIT = 20;

function buildListKey(params: ListStockParams): string {
  return `${STOCK_LIST_KEY_PREFIX}-${JSON.stringify(params ?? {})}`;
}

function LoadingSkeleton() {
  return (
    <div className="p-2.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-8">
      <div className="flex flex-wrap gap-2 sm:gap-4">
        <div className="h-6 w-20 rounded-md bg-muted animate-pulse sm:h-10 sm:w-48 sm:rounded-lg" />
        <div className="h-6 w-16 rounded-md bg-muted animate-pulse sm:h-10 sm:w-36 sm:rounded-lg" />
      </div>
      <div className="grid gap-2 grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-muted/80 animate-pulse sm:h-28 sm:rounded-xl" />
        ))}
      </div>
      <div className="h-14 rounded-lg bg-muted/60 animate-pulse sm:h-24 sm:rounded-xl" />
      <div className="h-40 rounded-lg bg-muted/60 animate-pulse sm:h-96 sm:rounded-xl" />
    </div>
  );
}

export default function StocksPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const canManageStock = useAuthStore(selectHasManageStock);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState("");
  const [lowStock, setLowStock] = useState("");
  const [fromCreatedAt, setFromCreatedAt] = useState("");
  const [toCreatedAt, setToCreatedAt] = useState("");
  const [sortBy, setSortBy] = useState<StockSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [filtersSectionOpen, setFiltersSectionOpen] = useState(false);

  const listParams: ListStockParams = useMemo(
    () => ({
      page,
      limit,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(sku.trim() ? { sku: sku.trim() } : {}),
      ...(name.trim() ? { name: name.trim() } : {}),
      ...(category.trim() ? { category: category.trim() } : {}),
      ...(isActive !== "" ? { isActive } : {}),
      ...(lowStock !== "" ? { lowStock } : {}),
      ...(fromCreatedAt ? { fromCreatedAt } : {}),
      ...(toCreatedAt ? { toCreatedAt } : {}),
      sortBy,
      sortOrder,
    }),
    [page, limit, search, sku, name, category, isActive, lowStock, fromCreatedAt, toCreatedAt, sortBy, sortOrder]
  );

  const queryKey = buildListKey(listParams);
  const {
    data: listResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => stockApi.list(accessToken!, listParams),
    enabled: !!accessToken,
  });

  const items = listResponse?.items ?? [];
  const analysis = listResponse?.analysis;
  const meta = listResponse?.meta;

  useEffect(() => {
    document.title = "Stocks | BTech-Electronics";
  }, []);

  const applyFilters = () => setPage(1);
  const clearFilters = () => {
    setPage(1);
    setSearch("");
    setSku("");
    setName("");
    setCategory("");
    setIsActive("");
    setLowStock("");
    setFromCreatedAt("");
    setToCreatedAt("");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  if (isLoading && !listResponse) {
    return (
      <>
        <div className="border-b border-border bg-card/50">
          <div className="w-full px-2.5 py-3 sm:px-6 sm:py-8 lg:px-8">
            <div className="h-4 w-24 rounded bg-muted animate-pulse sm:h-8 sm:w-56 sm:rounded-lg" />
            <div className="mt-1.5 h-3 w-40 rounded bg-muted/70 animate-pulse sm:mt-2 sm:h-5 sm:w-80" />
          </div>
        </div>
        <LoadingSkeleton />
      </>
    );
  }

  return (
    <>
      <StocksHeader onRefresh={() => refetch()} canManageStock={canManageStock} />

      {!canManageStock && (
        <div className="w-full px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">
          <ViewOnlyBanner areaName="stocks" />
        </div>
      )}

      <div className="w-full px-2.5 py-3 sm:px-6 sm:py-6 lg:px-8 space-y-3 sm:space-y-6">
        {analysis && <StockOverviewSection analysis={analysis} />}

        <StockFiltersSection
          filtersSectionOpen={filtersSectionOpen}
          onFiltersSectionOpenChange={setFiltersSectionOpen}
          search={search}
          onSearchChange={setSearch}
          sku={sku}
          onSkuChange={setSku}
          name={name}
          onNameChange={setName}
          category={category}
          onCategoryChange={setCategory}
          isActive={isActive}
          onIsActiveChange={setIsActive}
          lowStock={lowStock}
          onLowStockChange={setLowStock}
          fromCreatedAt={fromCreatedAt}
          onFromCreatedAtChange={setFromCreatedAt}
          toCreatedAt={toCreatedAt}
          onToCreatedAtChange={setToCreatedAt}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          showFilters={showFilters}
          onShowFiltersChange={setShowFilters}
          onApply={applyFilters}
          onClear={clearFilters}
        />

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <h3 className="text-lg font-semibold text-destructive">Unable to load stocks</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {error?.message ?? "Something went wrong. Please try again."}
            </p>
            <Button variant="outline" size="sm" className="mt-4 gap-2 rounded-lg" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && listResponse && items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
              <Boxes className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-foreground">No products match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting filters or add a new product.</p>
            {canManageStock ? (
              <Button asChild className="mt-4 gap-2 rounded-lg" size="sm">
                <Link href="/dashboard/stocks/new">
                  <Plus className="h-4 w-4" />
                  Add new stock
                </Link>
              </Button>
            ) : (
              <Button
                className="mt-4 gap-2 rounded-lg cursor-not-allowed"
                size="sm"
                disabled
                title="You don't have permission to perform this action. Contact an administrator if you need access."
              >
                <Plus className="h-4 w-4" />
                Add new stock
              </Button>
            )}
          </div>
        )}

        {!isLoading && !isError && listResponse && items.length > 0 && (
          <>
            {meta && (
              <StockPagination
                meta={meta}
                limit={limit}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                onPageChange={setPage}
              />
            )}
            <StockTable items={items} />
          </>
        )}
      </div>
    </>
  );
}
