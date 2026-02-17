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
      className="space-y-3 sm:space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.05 }}
    >
      <div className="flex items-center gap-1.5 sm:gap-3">
        <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-9 sm:w-9">
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
        </span>
        <h2 className="text-xs font-semibold text-foreground sm:text-lg">Overview</h2>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-4">
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
                <CardHeader className="p-2 pb-2 sm:p-5 sm:pb-4">
                  <div className="flex flex-col gap-1.5 sm:gap-3">
                    <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-2 sm:text-sm">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${stat.className}`}
                      >
                        <Icon className="h-3 w-3 sm:h-5 sm:w-5" />
                      </span>
                      {stat.label}
                    </CardTitle>
                    <span className="text-sm font-bold tabular-nums text-foreground sm:text-xl">
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
          className="rounded-lg border border-border overflow-hidden bg-card shadow-sm sm:rounded-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-border">
            {Object.keys(analysis.byRole).length > 0 && (
              <div className="p-2 sm:p-5">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-3">
                  <Shield className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                    By role
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.byRole).map(([role, count]) => (
                    <span
                      key={role}
                      className="inline-flex items-center rounded-md bg-muted/80 px-1.5 py-px text-[9px] font-medium text-muted-foreground sm:px-2.5 sm:py-1 sm:text-xs"
                    >
                      {role}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {Object.keys(analysis.byLevel).length > 0 && (
              <div className="p-2 sm:p-5">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-3">
                  <Award className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                    By level
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.byLevel).map(([level, count]) => (
                    <span
                      key={level}
                      className="inline-flex items-center rounded-md bg-muted/80 px-1.5 py-px text-[9px] font-medium text-muted-foreground sm:px-2.5 sm:py-1 sm:text-xs"
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
