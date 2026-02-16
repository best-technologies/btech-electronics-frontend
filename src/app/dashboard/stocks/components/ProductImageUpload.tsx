"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { validateStockImageFiles } from "@/lib/api";
import { Upload, X, ImageIcon } from "lucide-react";

const MAX_IMAGES = 10;
const MAX_SIZE_MB = 5;
const ACCEPT = "image/jpeg,image/jpg,image/png";

interface ProductImageUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  error?: string;
}

export function ProductImageUpload({
  files,
  onChange,
  disabled,
  error,
}: ProductImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const list = Array.from(newFiles);
      const combined = [...files, ...list];
      const { valid, errors } = validateStockImageFiles(combined.slice(0, MAX_IMAGES));
      setValidationErrors(errors);
      onChange(valid);
    },
    [files, onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected?.length) handleFiles(selected);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    onChange(next);
    setValidationErrors([]);
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled || files.length >= MAX_IMAGES) return;
    const dropped = e.dataTransfer.files;
    if (dropped.length) handleFiles(dropped);
  };

  const canAddMore = files.length < MAX_IMAGES;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Product images</Label>
      <p className="text-xs text-muted-foreground">
        Up to {MAX_IMAGES} images, {MAX_SIZE_MB}MB each. JPG or PNG.
      </p>

      {canAddMore && (
        <div
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={`relative rounded-xl border-2 border-dashed transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/20 hover:border-muted-foreground/30 hover:bg-muted/30"
          } ${disabled ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            onChange={handleInputChange}
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={disabled}
            aria-label="Upload product images"
          />
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {dragActive ? "Drop images here" : "Drag & drop images or click to browse"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {files.length > 0 ? `${files.length} selected` : "Up to 10 images"}
            </p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted/30"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => removeFile(index)}
                    disabled={disabled}
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-xs text-white truncate">
                  {file.name}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {validationErrors.length > 0 && (
        <ul className="text-sm text-destructive space-y-0.5">
          {validationErrors.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

/** Single product image thumbnail for display in tables/cards. */
export function ProductImageThumbnail({
  src,
  alt,
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return (
    <div
      className={`aspect-square rounded-lg overflow-hidden border border-border bg-muted/30 flex items-center justify-center ${className ?? "h-10 w-10"}`}
    >
      <img src={src} alt={alt ?? ""} className="h-full w-full object-cover" />
    </div>
  );
}

const PREVIEW_SIZE = 280;
const PREVIEW_OFFSET = 12;

/** Thumbnail that shows a larger image preview on hover (for tables). */
export function ProductImageThumbnailWithPreview({
  src,
  alt,
  productName,
  className,
}: {
  src: string;
  alt?: string;
  productName?: string;
  className?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<{ top: number; left: number } | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const spaceRight = viewportW - rect.right;
    const spaceLeft = rect.left;
    const placeRight = spaceRight >= PREVIEW_SIZE + PREVIEW_OFFSET || spaceRight >= spaceLeft;
    let left = placeRight ? rect.right + PREVIEW_OFFSET : rect.left - PREVIEW_OFFSET - PREVIEW_SIZE;
    let top = rect.top + rect.height / 2 - PREVIEW_SIZE / 2;
    left = Math.max(8, Math.min(left, viewportW - PREVIEW_SIZE - 8));
    top = Math.max(8, Math.min(top, viewportH - PREVIEW_SIZE - 8));
    setPreview({ top, left });
  }, []);

  const hide = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => setPreview(null), 120);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const previewEl =
    typeof document !== "undefined" && preview
      ? ReactDOM.createPortal(
          <AnimatePresence>
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              onMouseEnter={show}
              onMouseLeave={hide}
              className="fixed z-[100] rounded-xl border border-border bg-card shadow-2xl overflow-hidden pointer-events-auto"
              style={{
                width: PREVIEW_SIZE,
                height: PREVIEW_SIZE,
                top: preview.top,
                left: preview.left,
              }}
            >
              <img
                src={src}
                alt={alt ?? ""}
                className="h-full w-full object-contain bg-muted/20"
              />
              {productName && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/75 px-3 py-2 text-xs text-white truncate">
                  {productName}
                </div>
              )}
            </motion.div>
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      <div
        ref={wrapperRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        className="cursor-zoom-in inline-block rounded-lg ring-offset-2 ring-offset-background focus-within:ring-2 focus-within:ring-primary/50"
      >
        <ProductImageThumbnail src={src} alt={alt} className={className} />
      </div>
      {previewEl}
    </>
  );
}

/** Placeholder when no image. */
export function ProductImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`aspect-square rounded-lg border border-dashed border-border bg-muted/20 flex items-center justify-center text-muted-foreground ${className ?? "h-10 w-10"}`}
    >
      <ImageIcon className="h-4 w-4" />
    </div>
  );
}
