"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useAuthStore } from "@/stores/authStore";
import { stockApi, type StockProduct, type UpdateStockPayload } from "@/lib/api";
import { useMutation } from "@/hooks/useMutation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Boxes, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImageThumbnailWithPreview, ProductImagePlaceholder } from "./ProductImageUpload";
import { InlineEditableCell } from "./InlineEditableCell";
import { DeleteStockModal } from "./DeleteStockModal";

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

type EditableField = keyof UpdateStockPayload;

interface StockTableProps {
  items: StockProduct[];
}

export function StockTable({ items }: StockTableProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [editing, setEditing] = useState<{ productId: string; field: EditableField } | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<StockProduct | null>(null);

  const updateMutation = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: UpdateStockPayload }) =>
      stockApi.update(accessToken!, productId, payload),
    invalidateKeys: "stock",
    onSuccess: () => setEditing(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => stockApi.delete(accessToken!, productId),
    invalidateKeys: "stock",
    onSuccess: () => setDeleteConfirmProduct(null),
  });

  const handleDeleteClick = (row: StockProduct) => setDeleteConfirmProduct(row);
  const handleDeleteConfirm = () => {
    if (deleteConfirmProduct) deleteMutation.mutateAsync(deleteConfirmProduct.id);
  };

  const isEditing = (productId: string, field: EditableField) =>
    editing?.productId === productId && editing?.field === field;

  const handleSave = (productId: string, field: EditableField, value: string | number | boolean) => {
    updateMutation.mutateAsync({ productId, payload: { [field]: value } });
  };

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.08 }}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Boxes className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">Products</h2>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left font-medium p-4 text-muted-foreground w-16">Image</th>
                <th className="text-left font-medium p-4 text-muted-foreground">SKU</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Name</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Description</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Brand</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Model</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Category</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Unit</th>
                <th className="text-right font-medium p-4 text-muted-foreground">Current stock</th>
                <th className="text-right font-medium p-4 text-muted-foreground whitespace-nowrap">Cost price</th>
                <th className="text-right font-medium p-4 text-muted-foreground">Reorder level</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Warehouse location</th>
                <th className="text-left font-medium p-4 text-muted-foreground">Active</th>
                <th className="text-left font-medium p-4 text-muted-foreground whitespace-nowrap">Created</th>
                <th className="text-left font-medium p-4 text-muted-foreground whitespace-nowrap">Updated</th>
                <th className="w-12 p-4 text-right font-medium text-muted-foreground" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {items.map((row, index) => {
                const isOutOfStock = row.currentStock === 0;
                return (
                <motion.tr
                  key={row.id}
                  className={`border-t border-border/60 transition-colors hover:bg-muted/30 ${isOutOfStock ? "bg-destructive/10 hover:bg-destructive/15" : ""}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...transition, delay: index * 0.02 }}
                >
                  <td className="p-4">
                    {row.images?.length ? (
                      <ProductImageThumbnailWithPreview
                        src={row.images[0].secure_url}
                        alt={row.name}
                        productName={row.name}
                        className="h-10 w-10"
                      />
                    ) : (
                      <ProductImagePlaceholder className="h-10 w-10" />
                    )}
                  </td>
                  <InlineEditableCell
                    value={row.sku}
                    type="text"
                    productId={row.id}
                    field="sku"
                    isEditing={isEditing(row.id, "sku")}
                    onStartEdit={() => setEditing({ productId: row.id, field: "sku" })}
                    onSave={(v) => handleSave(row.id, "sku", v)}
                    onCancel={() => setEditing(null)}
                    disabled={updateMutation.isPending}
                    placeholder="SKU"
                    inputClassName="w-28 min-w-0 font-mono"
                  />
                  <InlineEditableCell
                    value={row.name}
                    type="text"
                    productId={row.id}
                    field="name"
                    isEditing={isEditing(row.id, "name")}
                    onStartEdit={() => setEditing({ productId: row.id, field: "name" })}
                    onSave={(v) => handleSave(row.id, "name", v)}
                    onCancel={() => setEditing(null)}
                    disabled={updateMutation.isPending}
                    placeholder="Name"
                    inputClassName="w-40 min-w-0"
                  />
                  <InlineEditableCell
                    value={row.description ?? ""}
                    type="text"
                    productId={row.id}
                    field="description"
                    isEditing={isEditing(row.id, "description")}
                    onStartEdit={() => setEditing({ productId: row.id, field: "description" })}
                    onSave={(v) => handleSave(row.id, "description", v)}
                    onCancel={() => setEditing(null)}
                    disabled={updateMutation.isPending}
                    placeholder="Description"
                    inputClassName="w-48 min-w-0 max-w-[200px]"
                  />
                  <InlineEditableCell
                    value={row.brand ?? ""}
                    type="text"
                    productId={row.id}
                    field="brand"
                    isEditing={isEditing(row.id, "brand")}
                    onStartEdit={() => setEditing({ productId: row.id, field: "brand" })}
                    onSave={(v) => handleSave(row.id, "brand", v)}
                    onCancel={() => setEditing(null)}
                    disabled={updateMutation.isPending}
                    placeholder="Brand"
                  />
                  <InlineEditableCell
                    value={row.model ?? ""}
                    type="text"
                    productId={row.id}
                    field="model"
                    isEditing={isEditing(row.id, "model")}
                    onStartEdit={() => setEditing({ productId: row.id, field: "model" })}
                    onSave={(v) => handleSave(row.id, "model", v)}
                    onCancel={() => setEditing(null)}
                    disabled={updateMutation.isPending}
                    placeholder="Model"
                  />
                  <InlineEditableCell
                    value={row.category ?? ""}
                    type="text"
                    productId={row.id}
                    field="category"
                    isEditing={isEditing(row.id, "category")}
                    onStartEdit={() => setEditing({ productId: row.id, field: "category" })}
                    onSave={(v) => handleSave(row.id, "category", v)}
                    onCancel={() => setEditing(null)}
                    disabled={updateMutation.isPending}
                    placeholder="Category"
                  />
                  <InlineEditableCell
                    value={row.unit}
                    type="text"
                    productId={row.id}
                    field="unit"
                    isEditing={isEditing(row.id, "unit")}
                    onStartEdit={() => setEditing({ productId: row.id, field: "unit" })}
                    onSave={(v) => handleSave(row.id, "unit", v)}
                    onCancel={() => setEditing(null)}
                    disabled={updateMutation.isPending}
                    placeholder="pieces"
                  />
                  <td className="p-4 text-right">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/20 px-2 py-1 text-destructive font-semibold tabular-nums">
                        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
                        0 — Out of stock
                      </span>
                    ) : (
                      <span className="tabular-nums font-medium">{row.currentStock}</span>
                    )}
                  </td>
                  <InlineEditableCell
                    value={row.costPrice ?? ""}
                    type="number"
                    productId={row.id}
                    field="costPrice"
                    isEditing={isEditing(row.id, "costPrice")}
                    onStartEdit={() => setEditing({ productId: row.id, field: "costPrice" })}
                    onSave={(v) => handleSave(row.id, "costPrice", v)}
                    onCancel={() => setEditing(null)}
                    disabled={updateMutation.isPending}
                    displayValue={row.costPrice != null ? formatCurrency(row.costPrice) : "—"}
                    align="right"
                    inputClassName="w-28 min-w-0 text-right"
                  />
                  <InlineEditableCell
                    value={row.reorderLevel ?? ""}
                    type="number"
                    productId={row.id}
                    field="reorderLevel"
                    isEditing={isEditing(row.id, "reorderLevel")}
                    onStartEdit={() => setEditing({ productId: row.id, field: "reorderLevel" })}
                    onSave={(v) => handleSave(row.id, "reorderLevel", v)}
                    onCancel={() => setEditing(null)}
                    disabled={updateMutation.isPending}
                    align="right"
                    inputClassName="w-24 min-w-0 text-right"
                  />
                  <InlineEditableCell
                    value={row.warehouseLocation ?? ""}
                    type="text"
                    productId={row.id}
                    field="warehouseLocation"
                    isEditing={isEditing(row.id, "warehouseLocation")}
                    onStartEdit={() => setEditing({ productId: row.id, field: "warehouseLocation" })}
                    onSave={(v) => handleSave(row.id, "warehouseLocation", v)}
                    onCancel={() => setEditing(null)}
                    disabled={updateMutation.isPending}
                    placeholder="Location"
                  />
                  <InlineEditableCell
                    value={row.isActive}
                    type="boolean"
                    productId={row.id}
                    field="isActive"
                    isEditing={isEditing(row.id, "isActive")}
                    onStartEdit={() => setEditing({ productId: row.id, field: "isActive" })}
                    onSave={(v) => handleSave(row.id, "isActive", v)}
                    onCancel={() => setEditing(null)}
                    disabled={updateMutation.isPending}
                  />
                  <td className="p-4 text-muted-foreground whitespace-nowrap">{formatDate(row.createdAt)}</td>
                  <td className="p-4 text-muted-foreground whitespace-nowrap">{formatDate(row.updatedAt)}</td>
                  <td className="p-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(row)}
                      disabled={deleteMutation.isPending}
                      aria-label={`Delete ${row.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </motion.tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteStockModal
        product={deleteConfirmProduct}
        open={deleteConfirmProduct != null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmProduct(null)}
        isDeleting={deleteMutation.isPending}
      />
    </motion.section>
  );
}
