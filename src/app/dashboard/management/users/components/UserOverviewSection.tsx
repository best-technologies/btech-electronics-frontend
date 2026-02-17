"use client";

import { motion } from "motion/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserManagementAnalysis } from "@/lib/api";
import {
  TrendingUp,
  Users,
  UserCheck,
  UserX,
  UserCog,
  Shield,
  Award,
} from "lucide-react";

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

interface UserOverviewSectionProps {
  analysis: UserManagementAnalysis;
}

const STAT_CARDS = [
  {
    key: "totalUsers",
    label: "Total users",
    value: (a: UserManagementAnalysis) => a.totalUsers,
    icon: Users,
    className: "bg-primary/10 text-primary",
  },
  {
    key: "activeUsers",
    label: "Active",
    value: (a: UserManagementAnalysis) => a.activeUsers,
    icon: UserCheck,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "suspendedUsers",
    label: "Suspended",
    value: (a: UserManagementAnalysis) => a.suspendedUsers,
    icon: UserX,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    key: "inactiveUsers",
    label: "Inactive",
    value: (a: UserManagementAnalysis) => a.inactiveUsers,
    icon: UserCog,
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
] as const;

export function UserOverviewSection({ analysis }: UserOverviewSectionProps) {
  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.05 }}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <TrendingUp className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">Overview</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((stat, i) => {
          const Icon = stat.icon;
          const value = stat.value(analysis);
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: 0.06 + i * 0.03 }}
            >
              <Card className="overflow-hidden border-border/60 bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20">
                <CardHeader className="p-5 pb-4">
                  <div className="flex flex-col gap-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.className}`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      {stat.label}
                    </CardTitle>
                    <span className="text-xl font-bold tabular-nums text-foreground">
                      {value}
                    </span>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {(Object.keys(analysis.byRole).length > 0 || Object.keys(analysis.byLevel).length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.2 }}
          className="rounded-xl border border-border overflow-hidden bg-card shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-border">
            {Object.keys(analysis.byRole).length > 0 && (
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    By role
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.byRole).map(([role, count]) => (
                    <span
                      key={role}
                      className="inline-flex items-center rounded-md bg-muted/80 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {role}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {Object.keys(analysis.byLevel).length > 0 && (
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    By level
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.byLevel).map(([level, count]) => (
                    <span
                      key={level}
                      className="inline-flex items-center rounded-md bg-muted/80 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {level}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
