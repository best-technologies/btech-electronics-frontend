"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore, selectHasManageConsignment, selectHasManageStock } from "@/stores/authStore";
import {
  consignmentApi,
  type ConsignmentDetail,
  type ConsignmentItem,
  type ConsignmentStatus,
  type AddConsignmentItemPayload,
  type UpdateConsignmentItemPayload,
  type StockSearchItem,
} from "@/lib/api";
import { ProductSearchSelect } from "@/components/ProductSearchSelect";
import { useQuery } from "@/hooks/useQuery";
import { useMutation } from "@/hooks/useMutation";
import { formatDate, formatStatus, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";

const emptyAddItem: AddConsignmentItemPayload = {
  productName: "",
  cartons: 0,
  quantity: 0,
  unitPrice: 0,
  unit: "pieces",
};

const STATUS_OPTIONS: { value: ConsignmentStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "received", label: "Received (delivered)" },
  { value: "inspected", label: "Inspected" },
  { value: "available", label: "Available" },
  { value: "partial_out", label: "Partial out" },
  { value: "closed", label: "Closed" },
];

export default function ConsignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const accessToken = useAuthStore((s) => s.accessToken);
  const canManageConsignment = useAuthStore(selectHasManageConsignment);
  const canManageStock = useAuthStore(selectHasManageStock);

  const [addForm, setAddForm] = useState<AddConsignmentItemPayload>(emptyAddItem);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateConsignmentItemPayload>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ConsignmentStatus | null>(null);
  const [addFormSelectedProduct, setAddFormSelectedProduct] = useState<StockSearchItem | null>(null);

  const queryKey = `consignment-${id}`;
  const { data: consignment, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => consignmentApi.getById(accessToken!, id),
    enabled: !!accessToken && !!id,
  });

  const addItemMutation = useMutation({
    mutationFn: (payload: AddConsignmentItemPayload) =>
      consignmentApi.addItem(accessToken!, id, payload),
    invalidateKeys: "consignment",
    onSuccess: () => {
      setAddForm(emptyAddItem);
      setAddFormSelectedProduct(null);
      refetch();
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: UpdateConsignmentItemPayload }) =>
      consignmentApi.updateItem(accessToken!, id, itemId, payload),
    invalidateKeys: "consignment",
    onSuccess: () => {
      setEditingItemId(null);
      setEditForm({});
      refetch();
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => consignmentApi.deleteItem(accessToken!, id, itemId),
    invalidateKeys: "consignment",
    onSuccess: () => {
      setDeleteConfirmId(null);
      refetch();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: ConsignmentStatus) => consignmentApi.updateStatus(accessToken!, id, status),
    invalidateKeys: "consignment",
    onSuccess: () => {
      setStatusConfirmOpen(false);
      setPendingStatus(null);
      refetch();
    },
  });

  const startEdit = useCallback((item: ConsignmentItem) => {
    setEditingItemId(item.id);
    setEditForm({
      productName: item.productName,
      cartons: item.cartons,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      unit: item.unit,
      sku: item.sku ?? undefined,
      description: item.description ?? undefined,
      brand: item.brand ?? undefined,
      model: item.model ?? undefined,
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingItemId(null);
    setEditForm({});
  }, []);

  const handleStatusChange = useCallback(
    (newStatus: ConsignmentStatus, currentStatus: ConsignmentStatus) => {
      if (newStatus === currentStatus) return;
      if (newStatus === "received" && currentStatus === "pending") {
        setPendingStatus("received");
        setStatusConfirmOpen(true);
        return;
      }
      updateStatusMutation.mutate(newStatus);
    },
    [updateStatusMutation]
  );

  const confirmStatusToReceived = useCallback(() => {
    if (pendingStatus === "received") {
      updateStatusMutation.mutate("received");
    }
  }, [pendingStatus, updateStatusMutation]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.productName.trim() || addForm.quantity <= 0 || addForm.unitPrice < 0) return;
    addItemMutation.mutateAsync({
      ...addForm,
      productName: addForm.productName.trim(),
      cartons: Number(addForm.cartons),
      quantity: Number(addForm.quantity),
      unitPrice: Number(addForm.unitPrice),
      unit: addForm.unit?.trim() || "pieces",
      sku: addForm.sku?.trim() || undefined,
      description: addForm.description?.trim() || undefined,
      brand: addForm.brand?.trim() || undefined,
      model: addForm.model?.trim() || undefined,
      condition: addForm.condition?.trim() || undefined,
    });
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemId) return;
    const payload: UpdateConsignmentItemPayload = {};
    if (editForm.productName !== undefined) payload.productName = editForm.productName.trim();
    if (editForm.cartons !== undefined) payload.cartons = Number(editForm.cartons);
    if (editForm.quantity !== undefined) payload.quantity = Number(editForm.quantity);
    if (editForm.unitPrice !== undefined) payload.unitPrice = Number(editForm.unitPrice);
    if (editForm.unit !== undefined) payload.unit = editForm.unit;
    if (editForm.sku !== undefined) payload.sku = editForm.sku.trim() || undefined;
    if (editForm.description !== undefined) payload.description = editForm.description.trim() || undefined;
    if (editForm.brand !== undefined) payload.brand = editForm.brand.trim() || undefined;
    if (editForm.model !== undefined) payload.model = editForm.model.trim() || undefined;
    if (editForm.condition !== undefined) payload.condition = editForm.condition.trim() || undefined;
    updateItemMutation.mutateAsync({ itemId: editingItemId, payload });
  };

  useEffect(() => {
    if (consignment) document.title = `Consignment · ${(consignment as ConsignmentDetail).referenceNumber}`;
  }, [consignment]);

  if (!id) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Invalid consignment.</p>
        <Button variant="link" asChild><Link href="/dashboard/consignment">Back to list</Link></Button>
      </div>
    );
  }

  if (isLoading || !consignment) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading consignment…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-destructive">{error?.message ?? "Failed to load consignment."}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>Retry</Button>
        <Button variant="link" asChild className="ml-2"><Link href="/dashboard/consignment">Back to list</Link></Button>
      </div>
    );
  }

  const c = consignment as ConsignmentDetail;
  const items = c.items ?? [];

  return (
    <div className="p-6 max-w-5xl">
      <Link
        href="/dashboard/consignment"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Consignment
      </Link>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{c.referenceNumber} · {c.supplierName}</CardTitle>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="font-medium text-foreground">Status:</span>
              {canManageConsignment ? (
                <select
                  value={c.status}
                  onChange={(e) => handleStatusChange(e.target.value as ConsignmentStatus, c.status)}
                  disabled={updateStatusMutation.isPending}
                  className="rounded-md border border-input bg-background px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {(c.status === "pending"
                    ? STATUS_OPTIONS
                    : STATUS_OPTIONS.filter((o) => o.value !== "pending")
                  ).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                formatStatus(c.status)
              )}
            </span>
            <span>Delivery: {formatDate(c.deliveryDate)}</span>
            {c.overallTotalCartons != null && <span>Total cartons: {c.overallTotalCartons}</span>}
            {c.overallTotalQuantity != null && <span>Total qty: {c.overallTotalQuantity}</span>}
            {c.overallTotalCost != null && <span>Total cost: {formatCurrency(c.overallTotalCost)}</span>}
          </div>
        </CardHeader>
      </Card>

      {/* Warning when marking as received (delivered) — cannot be reverted */}
      {statusConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
          <Card className="w-full max-w-md border-amber-500/50 bg-card shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Mark as delivered?</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                You are about to set this consignment to <strong>Received (delivered)</strong>. This will update product stock and record the delivery. This action cannot be undone — once set to delivered, the status cannot be changed back to pending.
              </p>
            </CardHeader>
            <CardContent className="flex justify-end gap-2 pt-0">
              <Button
                variant="outline"
                onClick={() => { setStatusConfirmOpen(false); setPendingStatus(null); }}
                disabled={updateStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmStatusToReceived}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? "Updating…" : "Yes, mark as delivered"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-medium p-3">Product</th>
                  <th className="text-right font-medium p-3">Cartons</th>
                  <th className="text-right font-medium p-3">Qty</th>
                  <th className="text-left font-medium p-3">Unit</th>
                  <th className="text-right font-medium p-3">Wholesale Price</th>
                  <th className="text-right font-medium p-3">Total cost</th>
                  <th className="w-28 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    {editingItemId === item.id ? (
                      <>
                        <td colSpan={7} className="p-3 bg-muted/20">
                          <form onSubmit={handleUpdateItem} className="flex flex-wrap items-end gap-3">
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Product</Label>
                                <Input
                                  value={editForm.productName ?? ""}
                                  onChange={(e) => setEditForm((f) => ({ ...f, productName: e.target.value }))}
                                  className="h-8"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Cartons</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={editForm.cartons ?? ""}
                                  onChange={(e) => setEditForm((f) => ({ ...f, cartons: Number(e.target.value) || 0 }))}
                                  className="h-8"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Qty</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={editForm.quantity ?? ""}
                                  onChange={(e) => setEditForm((f) => ({ ...f, quantity: Number(e.target.value) || 0 }))}
                                  className="h-8"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Wholesale Price</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editForm.unitPrice ?? ""}
                                  onChange={(e) => setEditForm((f) => ({ ...f, unitPrice: Number(e.target.value) || 0 }))}
                                  className="h-8"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Unit</Label>
                                <Input
                                  value={editForm.unit ?? ""}
                                  onChange={(e) => setEditForm((f) => ({ ...f, unit: e.target.value }))}
                                  className="h-8"
                                />
                              </div>
                            </div>
                            <Button type="submit" size="sm" disabled={!canManageConsignment || updateItemMutation.isPending}>Save</Button>
                            <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                          </form>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3">{item.productName}</td>
                        <td className="p-3 text-right">{item.cartons}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3">{item.unit ?? "—"}</td>
                        <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="p-3 text-right">{formatCurrency(item.totalCost)}</td>
                        <td className="p-2">
                          {deleteConfirmId === item.id ? (
                            <span className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteItemMutation.mutateAsync(item.id)}
                                disabled={!canManageConsignment || deleteItemMutation.isPending}
                                title={!canManageConsignment ? "Manage consignment permission required" : undefined}
                              >
                                Confirm
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                            </span>
                          ) : canManageConsignment ? (
                            <span className="flex items-center gap-1">
                              <Button size="sm" variant="ghost" onClick={() => startEdit(item)} className="gap-1">
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteConfirmId(item.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {items.length === 0 && (
            <p className="p-4 text-muted-foreground text-sm border-t border-border">No items. Add one below.</p>
          )}
        </CardContent>
      </Card>

      {canManageConsignment && (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="add-product">Product *</Label>
                <ProductSearchSelect
                  accessToken={accessToken}
                  value={addForm.productName}
                  onSelect={(p) => {
                    setAddFormSelectedProduct(p);
                    setAddForm((f) => ({
                      ...f,
                      productName: p?.name ?? "",
                      sku: p?.sku ?? f.sku ?? "",
                      unit: p?.unit ?? f.unit ?? "pieces",
                      unitPrice: p?.costPrice ?? f.unitPrice ?? 0,
                    }));
                  }}
                  placeholder="Search by name or SKU…"
                  id="add-product"
                  addNewProductHref="/dashboard/stocks/new"
                  canAddNewProduct={canManageStock}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-cartons">Cartons *</Label>
                <Input
                  id="add-cartons"
                  type="number"
                  min={0}
                  value={addForm.cartons || ""}
                  onChange={(e) => setAddForm((f) => ({ ...f, cartons: Number(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-quantity">Quantity *</Label>
                <Input
                  id="add-quantity"
                  type="number"
                  min={1}
                  value={addForm.quantity || ""}
                  onChange={(e) => setAddForm((f) => ({ ...f, quantity: Number(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-unitPrice">Wholesale Price *</Label>
                <Input
                  id="add-unitPrice"
                  type="number"
                  step="0.01"
                  min={0}
                  value={addForm.unitPrice || ""}
                  onChange={(e) => setAddForm((f) => ({ ...f, unitPrice: Number(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-unit">Unit</Label>
                <Input
                  id="add-unit"
                  value={addForm.unit ?? "pieces"}
                  onChange={(e) => setAddForm((f) => ({ ...f, unit: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-sku">SKU</Label>
                <Input
                  id="add-sku"
                  value={addForm.sku ?? ""}
                  onChange={(e) => setAddForm((f) => ({ ...f, sku: e.target.value }))}
                />
              </div>
            </div>
            <Button type="submit" disabled={addItemMutation.isPending}>
              {addItemMutation.isPending ? "Adding…" : "Add item"}
            </Button>
            {addItemMutation.isError && (
              <p className="text-destructive text-sm">{addItemMutation.error?.message}</p>
            )}
          </form>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
