"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { userManagementApi } from "@/lib/api";
import { useQuery } from "@/hooks/useQuery";
import { useMutation } from "@/hooks/useMutation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PermissionFormModal, DeletePermissionModal } from "./components";
import {
  ArrowLeft,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { PermissionOption, CreatePermissionPayload, UpdatePermissionPayload } from "@/lib/api";
import { formatStatus } from "@/lib/utils";

const PERMISSIONS_QUERY_KEY = "user-management-permissions";

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="h-10 w-48 rounded-lg bg-muted animate-pulse" />
      <div className="h-64 rounded-xl bg-muted/60 animate-pulse" />
    </div>
  );
}

export default function PermissionsManagementPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [permissionToEdit, setPermissionToEdit] = useState<PermissionOption | null>(null);
  const [permissionToDelete, setPermissionToDelete] = useState<PermissionOption | null>(null);

  const {
    data: permissionsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: () => userManagementApi.getPermissions(accessToken!),
    enabled: !!accessToken && role === "admin",
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePermissionPayload) =>
      userManagementApi.createPermission(accessToken!, payload),
    invalidateKeys: PERMISSIONS_QUERY_KEY,
    onSuccess: () => setFormOpen(false),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      permissionId,
      payload,
    }: { permissionId: string; payload: UpdatePermissionPayload }) =>
      userManagementApi.updatePermission(accessToken!, permissionId, payload),
    invalidateKeys: PERMISSIONS_QUERY_KEY,
    onSuccess: () => {
      setFormOpen(false);
      setPermissionToEdit(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (permissionId: string) =>
      userManagementApi.deletePermission(accessToken!, permissionId),
    invalidateKeys: PERMISSIONS_QUERY_KEY,
    onSuccess: () => setPermissionToDelete(null),
  });

  useEffect(() => {
    document.title = "Permissions | BTech-Electronics";
  }, []);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
    }
  }, [role, router]);

  const openCreate = () => {
    setPermissionToEdit(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEdit = (p: PermissionOption) => {
    setPermissionToEdit(p);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleFormSubmit = (payload: CreatePermissionPayload) => {
    if (formMode === "create") {
      createMutation.mutateAsync(payload);
    } else if (permissionToEdit) {
      updateMutation.mutateAsync({
        permissionId: permissionToEdit.id,
        payload: {
          displayName: payload.displayName,
          category: payload.category,
          description: payload.description,
          isActive: payload.isActive,
        },
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (role !== "admin") {
    return null;
  }

  const permissions = permissionsData?.permissions ?? [];

  if (isLoading && !permissionsData) {
    return (
      <>
        <div className="border-b border-border bg-card/50">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="h-8 w-48 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <LoadingSkeleton />
      </>
    );
  }

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link href="/dashboard/management">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Permissions
                </h1>
                <p className="mt-0.5 text-muted-foreground">
                  Create, edit, and delete permission definitions. Assign them to users in User management.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button size="sm" className="gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Create permission
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        {isError && (
          <Card className="border-destructive/30 bg-destructive/5 mb-6">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">
                {error?.message ?? "Failed to load permissions."}
              </p>
              <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/60">
          <CardContent className="p-0">
            {permissions.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <p className="text-sm font-medium text-foreground">No permissions yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a permission to assign to users.
                </p>
                <Button size="sm" className="mt-4 gap-2" onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Create permission
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left font-medium p-4 text-muted-foreground">Name</th>
                      <th className="text-left font-medium p-4 text-muted-foreground">Display name</th>
                      <th className="text-left font-medium p-4 text-muted-foreground">Category</th>
                      <th className="text-left font-medium p-4 text-muted-foreground">Description</th>
                      <th className="text-right font-medium p-4 text-muted-foreground w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-border/60 transition-colors hover:bg-muted/30"
                      >
                        <td className="p-4 font-mono text-foreground">{p.name}</td>
                        <td className="p-4 font-medium text-foreground">
                          {p.displayName || p.name}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {p.category ? formatStatus(p.category) : "—"}
                        </td>
                        <td className="p-4 text-muted-foreground max-w-xs truncate">
                          {p.description ?? "—"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => openEdit(p)}
                              aria-label="Edit permission"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => setPermissionToDelete(p)}
                              aria-label="Delete permission"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PermissionFormModal
        open={formOpen}
        mode={formMode}
        permission={formMode === "edit" ? permissionToEdit : null}
        onClose={() => {
          setFormOpen(false);
          setPermissionToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <DeletePermissionModal
        permission={permissionToDelete}
        open={!!permissionToDelete}
        onConfirm={() => {
          if (permissionToDelete) {
            deleteMutation.mutateAsync(permissionToDelete.id);
          }
        }}
        onCancel={() => setPermissionToDelete(null)}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
