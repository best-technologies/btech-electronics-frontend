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
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              User management
            </h1>
            <p className="mt-0.5 text-muted-foreground">
              View and manage users, roles, and status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            {onOnboardAdmin !== undefined && (
              <Button
                size="sm"
                className="gap-2"
                onClick={onOnboardAdmin}
                disabled={!canManageUsers}
                title={!canManageUsers ? "You don't have permission to perform this action. Contact an administrator if you need access." : undefined}
              >
                <UserPlus className="h-4 w-4" />
                Onboard admin
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
