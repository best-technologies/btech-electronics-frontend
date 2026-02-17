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
  Users,
  LogOut,
  ChevronRight,
  ShieldCheck,
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

const MANAGEMENT_NAV = [
  { href: "/dashboard/management/users", label: "User management", icon: Users },
  { href: "/dashboard/management/permissions", label: "Permissions", icon: ShieldCheck },
] as const;

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
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
    <aside className="flex h-full min-h-0 w-full shrink-0 flex-col border-r border-border bg-card shadow-sm">
      <div className="hidden h-16 items-center border-b border-border px-5 lg:flex">
        <Link
          href="/dashboard"
          onClick={onNavigate}
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
      {/* Mobile: small top spacer (mobile top bar already shows the logo) */}
      <div className="h-3 lg:hidden" />
      <nav className="flex-1 space-y-px overflow-y-auto p-2 sm:space-y-0.5 sm:p-3">
        <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:mb-2 sm:px-3 sm:text-xs">
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
              onClick={onNavigate}
              className={cn(
                "group flex items-center justify-between rounded-md px-2.5 py-2 text-xs font-medium transition-all duration-200 touch-manipulation sm:rounded-lg sm:px-3 sm:py-2.5 sm:text-sm",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2.5 sm:gap-3">
                <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                {item.label}
              </span>
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity sm:h-4 sm:w-4",
                  isActive ? "opacity-100" : "group-hover:opacity-50"
                )}
              />
            </Link>
          );
        })}
        {isWarehouseAdmin && (
          <>
            <p className="mb-1.5 mt-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:mb-2 sm:mt-4 sm:px-3 sm:text-xs">
              Admin
            </p>
            {MANAGEMENT_NAV.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center justify-between rounded-md px-2.5 py-2 text-xs font-medium transition-all duration-200 touch-manipulation sm:rounded-lg sm:px-3 sm:py-2.5 sm:text-sm",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2.5 sm:gap-3">
                    <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                    {item.label}
                  </span>
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity sm:h-4 sm:w-4",
                      isActive ? "opacity-100" : "group-hover:opacity-50"
                    )}
                  />
                </Link>
              );
            })}
          </>
        )}
      </nav>
      <div className="border-t border-border p-2 space-y-px sm:p-3 sm:space-y-0.5">
        <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:mb-2 sm:px-3 sm:text-xs">
          Account
        </p>
        <Link
          href="/profile"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground touch-manipulation sm:gap-3 sm:rounded-lg sm:px-3 sm:py-2.5 sm:text-sm"
        >
          <User className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          Profile
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive touch-manipulation sm:gap-3 sm:rounded-lg sm:px-3 sm:py-2.5 sm:text-sm"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
