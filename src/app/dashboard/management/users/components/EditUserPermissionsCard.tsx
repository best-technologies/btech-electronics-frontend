"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, Pencil, X } from "lucide-react";
import { useQuery } from "@/hooks/useQuery";
import { useMutation } from "@/hooks/useMutation";
import { userManagementApi, type PermissionOption, type UserManagementDetail } from "@/lib/api";
import { formatStatus } from "@/lib/utils";

const PERMISSIONS_QUERY_KEY = "user-management-permissions";

function groupByCategory(permissions: PermissionOption[]): Record<string, PermissionOption[]> {
  const map: Record<string, PermissionOption[]> = {};
  for (const p of permissions) {
    const cat = p.category ?? "Other";
    if (!map[cat]) map[cat] = [];
    map[cat].push(p);
  }
  return map;
}

interface EditUserPermissionsCardProps {
  user: UserManagementDetail;
  accessToken: string;
  onUserUpdated?: (updated: UserManagementDetail) => void;
  /** When false, Edit permissions is disabled (manage user permission required). */
  canEdit?: boolean;
}

export function EditUserPermissionsCard({
  user,
  accessToken,
  onUserUpdated,
  canEdit = true,
}: EditUserPermissionsCardProps) {
  const [editing, setEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    return new Set((user.permissions ?? []).map((p) => p.id));
  });

  const { data: allPermissions, isLoading: loadingPermissions } = useQuery({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: () => userManagementApi.getPermissions(accessToken),
    enabled: !!accessToken && editing,
  });

  const updateMutation = useMutation({
    mutationFn: (permissionIds: string[]) =>
      userManagementApi.updateUserPermissions(accessToken, user.id, { permissionIds }),
    invalidateKeys: "user-management-detail",
    onSuccess: (updated) => {
      setEditing(false);
      if (updated) onUserUpdated?.(updated);
    },
  });

  useEffect(() => {
    setSelectedIds(new Set((user.permissions ?? []).map((p) => p.id)));
  }, [user.permissions, user.id]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (ids: string[], checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) ids.forEach((id) => next.add(id));
      else ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleSave = () => {
    updateMutation.mutateAsync(Array.from(selectedIds));
  };

  const handleCancel = () => {
    setSelectedIds(new Set((user.permissions ?? []).map((p) => p.id)));
    setEditing(false);
  };

  const currentUserIds = new Set((user.permissions ?? []).map((p) => p.id));
  const hasChanges =
    selectedIds.size !== currentUserIds.size ||
    Array.from(selectedIds).some((id) => !currentUserIds.has(id)) ||
    Array.from(currentUserIds).some((id) => !selectedIds.has(id));

  const categorized =
    allPermissions?.categorized && Object.keys(allPermissions.categorized).length > 0
      ? allPermissions.categorized
      : allPermissions?.permissions
        ? groupByCategory(allPermissions.permissions)
        : {};

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissions
          </CardTitle>
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setEditing(true)}
              disabled={!canEdit}
              title={!canEdit ? "Manage user permission required" : undefined}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit permissions
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={handleSave}
                disabled={!hasChanges || updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!editing ? (
          <>
            {user.permissions && user.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {p.displayName || p.name}
                    {p.category ? ` (${formatStatus(p.category)})` : ""}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No permissions assigned.</p>
            )}
            {(user.legacyPermissions?.length ?? 0) > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Legacy permissions
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.legacyPermissions?.map((name) => (
                    <span
                      key={name}
                      className="inline-flex rounded-md bg-muted/80 px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            {loadingPermissions ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading permissions…
              </div>
            ) : Object.keys(categorized).length === 0 ? (
              <p className="text-sm text-muted-foreground">No permissions available to assign.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(categorized).map(([category, perms]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={perms.every((p) => selectedIds.has(p.id))}
                        onChange={(e) => handleSelectAll(perms.map((p) => p.id), e.target.checked)}
                        className="h-4 w-4 rounded border-input"
                      />
                      <span className="text-sm font-medium text-foreground capitalize">
                        {formatStatus(category)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                      {perms.map((p) => (
                        <label
                          key={p.id}
                          className="flex items-start gap-2 text-sm cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={() => handleToggle(p.id)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-input"
                          />
                          <span>
                            <span className="text-foreground font-medium">
                              {p.displayName || p.name}
                            </span>
                            {p.description ? (
                              <span className="block text-muted-foreground text-xs mt-0.5">
                                {p.description}
                              </span>
                            ) : null}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {updateMutation.isError && (
              <p className="text-sm text-destructive">
                {updateMutation.error?.message ?? "Failed to update permissions."}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
