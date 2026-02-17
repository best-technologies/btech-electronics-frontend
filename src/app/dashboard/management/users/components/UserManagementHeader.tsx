"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus } from "lucide-react";

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

interface UserManagementHeaderProps {
  onRefresh: () => void;
  onOnboardAdmin?: () => void;
  /** When false, Onboard admin is shown but disabled (manage user permission required). */
  canManageUsers?: boolean;
}

export function UserManagementHeader({ onRefresh, onOnboardAdmin, canManageUsers = true }: UserManagementHeaderProps) {
  return (
    <motion.div
      className="border-b border-border bg-card"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
    >
      <div className="w-full px-2.5 py-3 sm:px-6 lg:px-8 sm:py-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground sm:text-2xl">
              User management
            </h1>
            <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-sm">
              View and manage users, roles, and status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-7 gap-2 text-[11px] touch-manipulation sm:h-9 sm:text-sm"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              Refresh
            </Button>
            {onOnboardAdmin !== undefined && (
              <Button
                size="sm"
                className="h-7 gap-2 text-[11px] touch-manipulation sm:h-9 sm:text-sm"
                onClick={onOnboardAdmin}
                disabled={!canManageUsers}
                title={!canManageUsers ? "You don't have permission to perform this action. Contact an administrator if you need access." : undefined}
              >
                <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                Onboard admin
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
