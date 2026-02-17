"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthStore, selectHasManageConsignment } from "@/stores/authStore";
import { consignmentApi, type ListConsignmentsParams } from "@/lib/api";
import { useQuery } from "@/hooks/useQuery";
import { ViewOnlyBanner } from "@/components/ViewOnlyBanner";
import {
  ConsignmentPageHeader,
  ConsignmentOverviewSection,
  ConsignmentFiltersSection,
  ConsignmentErrorState,
  ConsignmentEmptyState,
  ConsignmentTableSection,
} from "./components";
import {
  CONSIGNMENT_LIST_KEY_PREFIX,
  DEFAULT_LIMIT,
  STATUS_OPTIONS,
} from "./constants";
import type { ConsignmentSortBy, ConsignmentStatus } from "@/lib/api";

function buildListKey(params: ListConsignmentsParams): string {
  return `${CONSIGNMENT_LIST_KEY_PREFIX}-${JSON.stringify(params ?? {})}`;
}

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex gap-4">
        <div className="h-10 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-10 w-36 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-muted/80 animate-pulse" />
        ))}
      </div>
      <div className="h-24 rounded-xl bg-muted/60 animate-pulse" />
      <div className="h-96 rounded-xl bg-muted/60 animate-pulse" />
    </div>
  );
}

export default function ConsignmentPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const canManageConsignment = useAuthStore(selectHasManageConsignment);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [status, setStatus] = useState<ConsignmentStatus | "">("");
  const [search, setSearch] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromCreatedAt, setFromCreatedAt] = useState("");
  const [toCreatedAt, setToCreatedAt] = useState("");
  const [sortBy, setSortBy] = useState<ConsignmentSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [filtersSectionOpen, setFiltersSectionOpen] = useState(false);
  const [overviewSectionOpen, setOverviewSectionOpen] = useState(true);
  const [bySupplierSectionOpen, setBySupplierSectionOpen] = useState(false);

  const listParams: ListConsignmentsParams = useMemo(
    () => ({
      page,
      limit,
      ...(status ? { status: status as ConsignmentStatus } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(referenceNumber.trim() ? { referenceNumber: referenceNumber.trim() } : {}),
      ...(invoiceNumber.trim() ? { invoiceNumber: invoiceNumber.trim() } : {}),
      ...(supplierName.trim() ? { supplierName: supplierName.trim() } : {}),
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
      ...(fromCreatedAt ? { fromCreatedAt } : {}),
      ...(toCreatedAt ? { toCreatedAt } : {}),
      sortBy,
      sortOrder,
    }),
    [
      page,
      limit,
      status,
      search,
      referenceNumber,
      invoiceNumber,
      supplierName,
      fromDate,
      toDate,
      fromCreatedAt,
      toCreatedAt,
      sortBy,
      sortOrder,
    ]
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
    queryFn: () => consignmentApi.list(accessToken!, listParams),
    enabled: !!accessToken,
  });

  const consignments = listResponse?.items ?? [];
  const analysis = listResponse?.analysis;
  const meta = listResponse?.meta;

  useEffect(() => {
    document.title = "Consignment | BTech-Electronics";
  }, []);

  const applyFilters = () => setPage(1);
  const clearFilters = () => {
    setPage(1);
    setStatus("");
    setSearch("");
    setReferenceNumber("");
    setInvoiceNumber("");
    setSupplierName("");
    setFromDate("");
    setToDate("");
    setFromCreatedAt("");
    setToCreatedAt("");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const statusLabel =
    STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;

  if (isLoading && !listResponse) {
    return (
      <>
        <div className="border-b border-border bg-card/50">
          <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
            <div className="h-8 w-56 rounded-lg bg-muted animate-pulse" />
            <div className="mt-2 h-5 w-80 rounded bg-muted/70 animate-pulse" />
          </div>
        </div>
        <LoadingSkeleton />
      </>
    );
  }

  return (
    <>
      <ConsignmentPageHeader
        onRefresh={() => refetch()}
        canManageConsignment={!!canManageConsignment}
      />

      {!canManageConsignment && (
        <div className="w-full px-4 pt-4 sm:px-6 lg:px-8">
          <ViewOnlyBanner areaName="consignment" />
        </div>
      )}

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {analysis && (
          <ConsignmentOverviewSection
            analysis={analysis}
            isOpen={overviewSectionOpen}
            onToggle={() => setOverviewSectionOpen((o) => !o)}
          />
        )}

        <ConsignmentFiltersSection
          filtersOpen={filtersSectionOpen}
          bySupplierOpen={bySupplierSectionOpen}
          onFiltersToggle={() => setFiltersSectionOpen((o) => !o)}
          onBySupplierToggle={() => setBySupplierSectionOpen((o) => !o)}
          analysis={analysis}
          status={status}
          statusLabel={statusLabel}
          search={search}
          setSearch={setSearch}
          setStatus={setStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          referenceNumber={referenceNumber}
          setReferenceNumber={setReferenceNumber}
          invoiceNumber={invoiceNumber}
          setInvoiceNumber={setInvoiceNumber}
          supplierName={supplierName}
          setSupplierName={setSupplierName}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          fromCreatedAt={fromCreatedAt}
          setFromCreatedAt={setFromCreatedAt}
          toCreatedAt={toCreatedAt}
          setToCreatedAt={setToCreatedAt}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
        />

        {isError && (
          <ConsignmentErrorState
            message={error?.message}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && listResponse && consignments.length === 0 && (
          <ConsignmentEmptyState canManageConsignment={!!canManageConsignment} />
        )}

        {!isLoading && !isError && listResponse && consignments.length > 0 && (
          <ConsignmentTableSection
            consignments={consignments}
            meta={meta}
            page={page}
            limit={limit}
            setPage={setPage}
            setLimit={setLimit}
            canManageConsignment={!!canManageConsignment}
          />
        )}
      </div>
    </>
  );
}
