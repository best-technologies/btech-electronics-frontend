"use client";

import { useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import type { StockProduct } from "@/lib/api";

interface DeleteStockModalProps {
  product: StockProduct | null;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export function DeleteStockModal({
  product,
  open,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteStockModalProps) {
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
      if (e.key === "Escape" && open && !isDeleting) onCancel();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, isDeleting, onCancel]);

  if (typeof document === "undefined") return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={!isDeleting ? onCancel : undefined}
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
              aria-labelledby="delete-stock-title"
              aria-describedby="delete-stock-description"
            >
              <div className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 id="delete-stock-title" className="text-lg font-semibold text-foreground">
                    Delete product?
                  </h2>
                  <p id="delete-stock-description" className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{product.name}</span>
                    {product.sku && (
                      <span className="ml-1 font-mono text-muted-foreground">({product.sku})</span>
                    )}
                    {" "}will be permanently removed. Product images will be deleted from storage and linked consignment items will be unlinked. This cannot be undone.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={onCancel}
                  disabled={isDeleting}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-end gap-2 px-6 pb-6">
                <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="gap-2"
                >
                  {isDeleting ? "Deleting…" : "Delete product"}
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
