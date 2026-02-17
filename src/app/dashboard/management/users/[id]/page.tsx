"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore, selectHasManageUser } from "@/stores/authStore";
import { userManagementApi } from "@/lib/api";
import { useQuery } from "@/hooks/useQuery";
import {
  formatFullName,
  formatDate,
  formatDateTime,
  formatStatus,
  formatCurrency,
} from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { EditUserPermissionsCard, EditUserModal } from "../components";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Store,
  Wallet,
  CreditCard,
  BarChart3,
  RefreshCw,
  Award,
  FileText,
  Pencil,
} from "lucide-react";
import type { UserManagementDetail } from "@/lib/api";

const USER_DETAIL_KEY_PREFIX = "user-management-detail-";

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="h-10 w-64 rounded bg-muted animate-pulse" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-64 rounded-xl bg-muted/80 animate-pulse" />
        <div className="h-64 rounded-xl bg-muted/80 animate-pulse" />
      </div>
      <div className="h-96 rounded-xl bg-muted/60 animate-pulse" />
    </div>
  );
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const canManageUsers = useAuthStore(selectHasManageUser);

  const queryKey = id ? `${USER_DETAIL_KEY_PREFIX}${id}` : "";

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => userManagementApi.getById(accessToken!, id!),
    enabled: !!accessToken && !!id && role === "admin",
  });

  const [editUserOpen, setEditUserOpen] = useState(false);

  useEffect(() => {
    if (id) {
      document.title = user
        ? `${formatFullName(user.first_name, user.last_name) || user.email} | User | BTech-Electronics`
        : "User | BTech-Electronics";
    }
  }, [id, user]);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
    }
  }, [role, router]);

  if (role !== "admin") {
    return null;
  }

  if (!id) {
    router.replace("/dashboard/management/users");
    return null;
  }

  if (isLoading && !user) {
    return (
      <>
        <div className="border-b border-border bg-card/50">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="h-8 w-48 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <LoadingSkeleton />
      </>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h1 className="text-lg font-semibold text-destructive">
            Unable to load user
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error?.message ?? "User not found or failed to load."}
          </p>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/management/users">Back to users</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    formatFullName(user.first_name, user.last_name).trim() || user.email;

  return (
    <>
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
                  {displayName}
                </h1>
                <p className="mt-0.5 text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setEditUserOpen(true)}
                disabled={!canManageUsers}
                title={!canManageUsers ? "Manage user permission required" : undefined}
              >
                <Pencil className="h-4 w-4" />
                Edit user
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={formatStatus(user.status)} />
                <span className="rounded-md bg-muted/80 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {formatStatus(user.role)}
                </span>
                <span className="rounded-md bg-muted/80 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {formatStatus(user.level)}
                </span>
              </div>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                {user.email}
              </p>
              {user.phone_number && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  {user.phone_number}
                </p>
              )}
              {user.address && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {user.address}
                </p>
              )}
              <p className="text-muted-foreground">
                Joined {formatDate(user.createdAt)} · Updated {formatDate(user.updatedAt)}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {user.is_email_verified && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                    Email verified
                  </span>
                )}
                {user.is_otp_verified && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                    OTP verified
                  </span>
                )}
                {user.is_active !== undefined && (
                  <span
                    className={
                      user.is_active
                        ? "text-xs text-emerald-600 dark:text-emerald-400"
                        : "text-xs text-muted-foreground"
                    }
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {(user.counts?.orders != null ||
            user.counts?.commissionReferrals != null ||
            user.counts?.commissions != null) && (
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Counts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  {user.counts.orders != null && (
                    <div>
                      <dt className="text-muted-foreground">Orders</dt>
                      <dd className="font-medium tabular-nums">{user.counts.orders}</dd>
                    </div>
                  )}
                  {user.counts.commissionReferrals != null && (
                    <div>
                      <dt className="text-muted-foreground">Commission referrals</dt>
                      <dd className="font-medium tabular-nums">
                        {user.counts.commissionReferrals}
                      </dd>
                    </div>
                  )}
                  {user.counts.commissions != null && (
                    <div>
                      <dt className="text-muted-foreground">Commissions</dt>
                      <dd className="font-medium tabular-nums">{user.counts.commissions}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>

        <EditUserPermissionsCard user={user} accessToken={accessToken!} canEdit={canManageUsers} />

        {user.store && (
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="h-4 w-4" />
                Store
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-medium">
                {formatFullName(user.store.first_name, user.store.last_name) ||
                  user.store.email}
              </p>
              <p className="text-muted-foreground">{user.store.email}</p>
              {user.store.phone && (
                <p className="text-muted-foreground">{user.store.phone}</p>
              )}
              {user.store.address && (
                <p className="text-muted-foreground">{user.store.address}</p>
              )}
              {user.store.status && (
                <StatusBadge status={formatStatus(user.store.status)} />
              )}
              {user.store.description && (
                <p className="text-muted-foreground pt-2">{user.store.description}</p>
              )}
            </CardContent>
          </Card>
        )}

        {user.affiliate && (
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4" />
                Affiliate
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-medium">{user.affiliate.userName || user.affiliate.userEmail}</p>
              <p className="text-muted-foreground">{user.affiliate.userEmail}</p>
              <StatusBadge status={formatStatus(user.affiliate.status)} />
              {user.affiliate.requestedAt && (
                <p className="text-muted-foreground">
                  Requested {formatDateTime(user.affiliate.requestedAt)}
                </p>
              )}
              {user.affiliate.reviewedAt && (
                <p className="text-muted-foreground">
                  Reviewed {formatDateTime(user.affiliate.reviewedAt)}
                </p>
              )}
              {user.affiliate.notes && (
                <p className="text-muted-foreground">{user.affiliate.notes}</p>
              )}
            </CardContent>
          </Card>
        )}

        {user.wallet && (
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Total earned</dt>
                  <dd className="font-medium tabular-nums">
                    {formatCurrency(user.wallet.total_earned)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Available for withdrawal</dt>
                  <dd className="font-medium tabular-nums">
                    {formatCurrency(user.wallet.available_for_withdrawal)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Total withdrawn</dt>
                  <dd className="font-medium tabular-nums">
                    {formatCurrency(user.wallet.total_withdrawn)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}

        {user.banks && user.banks.length > 0 && (
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Bank accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {user.banks.map((bank) => (
                  <li
                    key={bank.id}
                    className="rounded-lg border border-border p-4 text-sm"
                  >
                    <p className="font-medium">{bank.bankName}</p>
                    <p className="text-muted-foreground font-mono">
                      {bank.accountNumber} · {bank.accountName}
                    </p>
                    {bank.bankCode && (
                      <p className="text-xs text-muted-foreground">Code: {bank.bankCode}</p>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {user.allowedPartialPayment !== undefined && user.allowedPartialPayment > 0 && (
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Payment settings
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="text-muted-foreground">
                Allowed partial payment: {user.allowedPartialPayment}
              </p>
              {user.referralPercentage != null && (
                <p className="text-muted-foreground">
                  Referral percentage: {user.referralPercentage}%
                </p>
              )}
              {user.referralPaymentCount != null && (
                <p className="text-muted-foreground">
                  Referral payment count: {user.referralPaymentCount}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <EditUserModal
        open={editUserOpen}
        user={user}
        onClose={() => setEditUserOpen(false)}
        onSuccess={() => refetch()}
        accessToken={accessToken!}
      />
    </>
  );
}
