"use client";

import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, UserPlus, Copy, Check } from "lucide-react";
import { authApi, type OnboardWarehouseAdminData } from "@/lib/api";

interface OnboardAdminModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accessToken: string;
}

export function OnboardAdminModal({
  open,
  onClose,
  onSuccess,
  accessToken,
}: OnboardAdminModalProps) {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OnboardWarehouseAdminData | null>(null);
  const [copied, setCopied] = useState(false);

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

  const reset = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setPassword("");
    setError(null);
    setResult(null);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const data = await authApi.onboardWarehouseAdmin(accessToken, {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim().toLowerCase(),
        ...(phone_number.trim() ? { phone_number: phone_number.trim() } : {}),
        ...(password.trim() ? { password: password.trim() } : {}),
      });
      if (data) {
        setResult(data);
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to onboard admin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPassword = () => {
    if (result?.temporaryPassword) {
      navigator.clipboard.writeText(result.temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (typeof document === "undefined") return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
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
              aria-labelledby="onboard-admin-title"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 id="onboard-admin-title" className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Onboard warehouse admin
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {result ? (
                <div className="p-6 space-y-4">
                  <p className="text-sm text-foreground">
                    Admin <span className="font-medium">{result.email}</span> was created successfully.
                  </p>
                  {result.temporaryPassword && (
                    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Temporary password
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded bg-background px-3 py-2 text-sm font-mono">
                          {result.temporaryPassword}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5 shrink-0"
                          onClick={copyPassword}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          {copied ? "Copied" : "Copy"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Share this with the admin. They should change it after first sign-in.
                      </p>
                    </div>
                  )}
                  {result.message && (
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  )}
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleClose}>Done</Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="onboard-first_name">First name</Label>
                      <Input
                        id="onboard-first_name"
                        value={first_name}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="John"
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="onboard-last_name">Last name</Label>
                      <Input
                        id="onboard-last_name"
                        value={last_name}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder="Doe"
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="onboard-email">Email</Label>
                    <Input
                      id="onboard-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@example.com"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="onboard-phone">Phone (optional)</Label>
                    <Input
                      id="onboard-phone"
                      value={phone_number}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+2348012345678"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="onboard-password">Password (optional)</Label>
                    <Input
                      id="onboard-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters. Leave blank for auto-generated."
                      className="rounded-lg"
                      minLength={6}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating…" : "Create admin"}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
