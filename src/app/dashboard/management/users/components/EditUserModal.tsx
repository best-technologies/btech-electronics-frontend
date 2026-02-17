"use client";

import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Pencil } from "lucide-react";
import { userManagementApi } from "@/lib/api";
import type { UserManagementDetail, UpdateUserPayload } from "@/lib/api";

const ROLES = [
  "super_admin",
  "admin",
  "inventory_manager",
  "shipment_manager",
  "marketer",
  "user",
] as const;

const STATUSES = ["active", "suspended", "inactive"] as const;

const LEVELS = ["bronze", "silver", "gold", "platinum", "vip"] as const;

interface EditUserModalProps {
  open: boolean;
  user: UserManagementDetail;
  onClose: () => void;
  onSuccess: () => void;
  accessToken: string;
}

function formatOption(value: string) {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function EditUserModal({
  open,
  user,
  onClose,
  onSuccess,
  accessToken,
}: EditUserModalProps) {
  const [first_name, setFirstName] = useState(user.first_name);
  const [last_name, setLastName] = useState(user.last_name);
  const [email, setEmail] = useState(user.email);
  const [phone_number, setPhoneNumber] = useState(user.phone_number ?? "");
  const [address, setAddress] = useState(user.address ?? "");
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status);
  const [level, setLevel] = useState(user.level);
  const [is_active, setIsActive] = useState(user.is_active);
  const [allowedPartialPayment, setAllowedPartialPayment] = useState(
    String(user.allowedPartialPayment ?? 0)
  );
  const [usertype, setUsertype] = useState(user.usertype ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setEmail(user.email);
      setPhoneNumber(user.phone_number ?? "");
      setAddress(user.address ?? "");
      setRole(user.role);
      setStatus(user.status);
      setLevel(user.level);
      setIsActive(user.is_active);
      setAllowedPartialPayment(String(user.allowedPartialPayment ?? 0));
      setUsertype(user.usertype ?? "");
      setError(null);
    }
  }, [open, user]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const payload: UpdateUserPayload = {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim().toLowerCase(),
        phone_number: phone_number.trim() || undefined,
        address: address.trim() || undefined,
        role: role || undefined,
        status: status || undefined,
        level: level || undefined,
        is_active,
        allowedPartialPayment: Number(allowedPartialPayment) || 0,
        usertype: usertype.trim() || undefined,
      };
      await userManagementApi.updateUser(accessToken, user.id, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === "undefined") return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && user && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={() => !isSubmitting && onClose()}
            aria-hidden
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto w-full max-w-lg max-h-[90vh] overflow-hidden rounded-xl border border-border bg-card shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-user-title"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
                <h2 id="edit-user-title" className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Pencil className="h-5 w-5" />
                  Edit user
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

              <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
                <div className="p-6 space-y-4 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-first_name">First name</Label>
                      <Input
                        id="edit-first_name"
                        value={first_name}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-last_name">Last name</Label>
                      <Input
                        id="edit-last_name"
                        value={last_name}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone_number">Phone</Label>
                    <Input
                      id="edit-phone_number"
                      value={phone_number}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">Address</Label>
                    <Input
                      id="edit-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-role">Role</Label>
                      <select
                        id="edit-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {formatOption(r)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <select
                        id="edit-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {formatOption(s)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-level">Level</Label>
                      <select
                        id="edit-level"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      >
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {formatOption(l)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-is_active"
                      checked={is_active}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="edit-is_active" className="font-normal cursor-pointer">
                      Account active
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-allowedPartialPayment">Allowed partial payment (%)</Label>
                      <Input
                        id="edit-allowedPartialPayment"
                        type="number"
                        min={0}
                        max={100}
                        value={allowedPartialPayment}
                        onChange={(e) => setAllowedPartialPayment(e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-usertype">User type</Label>
                      <Input
                        id="edit-usertype"
                        value={usertype}
                        onChange={(e) => setUsertype(e.target.value)}
                        placeholder="e.g. warehouse-admin"
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2 px-6 py-4 border-t border-border shrink-0">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
