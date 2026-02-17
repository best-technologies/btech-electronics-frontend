"use client";

import { useState, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Link from "next/link";
import { stockApi, type StockSearchItem } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, Loader2, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 1;

export interface ProductSearchSelectProps {
  accessToken: string | null;
  value: string;
  onSelect: (product: StockSearchItem | null) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  /** When set, show an "Add new product" button in the empty state that links to this path (e.g. /dashboard/stocks/new). */
  addNewProductHref?: string;
  /** When false (and addNewProductHref is set), the "Add new product" button is disabled with a permission message. Default true. */
  canAddNewProduct?: boolean;
}

export function ProductSearchSelect({
  accessToken,
  value,
  onSelect,
  placeholder = "Search products by name or SKU…",
  id,
  className,
  disabled = false,
  addNewProductHref,
  canAddNewProduct = true,
}: ProductSearchSelectProps) {
  const [query, setQuery] = useState(value);
  const [selectedProduct, setSelectedProduct] = useState<StockSearchItem | null>(null);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<StockSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [imagePreviewIndex, setImagePreviewIndex] = useState(0);
  const imagePreviewShowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imagePreviewHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync input with controlled value when parent sets it (e.g. after selection or clear)
  useEffect(() => {
    setQuery(value);
    if (!value.trim()) setSelectedProduct(null);
  }, [value]);

  const runSearch = useCallback(
    async (term: string) => {
      if (!accessToken) {
        setResults([]);
        setLoading(false);
        return;
      }
      const trimmed = term.trim();
      if (trimmed.length < MIN_QUERY_LENGTH) {
        setResults([]);
        setOpen(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await stockApi.search(accessToken, trimmed, { images: true });
        setResults(data ?? []);
        setOpen(true);
        setHighlightedIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  // Debounced search when query changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setOpen(true); // show dropdown with "Searching…" while loading
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      runSearch(query);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  // Click outside to close (dropdown may be portaled so check both container and dropdown)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard: ArrowDown, ArrowUp, Enter, Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Escape") setOpen(true);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      setHighlightedIndex(-1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i < results.length - 1 ? i + 1 : i));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i > 0 ? i - 1 : -1));
      return;
    }
    if (e.key === "Enter" && highlightedIndex >= 0 && results[highlightedIndex]) {
      e.preventDefault();
      onSelect(results[highlightedIndex]);
      setQuery(results[highlightedIndex].name);
      setOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[highlightedIndex] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  const handleSelect = (product: StockSearchItem) => {
    setSelectedProduct(product);
    onSelect(product);
    setQuery(product.name);
    setOpen(false);
    setHighlightedIndex(-1);
  };

  const trimmed = query.trim();
  const showDropdown = open && (results.length > 0 || loading || (trimmed.length >= MIN_QUERY_LENGTH && !loading));

  // Position dropdown (for portal) so it isn't clipped by overflow parents; fixed = viewport coords
  const updateDropdownPosition = useCallback(() => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    return { top: rect.bottom, left: rect.left, width: rect.width };
  }, []);

  useLayoutEffect(() => {
    if (!showDropdown) {
      setDropdownPosition(null);
      return;
    }
    setDropdownPosition(updateDropdownPosition());
  }, [showDropdown, results.length, loading, updateDropdownPosition]);

  useEffect(() => {
    if (!showDropdown) return;
    const handleScrollOrResize = () => setDropdownPosition(updateDropdownPosition());
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [showDropdown, updateDropdownPosition]);

  const dropdownContent = showDropdown && dropdownPosition && (
    <div
      ref={dropdownRef}
      className="fixed z-[100] py-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto"
      style={{
        top: dropdownPosition.top + 4,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        minWidth: 200,
      }}
    >
      <ul
        ref={listRef}
        id={id ? `${id}-listbox` : undefined}
        role="listbox"
        className="py-1"
      >
        {loading && results.length === 0 ? (
          <li className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching…
          </li>
        ) : results.length === 0 ? (
          <li className="px-3 py-2 text-sm text-muted-foreground flex flex-col gap-2">
            <span>No products found. Try another search.</span>
            {addNewProductHref && (
              canAddNewProduct ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit gap-2 mt-1"
                  asChild
                >
                  <Link href={addNewProductHref} target="_blank" rel="noopener noreferrer">
                    <Plus className="h-3.5 w-3.5" />
                    Add new product
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit gap-2 mt-1 cursor-not-allowed"
                  disabled
                  title="You don't have permission to add stock. Contact an administrator if you need access."
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add new product
                </Button>
              )
            )}
          </li>
        ) : (
          results.map((product, i) => (
            <li
              key={product.id}
              id={id ? `${id}-opt-${i}` : undefined}
              role="option"
              aria-selected={highlightedIndex === i}
              className={cn(
                "px-3 py-2 text-sm cursor-pointer flex items-center gap-3",
                highlightedIndex === i ? "bg-muted text-foreground" : "hover:bg-muted/70 text-foreground"
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(product);
              }}
              onMouseEnter={() => setHighlightedIndex(i)}
            >
              {product.images?.[0]?.secure_url ? (
                <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-border bg-muted/30">
                  <img
                    src={product.images[0].secure_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-10 w-10 shrink-0 rounded-lg border border-dashed border-border bg-muted/20 flex items-center justify-center text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>
              )}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-medium truncate">{product.name}</span>
                <span className="text-xs text-muted-foreground">
                  {product.sku}
                  {product.costPrice != null ? ` · Cost ₦${Number(product.costPrice).toLocaleString()}` : ""}
                  {product.wholesalePrice != null ? ` · Wholesale ₦${Number(product.wholesalePrice).toLocaleString()}` : ""}
                  {product.retailPrice != null ? ` · Retail ₦${Number(product.retailPrice).toLocaleString()}` : ""}
                  {product.currentStock != null ? ` · ${product.currentStock} in stock` : ""}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );

  const showSelectedImage = selectedProduct?.images?.[0]?.secure_url;
  const allImages = selectedProduct?.images?.filter((im) => im?.secure_url) ?? [];
  const hasMultipleImages = allImages.length > 1;

  const clearImagePreviewTimeouts = useCallback(() => {
    if (imagePreviewShowTimeoutRef.current) {
      clearTimeout(imagePreviewShowTimeoutRef.current);
      imagePreviewShowTimeoutRef.current = null;
    }
    if (imagePreviewHideTimeoutRef.current) {
      clearTimeout(imagePreviewHideTimeoutRef.current);
      imagePreviewHideTimeoutRef.current = null;
    }
  }, []);

  const handleThumbnailMouseEnter = useCallback(() => {
    clearImagePreviewTimeouts();
    imagePreviewHideTimeoutRef.current = null;
    imagePreviewShowTimeoutRef.current = setTimeout(() => {
      imagePreviewShowTimeoutRef.current = null;
      setImagePreviewIndex(0);
      setImagePreviewOpen(true);
    }, 250);
  }, [clearImagePreviewTimeouts]);

  const handleThumbnailMouseLeave = useCallback(() => {
    clearImagePreviewTimeouts();
    imagePreviewShowTimeoutRef.current = null;
    imagePreviewHideTimeoutRef.current = setTimeout(() => setImagePreviewOpen(false), 150);
  }, [clearImagePreviewTimeouts]);

  const handlePreviewMouseEnter = useCallback(() => {
    clearImagePreviewTimeouts();
    imagePreviewHideTimeoutRef.current = null;
  }, [clearImagePreviewTimeouts]);

  const handlePreviewMouseLeave = useCallback(() => {
    clearImagePreviewTimeouts();
    imagePreviewShowTimeoutRef.current = null;
    imagePreviewHideTimeoutRef.current = setTimeout(() => setImagePreviewOpen(false), 150);
  }, [clearImagePreviewTimeouts]);

  useEffect(() => () => clearImagePreviewTimeouts(), [clearImagePreviewTimeouts]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative flex items-center">
        {showSelectedImage ? (
          <div
            ref={thumbnailRef}
            role="button"
            tabIndex={0}
            onMouseEnter={handleThumbnailMouseEnter}
            onMouseLeave={handleThumbnailMouseLeave}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setImagePreviewIndex(0);
                setImagePreviewOpen((v) => !v);
              }
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 shrink-0 rounded-md overflow-hidden border border-border bg-muted/30 z-[1] cursor-pointer hover:ring-2 hover:ring-primary/50 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="View product images"
          >
            <img
              src={showSelectedImage}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        )}
        <Input
          id={id}
          type="text"
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            if (v === "") {
              setSelectedProduct(null);
              onSelect(null);
            } else if (selectedProduct && selectedProduct.name !== v) {
              setSelectedProduct(null); // user edited text, hide image until they pick again
            }
          }}
          onFocus={() => trimmed.length >= MIN_QUERY_LENGTH && (results.length > 0 || loading) && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls={id ? `${id}-listbox` : undefined}
          aria-activedescendant={highlightedIndex >= 0 && results[highlightedIndex] ? `${id ?? "search"}-opt-${highlightedIndex}` : undefined}
          className={cn("h-10 bg-background", showSelectedImage ? "pl-12" : "pl-9")}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin pointer-events-none" />
        )}
      </div>
      {typeof document !== "undefined" && dropdownContent && ReactDOM.createPortal(dropdownContent, document.body)}

      {/* Hover image preview: large view of all product images */}
      {typeof document !== "undefined" &&
        imagePreviewOpen &&
        allImages.length > 0 &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
            onMouseEnter={handlePreviewMouseEnter}
            onMouseLeave={handlePreviewMouseLeave}
            role="dialog"
            aria-modal="true"
            aria-label="Product image preview"
          >
            <button
              type="button"
              onClick={() => setImagePreviewOpen(false)}
              className="fixed top-4 right-4 z-[201] rounded-full bg-white/20 p-2.5 text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close preview"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative flex max-h-[90vh] max-w-6xl flex-col items-center gap-3">
              <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden rounded-lg bg-black/40">
                <img
                  src={allImages[imagePreviewIndex]?.secure_url}
                  alt={selectedProduct ? `${selectedProduct.name} – image ${imagePreviewIndex + 1}` : ""}
                  className="max-h-[80vh] max-w-full object-contain"
                />
                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      onClick={() => setImagePreviewIndex((i) => (i <= 0 ? allImages.length - 1 : i - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setImagePreviewIndex((i) => (i >= allImages.length - 1 ? 0 : i + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-8 w-8" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-white/95 tabular-nums">
                  {imagePreviewIndex + 1}/{allImages.length}
                </span>
                {hasMultipleImages && (
                  <div className="flex gap-1.5">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImagePreviewIndex(i)}
                        className={cn(
                          "h-2 w-2 rounded-full transition-colors",
                          i === imagePreviewIndex ? "bg-white" : "bg-white/40 hover:bg-white/60"
                        )}
                        aria-label={`View image ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {selectedProduct?.name && (
                <p className="text-center text-sm text-white/80">{selectedProduct.name}</p>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
