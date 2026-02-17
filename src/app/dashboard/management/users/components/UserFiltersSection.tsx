"use client";

import { motion, AnimatePresence } from "motion/react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, SlidersHorizontal, Filter } from "lucide-react";
import type { UserManagementSortBy } from "@/lib/api";

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

const SORT_OPTIONS: { value: UserManagementSortBy; label: string }[] = [
  { value: "createdAt", label: "Created" },
  { value: "email", label: "Email" },
  { value: "first_name", label: "First name" },
  { value: "last_name", label: "Last name" },
  { value: "role", label: "Role" },
  { value: "status", label: "Status" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "inactive", label: "Inactive" },
];

interface UserFiltersSectionProps {
  search: string;
  onSearchChange: (v: string) => void;
  email: string;
  onEmailChange: (v: string) => void;
  role: string;
  onRoleChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  fromCreatedAt: string;
  onFromCreatedAtChange: (v: string) => void;
  toCreatedAt: string;
  onToCreatedAtChange: (v: string) => void;
  sortBy: UserManagementSortBy;
  onSortByChange: (v: UserManagementSortBy) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (v: "asc" | "desc") => void;
  showFilters: boolean;
  onShowFiltersChange: (v: boolean) => void;
  onApply: () => void;
  onClear: () => void;
}

export function UserFiltersSection({
  search,
  onSearchChange,
  email,
  onEmailChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  fromCreatedAt,
  onFromCreatedAtChange,
  toCreatedAt,
  onToCreatedAtChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  showFilters,
  onShowFiltersChange,
  onApply,
  onClear,
}: UserFiltersSectionProps) {
  return (
    <motion.section
      className="space-y-3 sm:space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.1 }}
    >
      <div className="flex items-center gap-1.5 sm:gap-3">
        <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:h-9 sm:w-9">
          <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
        </span>
        <h2 className="text-xs font-semibold text-foreground sm:text-lg">Search & filters</h2>
      </div>

      <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
        <CardHeader className="p-2.5 pb-2 sm:p-6 sm:pb-5">
          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex flex-wrap items-end gap-2 sm:gap-4">
              <div className="flex-1 min-w-[180px] max-w-xl sm:min-w-[240px]">
                <Label className="sr-only">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground sm:left-3 sm:h-4 sm:w-4" />
                  <Input
                    placeholder="Search email, name, phone..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onApply()}
                    className="h-8 pl-7 text-[11px] rounded-md border-input sm:h-10 sm:pl-9 sm:rounded-lg sm:text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="w-28 sm:w-36">
                  <Label className="sr-only">Status</Label>
                  <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-[11px] shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary sm:h-10 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value || "all"} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-36 sm:w-44">
                  <Label className="sr-only">Sort by</Label>
                  <select
                    value={sortBy}
                    onChange={(e) => onSortByChange(e.target.value as UserManagementSortBy)}
                    className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-[11px] shadow-sm focus:ring-2 focus:ring-primary/20 sm:h-10 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <select
                  value={sortOrder}
                  onChange={(e) => onSortOrderChange(e.target.value as "asc" | "desc")}
                  className="flex h-8 w-20 rounded-md border border-input bg-background px-2.5 py-1.5 text-[11px] sm:h-10 sm:w-28 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShowFiltersChange(!showFilters)}
                className="h-7 gap-2 rounded-lg text-[11px] touch-manipulation sm:h-9 sm:text-sm"
              >
                <SlidersHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                More filters
              </Button>
              <Button size="sm" onClick={onApply} className="h-7 rounded-lg text-[11px] touch-manipulation sm:h-9 sm:text-sm">
                Apply
              </Button>
              <Button variant="ghost" size="sm" onClick={onClear} className="h-7 rounded-lg text-[11px] touch-manipulation sm:h-9 sm:text-sm">
                Clear
              </Button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={transition}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-2 pt-2 mt-2 border-t border-border sm:grid-cols-2 sm:gap-4 sm:pt-4 sm:mt-4 lg:grid-cols-4">
                    <div className="space-y-1">
                      <Label className="text-[9px] sm:text-xs">Email (contains)</Label>
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        className="h-8 rounded-md text-[11px] sm:h-10 sm:rounded-lg sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] sm:text-xs">Role</Label>
                      <Input
                        placeholder="e.g. user, admin"
                        value={role}
                        onChange={(e) => onRoleChange(e.target.value)}
                        className="h-8 rounded-md text-[11px] sm:h-10 sm:rounded-lg sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] sm:text-xs">Created from</Label>
                      <Input
                        type="date"
                        value={fromCreatedAt}
                        onChange={(e) => onFromCreatedAtChange(e.target.value)}
                        className="h-8 rounded-md text-[11px] sm:h-10 sm:rounded-lg sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] sm:text-xs">Created to</Label>
                      <Input
                        type="date"
                        value={toCreatedAt}
                        onChange={(e) => onToCreatedAtChange(e.target.value)}
                        className="h-8 rounded-md text-[11px] sm:h-10 sm:rounded-lg sm:text-sm"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardHeader>
      </Card>
    </motion.section>
  );
}
