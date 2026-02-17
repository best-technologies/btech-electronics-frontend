"use client";

import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import type { PermissionOption, CreatePermissionPayload } from "@/lib/api";

interface PermissionFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  permission?: PermissionOption | null;
  onClose: () => void;
  onSubmit: (payload: CreatePermissionPayload) => void;
  isSubmitting: boolean;
}

const emptyForm: CreatePermissionPayload = {
  name: "",
  displayName: "",
  category: "",
  description: "",
  isActive: true,
};

const PERMISSION_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "manage_users", label: "Manage Users" },
  { value: "manage_consignment", label: "Manage Consignment" },
  { value: "manage_invoices", label: "Manage Invoices" },
  { value: "all", label: "All (they can do all)" },
  { value: "manage_stocks", label: "Manage Stocks" },
  { value: "manage_payments", label: "Manage Payments" },
  { value: "manage_permissions", label: "Manage Permissions" },
];

export function PermissionFormModal({
  open,
  mode,
  permission,
  onClose,
  onSubmit,
  isSubmitting,
}: PermissionFormModalProps) {
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, isSubmitting, onClose]);

  if (typeof document === "undefined") return null;

  const initial = permission
    ? {
        name: permission.name,
        displayName: permission.displayName ?? permission.name,
        category: permission.category ?? "",
        description: permission.description ?? "",
        isActive: (permission as { isActive?: boolean }).isActive ?? true,
      }
    : emptyForm;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <PermissionFormModalContent
          mode={mode}
          initial={initial}
          onClose={onClose}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </AnimatePresence>,
    document.body
  );
}

function PermissionFormModalContent({
  mode,
  initial,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  mode: "create" | "edit";
  initial: CreatePermissionPayload;
  onClose: () => void;
  onSubmit: (payload: CreatePermissionPayload) => void;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState(initial.name);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [category, setCategory] = useState(initial.category);
  const [description, setDescription] = useState(initial.description ?? "");
  const [isActive, setIsActive] = useState(initial.isActive ?? true);

  useEffect(() => {
    setName(initial.name);
    setDisplayName(initial.displayName);
    setCategory(initial.category);
    setDescription(initial.description ?? "");
    setIsActive(initial.isActive ?? true);
  }, [initial.name, initial.displayName, initial.category, initial.description, initial.isActive]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      displayName: displayName.trim(),
      category: category.trim(),
      description: description.trim() || undefined,
      isActive,
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-auto w-full max-w-md rounded-xl border border-border bg-card shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="permission-form-title"
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 id="permission-form-title" className="text-lg font-semibold text-foreground">
              {mode === "create" ? "Create permission" : "Edit permission"}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="perm-name">Name</Label>
              <Input
                id="perm-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. manage warehouse"
                required
                disabled={mode === "edit"}
                className="rounded-lg"
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier (lowercase, spaces → underscores). Cannot change when editing.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="perm-displayName">Display name</Label>
              <Input
                id="perm-displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Manage Warehouse"
                required
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="perm-category">Category</Label>
              <select
                id="perm-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select category</option>
                {PERMISSION_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
                {mode === "edit" && category && !PERMISSION_CATEGORY_OPTIONS.some((o) => o.value === category) && (
                  <option value={category}>{category}</option>
                )}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="perm-description">Description (optional)</Label>
              <Input
                id="perm-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
                className="rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="perm-isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="perm-isActive" className="font-normal cursor-pointer">
                Active
              </Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : mode === "create" ? "Create" : "Save"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
