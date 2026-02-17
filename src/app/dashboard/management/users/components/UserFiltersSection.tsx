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
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.1 }}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Filter className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">Search & filters</h2>
      </div>

      <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
        <CardHeader className="p-6 pb-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[240px] max-w-xl">
                <Label className="sr-only">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search email, name, phone..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onApply()}
                    className="pl-9 h-10 rounded-lg border-input"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-36">
                  <Label className="sr-only">Status</Label>
                  <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value || "all"} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-44">
                  <Label className="sr-only">Sort by</Label>
                  <select
                    value={sortBy}
                    onChange={(e) => onSortByChange(e.target.value as UserManagementSortBy)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary/20"
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
                  className="flex h-10 w-28 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShowFiltersChange(!showFilters)}
                className="gap-2 rounded-lg h-9"
              >
                <SlidersHorizontal className="h-4 w-4" />
                More filters
              </Button>
              <Button size="sm" onClick={onApply} className="rounded-lg h-9">
                Apply
              </Button>
              <Button variant="ghost" size="sm" onClick={onClear} className="rounded-lg h-9">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 mt-4 border-t border-border">
                    <div className="space-y-1">
                      <Label className="text-xs">Email (contains)</Label>
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Role</Label>
                      <Input
                        placeholder="e.g. user, admin"
                        value={role}
                        onChange={(e) => onRoleChange(e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Created from</Label>
                      <Input
                        type="date"
                        value={fromCreatedAt}
                        onChange={(e) => onFromCreatedAtChange(e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Created to</Label>
                      <Input
                        type="date"
                        value={toCreatedAt}
                        onChange={(e) => onToCreatedAtChange(e.target.value)}
                        className="rounded-lg"
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
