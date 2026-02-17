"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { stockApi, type StockSearchItem } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, Loader2, Plus } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<StockSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync input with controlled value when parent sets it (e.g. after selection)
  useEffect(() => {
    setQuery(value);
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
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      runSearch(query);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
    onSelect(product);
    setQuery(product.name);
    setOpen(false);
    setHighlightedIndex(-1);
  };

  const trimmed = query.trim();
  const showDropdown = open && (results.length > 0 || loading || (trimmed.length >= MIN_QUERY_LENGTH && !loading));

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id={id}
          type="text"
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            if (v === "") onSelect(null);
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
          className="pl-9 h-10 bg-background"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin pointer-events-none" />
        )}
      </div>
      {showDropdown && (
        <ul
          ref={listRef}
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className="absolute z-50 w-full mt-1 py-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto"
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
      )}
    </div>
  );
}
