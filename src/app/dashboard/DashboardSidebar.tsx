"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Package,
  FileText,
  CreditCard,
  User,
  LogOut,
  ChevronRight,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

const MAIN_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/stocks", label: "Stocks", icon: Boxes },
  { href: "/dashboard/consignment", label: "Consignment", icon: Package },
  { href: "/dashboard/invoice", label: "Invoice", icon: FileText },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
] as const;

const MANAGEMENT_NAV = { href: "/dashboard/management", label: "Management", icon: Settings } as const;

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const role = useAuthStore((s) => s.role);
  const isWarehouseAdmin = role === "admin";

  function handleLogout() {
    clearAuth();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col border-r border-border bg-card shadow-sm">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-foreground transition-opacity hover:opacity-90"
        >
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
            <Image
              src="/btech-logo.jpg"
              alt="Best Technologies"
              fill
              className="object-contain"
              sizes="36px"
            />
          </span>
          <span className="text-base">Dashboard</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Main
        </p>
        {MAIN_NAV.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 opacity-0 transition-opacity",
                  isActive ? "opacity-100" : "group-hover:opacity-50"
                )}
              />
            </Link>
          );
        })}
        {isWarehouseAdmin && (
          <>
            <p className="mb-2 mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </p>
            <Link
              href={MANAGEMENT_NAV.href}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                pathname === MANAGEMENT_NAV.href || pathname.startsWith(MANAGEMENT_NAV.href + "/")
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                <MANAGEMENT_NAV.icon className="h-4 w-4 shrink-0" />
                {MANAGEMENT_NAV.label}
              </span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 opacity-0 transition-opacity",
                  pathname === MANAGEMENT_NAV.href || pathname.startsWith(MANAGEMENT_NAV.href + "/")
                    ? "opacity-100"
                    : "group-hover:opacity-50"
                )}
              />
            </Link>
          </>
        )}
      </nav>
      <div className="border-t border-border p-3 space-y-0.5">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Account
        </p>
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <User className="h-4 w-4 shrink-0" />
          Profile
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
