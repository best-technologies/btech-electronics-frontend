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
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/dashboard/management/users">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                All users
              </h1>
              <p className="mt-0.5 text-muted-foreground">
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
    <div className="p-6 lg:p-8 space-y-8">
      <div className="h-10 w-48 rounded-lg bg-muted animate-pulse" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-muted/80 animate-pulse" />
        ))}
      </div>
      <div className="h-24 rounded-xl bg-muted/60 animate-pulse" />
      <div className="h-96 rounded-xl bg-muted/60 animate-pulse" />
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
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <LoadingSkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      <AllUsersHeader />

      <div className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-12">
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
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <h3 className="text-lg font-semibold text-destructive">
              Unable to load users
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {listErrorObj?.message ?? "Something went wrong. Please try again."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2 rounded-lg"
              onClick={() => refetchList()}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {!listLoading && !listError && listResponse && items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
              <Users className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No users match your filters
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting filters or clear to see all users.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-lg"
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
