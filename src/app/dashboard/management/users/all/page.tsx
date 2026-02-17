"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import {
  userManagementApi,
  type ListUserManagementParams,
  type UserManagementSortBy,
} from "@/lib/api";
import { useQuery } from "@/hooks/useQuery";
import {
  UserFiltersSection,
  UserTable,
  UserPagination,
} from "../components";
import { Users, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const LIST_KEY_PREFIX = "user-management-list";
const DEFAULT_LIMIT = 20;

function buildListKey(params: ListUserManagementParams): string {
  return `${LIST_KEY_PREFIX}-${JSON.stringify(params ?? {})}`;
}

function AllUsersHeader() {
  return (
    <div className="border-b border-border bg-card">
      <div className="w-full px-2.5 py-3 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" asChild className="h-7 gap-2 text-[11px] touch-manipulation sm:h-9 sm:text-sm">
              <Link href="/dashboard/management/users">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground sm:text-2xl">
                All users
              </h1>
              <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-sm">
                Search, filter, and browse all users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-2.5 space-y-4 sm:p-6 sm:space-y-8 lg:p-8">
      <div className="h-8 w-48 rounded-lg bg-muted animate-pulse sm:h-10" />
      <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-muted/80 animate-pulse sm:h-28 sm:rounded-xl" />
        ))}
      </div>
      <div className="h-14 rounded-lg bg-muted/60 animate-pulse sm:h-24 sm:rounded-xl" />
      <div className="h-40 rounded-lg bg-muted/60 animate-pulse sm:h-96 sm:rounded-xl" />
    </div>
  );
}

export default function AllUsersPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [status, setStatus] = useState("");
  const [fromCreatedAt, setFromCreatedAt] = useState("");
  const [toCreatedAt, setToCreatedAt] = useState("");
  const [sortBy, setSortBy] = useState<UserManagementSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  const listParams: ListUserManagementParams = useMemo(
    () => ({
      page,
      limit,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(email.trim() ? { email: email.trim() } : {}),
      ...(roleFilter.trim() ? { role: roleFilter.trim() } : {}),
      ...(status.trim() ? { status: status.trim() } : {}),
      ...(fromCreatedAt ? { fromCreatedAt } : {}),
      ...(toCreatedAt ? { toCreatedAt } : {}),
      sortBy,
      sortOrder,
    }),
    [
      page,
      limit,
      search,
      email,
      roleFilter,
      status,
      fromCreatedAt,
      toCreatedAt,
      sortBy,
      sortOrder,
    ]
  );

  const listQueryKey = buildListKey(listParams);

  const {
    data: listResponse,
    isLoading: listLoading,
    isError: listError,
    error: listErrorObj,
    refetch: refetchList,
  } = useQuery({
    queryKey: listQueryKey,
    queryFn: () => userManagementApi.getAll(accessToken!, listParams),
    enabled: !!accessToken && role === "admin",
  });

  useEffect(() => {
    document.title = "All users | BTech-Electronics";
  }, []);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
    }
  }, [role, router]);

  const applyFilters = () => setPage(1);
  const clearFilters = () => {
    setPage(1);
    setSearch("");
    setEmail("");
    setRoleFilter("");
    setStatus("");
    setFromCreatedAt("");
    setToCreatedAt("");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  if (role !== "admin") {
    return null;
  }

  const items = listResponse?.items ?? [];
  const meta = listResponse?.meta;
  const isLoading = listLoading && !listResponse;

  if (isLoading) {
    return (
      <>
        <AllUsersHeader />
        <div className="w-full px-2.5 py-3 sm:px-6 sm:py-8 lg:px-8">
          <LoadingSkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      <AllUsersHeader />

      <div className="w-full px-2.5 py-3 space-y-5 sm:px-6 sm:py-8 sm:space-y-12 lg:px-8">
        <UserFiltersSection
          search={search}
          onSearchChange={setSearch}
          email={email}
          onEmailChange={setEmail}
          role={roleFilter}
          onRoleChange={setRoleFilter}
          status={status}
          onStatusChange={setStatus}
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

        {listError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 sm:rounded-xl sm:p-6">
            <h3 className="text-xs font-semibold text-destructive sm:text-lg">
              Unable to load users
            </h3>
            <p className="mt-2 text-[11px] text-muted-foreground sm:text-sm">
              {listErrorObj?.message ?? "Something went wrong. Please try again."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 h-7 gap-2 rounded-lg text-[11px] touch-manipulation sm:h-9 sm:text-sm"
              onClick={() => refetchList()}
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              Retry
            </Button>
          </div>
        )}

        {!listLoading && !listError && listResponse && items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 sm:rounded-xl sm:py-16">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground sm:mb-4 sm:h-14 sm:w-14">
              <Users className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
            <p className="text-[11px] font-medium text-foreground sm:text-sm">
              No users match your filters
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground sm:text-sm">
              Try adjusting filters or clear to see all users.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 h-7 rounded-lg text-[11px] touch-manipulation sm:h-9 sm:text-sm"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        )}

        {!listLoading && !listError && listResponse && items.length > 0 && (
          <>
            <UserTable items={items} title="Users" />
            {meta && (
              <UserPagination
                meta={meta}
                limit={limit}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
