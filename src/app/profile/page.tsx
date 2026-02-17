"use client";

import Link from "next/link";
import { useAuthStore, selectHasHydrated } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  formatFullName,
  formatRole,
  formatStatus,
  formatWords,
  formatDate,
  formatCurrency,
} from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImagePlaceholder } from "@/landing-page/components/ImagePlaceholder";

export default function ProfilePage() {
  const router = useRouter();
  const userProfile = useAuthStore((s) => s.userProfile);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore(selectHasHydrated);

  useEffect(() => {
    document.title = "Profile";
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken) {
      router.replace("/");
    }
  }, [hasHydrated, accessToken, router]);

  if (!hasHydrated || !accessToken) return null;

  const fullName = formatFullName(
    userProfile?.first_name,
    userProfile?.last_name
  ).trim();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1000px] mx-auto px-6 py-10 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          ← Back to home
        </Link>

        {userProfile ? (
          <div className="space-y-8">
            {/* Profile header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-border">
              <div className="shrink-0">
                {userProfile.profile_picture ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={userProfile.profile_picture}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <ImagePlaceholder
                    aspectRatio="square"
                    label="Photo"
                    className="rounded-full w-24 h-24 shrink-0"
                  />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-foreground truncate">
                  {fullName || "Profile"}
                </h1>
                <p className="text-muted-foreground mt-0.5">
                  {userProfile.email?.toLowerCase()}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {formatRole(userProfile.role)}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${
                      userProfile.status === "active"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {formatStatus(userProfile.status)}
                  </span>
                  {userProfile.is_affiliate && (
                    <span className="inline-flex items-center rounded-md bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                      Affiliate
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Account details */}
            <Card>
              <CardHeader>
                <CardTitle>Account details</CardTitle>
                <CardDescription>
                  Your account information from the profile API.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Name
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {fullName || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Email
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {userProfile.email?.toLowerCase() ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Phone
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {userProfile.phone_number?.trim() || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Role
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {formatRole(userProfile.role)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Status
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {formatStatus(userProfile.status)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Joined
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {formatDate(userProfile.joined_date)}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Address
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {userProfile.address?.trim()
                        ? formatWords(userProfile.address)
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      User ID
                    </dt>
                    <dd className="mt-1 font-mono text-sm text-foreground">
                      {userProfile.id}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
                <CardDescription>
                  Order and cart summary.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total orders
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {userProfile.stats?.totalOrders ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Cart items
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {userProfile.stats?.totalCartItems ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            {userProfile.permissions?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Permissions</CardTitle>
                  <CardDescription>
                    Your assigned permissions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-wrap gap-2">
                    {userProfile.permissions.map((p) => (
                      <li
                        key={p}
                        className="rounded-md bg-muted px-3 py-1.5 text-sm text-foreground"
                      >
                        {formatWords(p)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Affiliate section */}
            {userProfile.is_affiliate && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Affiliate</CardTitle>
                    <CardDescription>
                      Affiliate status and performance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Affiliate status
                      </dt>
                      <dd className="mt-1 text-foreground">
                        {formatWords(userProfile.affiliate_status || "—")}
                      </dd>
                    </div>
                  </CardContent>
                </Card>

                {/* Promoted products */}
                {userProfile.promoted_products?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Promoted products</CardTitle>
                      <CardDescription>
                        Products you promote as an affiliate.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto -mx-1">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                                Product
                              </th>
                              <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                                Sales
                              </th>
                              <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                                Earning / sale
                              </th>
                              <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                                All-time earning
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {userProfile.promoted_products.map((product) => (
                              <tr
                                key={product.affiliate_link}
                                className="border-b border-border/50"
                              >
                                <td className="py-3 px-2">
                                  <span className="font-medium text-foreground">
                                    {product.product_name || "—"}
                                  </span>
                                </td>
                                <td className="text-right py-3 px-2">
                                  {product.sales ?? 0}
                                </td>
                                <td className="text-right py-3 px-2">
                                  {formatCurrency(product.earning_per_sale ?? 0)}
                                </td>
                                <td className="text-right py-3 px-2">
                                  {formatCurrency(product.all_time_earning ?? 0)}
                                </td>
                                <td className="py-3 px-2">
                                  {formatWords(product.status || "—")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Commission payouts */}
                {userProfile.commission_payouts?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Commission payouts</CardTitle>
                      <CardDescription>
                        Your commission payout history.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto -mx-1">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                                Reference
                              </th>
                              <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                                Amount
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                                Method
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                                Status
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                                Requested
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                                Paid
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {userProfile.commission_payouts.map((payout) => (
                              <tr
                                key={payout.payout_id}
                                className="border-b border-border/50"
                              >
                                <td className="py-3 px-2 font-mono text-foreground">
                                  {payout.reference || payout.payout_id}
                                </td>
                                <td className="text-right py-3 px-2">
                                  {formatCurrency(payout.amount ?? 0)}
                                </td>
                                <td className="py-3 px-2">
                                  {formatWords(payout.method || "—")}
                                </td>
                                <td className="py-3 px-2">
                                  {formatWords(payout.status || "—")}
                                </td>
                                <td className="py-3 px-2 text-muted-foreground">
                                  {formatDate(payout.requestedAt)}
                                </td>
                                <td className="py-3 px-2 text-muted-foreground">
                                  {payout.paidAt
                                    ? formatDate(payout.paidAt)
                                    : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Loading profile… (fetched after sign-in or on app load)
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
