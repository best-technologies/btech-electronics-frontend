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
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex gap-4">
        <div className="h-10 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-10 w-36 rounded-lg bg-muted animate-pulse" />
      </div>
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

export default function UserManagementPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const accessToken = useAuthStore((s) => s.accessToken);
  const canManageUsers = useAuthStore(selectHasManageUser);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);

  const {
    data: dashboard,
    isLoading,
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

  if (isLoading && !dashboard) {
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

  if (isError || !dashboard) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h1 className="text-lg font-semibold text-destructive">
            Unable to load user management
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error?.message ?? "Failed to load. Please try again."}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-2"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
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
        <div className="w-full px-4 pt-4 sm:px-6 lg:px-8">
          <ViewOnlyBanner areaName="user management" />
        </div>
      )}

      <div className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        {analysis && <UserOverviewSection analysis={analysis} />}

        <UserTable
          items={recentUsers}
          title="Recent users"
          headerAction={
            <Button size="sm" className="gap-2" asChild>
              <Link href="/dashboard/management/users/all">
                View All
                <ArrowRight className="h-4 w-4" />
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
