"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { formatFullName, formatDate, formatStatus } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import type { UserManagementUserItem } from "@/lib/api";
import { Users, ArrowRight } from "lucide-react";

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

interface UserTableProps {
  items: UserManagementUserItem[];
  title?: string;
  /** Optional action (e.g. "View All" button) shown next to the title. */
  headerAction?: React.ReactNode;
}

export function UserTable({ items, title = "Users", headerAction }: UserTableProps) {
  return (
    <motion.section
      className="space-y-3 sm:space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.08 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:h-9 sm:w-9">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
          </span>
          <h2 className="text-xs font-semibold text-foreground sm:text-lg">{title}</h2>
        </div>
        {headerAction}
      </div>

      <div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm sm:rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] sm:text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Name</th>
                <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Email</th>
                <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Phone</th>
                <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Role</th>
                <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Status</th>
                <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Level</th>
                <th className="text-left font-medium px-2 py-1.5 text-muted-foreground sm:p-4">Created</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-border/60 transition-colors hover:bg-muted/30"
                >
                  <td className="px-2 py-1.5 font-medium sm:p-4">
                    {formatFullName(u.first_name, u.last_name) || "—"}
                  </td>
                  <td className="px-2 py-1.5 text-muted-foreground sm:p-4">{u.email}</td>
                  <td className="px-2 py-1.5 text-muted-foreground sm:p-4">{u.phone_number ?? "—"}</td>
                  <td className="px-2 py-1.5 sm:p-4">
                    <span className="inline-flex rounded-md bg-muted/80 px-1.5 py-px text-[9px] font-medium text-muted-foreground sm:px-2 sm:py-0.5 sm:text-xs">
                      {formatStatus(u.role)}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 sm:p-4">
                    <StatusBadge status={formatStatus(u.status)} />
                  </td>
                  <td className="px-2 py-1.5 text-muted-foreground sm:p-4">
                    {formatStatus(u.level)}
                  </td>
                  <td className="px-2 py-1.5 text-muted-foreground sm:p-4">{formatDate(u.createdAt)}</td>
                  <td className="px-2 py-1.5 sm:p-4">
                    <Link
                      href={`/dashboard/management/users/${u.id}`}
                      className="inline-flex text-primary hover:text-primary/80"
                      aria-label="View user"
                    >
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.section>
  );
}
