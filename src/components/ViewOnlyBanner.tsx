"use client";

import { Eye } from "lucide-react";

interface ViewOnlyBannerProps {
  /** Short area name, e.g. "stocks", "consignment", "invoices" */
  areaName: string;
}

const NO_PERMISSION_MESSAGE =
  "You have view-only access to this section. You cannot create, edit, or delete records. Contact an administrator if you need management permissions.";

export function ViewOnlyBanner({ areaName }: ViewOnlyBannerProps) {
  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
        <Eye className="h-4 w-4" />
      </span>
      <div>
        <p className="font-medium">
          View-only access — {areaName}
        </p>
        <p className="mt-0.5 text-muted-foreground">
          {NO_PERMISSION_MESSAGE}
        </p>
      </div>
    </div>
  );
}
