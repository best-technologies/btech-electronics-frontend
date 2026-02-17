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
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.08 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Users className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
        {headerAction}
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left font-medium p-4 text-muted-foreground">Name</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Email</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Phone</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Role</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Status</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Level</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Created</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-border/60 transition-colors hover:bg-muted/30"
                >
                  <td className="p-4 font-medium">
                    {formatFullName(u.first_name, u.last_name) || "—"}
                  </td>
                  <td className="p-4 text-muted-foreground">{u.email}</td>
                  <td className="p-4 text-muted-foreground">{u.phone_number ?? "—"}</td>
                  <td className="p-4">
                    <span className="inline-flex rounded-md bg-muted/80 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {formatStatus(u.role)}
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={formatStatus(u.status)} />
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {formatStatus(u.level)}
                  </td>
                  <td className="p-4 text-muted-foreground">{formatDate(u.createdAt)}</td>
                  <td className="p-4">
                    <Link
                      href={`/dashboard/management/users/${u.id}`}
                      className="inline-flex text-primary hover:text-primary/80"
                      aria-label="View user"
                    >
                      <ArrowRight className="h-4 w-4" />
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
