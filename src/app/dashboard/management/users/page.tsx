"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore, selectHasManageUser } from "@/stores/authStore";
import { userManagementApi } from "@/lib/api";
import { useQuery } from "@/hooks/useQuery";
import {
  UserManagementHeader,
  UserOverviewSection,
  UserTable,
  OnboardAdminModal,
} from "./components";
import { ViewOnlyBanner } from "@/components/ViewOnlyBanner";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowRight } from "lucide-react";

const DASHBOARD_QUERY_KEY = "user-management-dashboard";

function LoadingSkeleton() {
  return (
    <div className="p-2.5 space-y-4 sm:p-6 sm:space-y-8 lg:p-8">
      <div className="flex gap-2 sm:gap-4">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse sm:h-10" />
        <div className="h-8 w-36 rounded-lg bg-muted animate-pulse sm:h-10" />
      </div>
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

export default function UserManagementPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const accessToken = useAuthStore((s) => s.accessToken);
  const canManageUsers = useAuthStore(selectHasManageUser);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);

  const {
    data: dashboard,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => userManagementApi.getDashboard(accessToken!),
    enabled: !!accessToken && role === "admin",
  });

  useEffect(() => {
    document.title = "User management | BTech-Electronics";
  }, []);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
    }
  }, [role, router]);

  if (role !== "admin") {
    return null;
  }

  const analysis = dashboard?.analysis;
  const recentUsers = dashboard?.recentUsers ?? [];

  if ((isLoading || isFetching) && !dashboard) {
    return (
      <>
        <div className="border-b border-border bg-card/50">
          <div className="w-full px-2.5 py-3 sm:px-6 sm:py-8 lg:px-8">
            <div className="h-8 w-56 rounded-lg bg-muted animate-pulse" />
            <div className="mt-2 h-5 w-80 rounded bg-muted/70 animate-pulse" />
          </div>
        </div>
        <LoadingSkeleton />
      </>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="p-2.5 sm:p-6 lg:p-8">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 sm:rounded-xl sm:p-6">
          <h1 className="text-xs font-semibold text-destructive sm:text-lg">
            Unable to load user management
          </h1>
          <p className="mt-2 text-[11px] text-muted-foreground sm:text-sm">
            {error?.message ?? "Failed to load. Please try again."}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 h-7 gap-2 text-[11px] touch-manipulation sm:h-9 sm:text-sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <UserManagementHeader
        onRefresh={refetch}
        onOnboardAdmin={() => setOnboardModalOpen(true)}
        canManageUsers={canManageUsers}
      />

      {!canManageUsers && (
        <div className="w-full px-2.5 pt-2 sm:px-6 sm:pt-4 lg:px-8">
          <ViewOnlyBanner areaName="user management" />
        </div>
      )}

      <div className="w-full px-2.5 py-3 space-y-5 sm:px-6 sm:py-8 sm:space-y-12 lg:px-8">
        {analysis && <UserOverviewSection analysis={analysis} />}

        <UserTable
          items={recentUsers}
          title="Recent users"
          headerAction={
            <Button size="sm" className="h-7 gap-2 text-[11px] touch-manipulation sm:h-9 sm:text-sm" asChild>
              <Link href="/dashboard/management/users/all">
                View All
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </Button>
          }
        />
      </div>

      <OnboardAdminModal
        open={onboardModalOpen}
        onClose={() => setOnboardModalOpen(false)}
        onSuccess={() => refetch()}
        accessToken={accessToken!}
      />
    </>
  );
}
