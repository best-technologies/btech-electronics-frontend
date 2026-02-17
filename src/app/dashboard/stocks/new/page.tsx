"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore, selectHasManageStock } from "@/stores/authStore";
import { stockApi, type CreateStockPayload } from "@/lib/api";
import { useMutation } from "@/hooks/useMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ProductImageUpload } from "../components";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

function parseCurrencyInput(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
  return cleaned;
}

function formatCurrencyDisplay(value: string): string {
  if (value === "" || value === ".") return "";
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return value;
  return formatCurrency(num);
}

export default function NewStockPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const userProfile = useAuthStore((s) => s.userProfile);
  const canManageStock = useAuthStore(selectHasManageStock);

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("Triphone");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [unit, setUnit] = useState("pieces");
  const [initialStock, setInitialStock] = useState<string>("0");
  const [costPrice, setCostPrice] = useState<string>("");
  const [normalSellingPrice, setNormalSellingPrice] = useState<string>("");
  const [costPriceFocused, setCostPriceFocused] = useState(false);
  const [normalSellingPriceFocused, setNormalSellingPriceFocused] = useState(false);
  // const [discountedSellingPrice, setDiscountedSellingPrice] = useState<string>("");
  const [reorderLevel, setReorderLevel] = useState<string>("");
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const mutation = useMutation({
    mutationFn: async (payload: CreateStockPayload & { imageFiles?: File[] }) => {
      const { imageFiles: imgs, ...rest } = payload;
      if (imgs?.length) {
        return stockApi.createWithImages(accessToken!, rest, imgs).then((d) => d ?? ({} as { id: string }));
      }
      return stockApi.create(accessToken!, rest).then((d) => d ?? ({} as { id: string }));
    },
    invalidateKeys: "stock",
    onSuccess: () => router.push("/dashboard/stocks"),
  });

  useEffect(() => {
    document.title = "New product | BTech-Electronics";
  }, []);

  useEffect(() => {
    if (userProfile != null && !canManageStock) {
      router.replace("/dashboard/stocks");
    }
  }, [userProfile, canManageStock, router]);

  const canSubmit = sku.trim() !== "" && name.trim() !== "";

  if (userProfile != null && !canManageStock) {
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: CreateStockPayload = {
      sku: sku.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      category: category.trim() || undefined,
      unit: unit.trim() || "pieces",
      initialStock: initialStock !== "" ? Number(initialStock) : undefined,
      costPrice: costPrice !== "" ? Number(costPrice) : undefined,
      normalSellingPrice: normalSellingPrice !== "" ? Number(normalSellingPrice) : undefined,
      // discountedSellingPrice: discountedSellingPrice !== "" ? Number(discountedSellingPrice) : undefined,
      reorderLevel: reorderLevel !== "" ? Number(reorderLevel) : undefined,
      warehouseLocation: warehouseLocation.trim() || undefined,
      isActive,
    };
    mutation.mutateAsync({ ...payload, imageFiles: imageFiles.length ? imageFiles : undefined });
  }

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/stocks"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Stocks
            </Link>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              New product
            </h1>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="stocks-form w-full max-w-6xl mx-auto">
          <Card className="overflow-hidden border border-border bg-card shadow-sm">
            <div className="p-6 sm:p-8 space-y-8">
              {/* Basics: SKU + name + description + brand/model/category/unit */}
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Product details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sku" className="text-sm font-medium text-foreground">SKU <span className="text-destructive" aria-hidden="true">*</span></Label>
                      <Input
                        id="sku"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="e.g. PHONE-X-128"
                        required
                        className="mt-1.5 h-10 bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-foreground">Product name <span className="text-destructive" aria-hidden="true">*</span></Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Smartphone 128GB"
                        required
                        className="mt-1.5 h-10 bg-background"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-sm text-muted-foreground">Description</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional description"
                      className="mt-1.5 h-10 bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="brand" className="text-sm text-muted-foreground">Brand</Label>
                      <select
                        id="brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="Triphone">Triphone</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-sm text-muted-foreground">Category</Label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="Electronics">Electronics</option>
                        <option value="Book">Book</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="model" className="text-sm text-muted-foreground">Model</Label>
                      <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model" className="mt-1.5 h-10 bg-background" />
                    </div>
                    <div>
                      <Label htmlFor="unit" className="text-sm text-muted-foreground">Unit</Label>
                      <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="pieces" className="mt-1.5 h-10 bg-background" />
                    </div>
                  </div>
                </div>
              </section>

              <hr className="border-border" />

              {/* Stock & pricing */}
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Stock & pricing</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="initialStock" className="text-sm text-muted-foreground">Initial stock</Label>
                    <Input
                      id="initialStock"
                      type="number"
                      min={0}
                      value={initialStock}
                      onChange={(e) => setInitialStock(e.target.value)}
                      className="mt-1.5 h-10 bg-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor="costPrice" className="text-sm text-muted-foreground">Cost price</Label>
                    <Input
                      id="costPrice"
                      type="text"
                      inputMode="decimal"
                      value={costPriceFocused ? costPrice : formatCurrencyDisplay(costPrice)}
                      onFocus={() => setCostPriceFocused(true)}
                      onBlur={() => setCostPriceFocused(false)}
                      onChange={(e) => setCostPrice(parseCurrencyInput(e.target.value))}
                      placeholder="0.00"
                      className="mt-1.5 h-10 bg-background tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Per unit from producer</p>
                  </div>
                  <div>
                    <Label htmlFor="normalSellingPrice" className="text-sm text-muted-foreground">Normal selling price</Label>
                    <Input
                      id="normalSellingPrice"
                      type="text"
                      inputMode="decimal"
                      value={normalSellingPriceFocused ? normalSellingPrice : formatCurrencyDisplay(normalSellingPrice)}
                      onFocus={() => setNormalSellingPriceFocused(true)}
                      onBlur={() => setNormalSellingPriceFocused(false)}
                      onChange={(e) => setNormalSellingPrice(parseCurrencyInput(e.target.value))}
                      placeholder="0.00"
                      className="mt-1.5 h-10 bg-background tabular-nums"
                    />
                  </div>
                  {/* Discounted selling price – commented out for now
                  <div>
                    <Label htmlFor="discountedSellingPrice" className="text-sm text-muted-foreground">Discounted selling price</Label>
                    <Input
                      id="discountedSellingPrice"
                      type="number"
                      step="0.01"
                      min={0}
                      value={discountedSellingPrice}
                      onChange={(e) => setDiscountedSellingPrice(e.target.value)}
                      placeholder="0.00"
                      className="mt-1.5 h-10 bg-background"
                    />
                  </div>
                  */}
                  <div>
                    <Label htmlFor="reorderLevel" className="text-sm text-muted-foreground">Reorder level</Label>
                    <Input
                      id="reorderLevel"
                      type="number"
                      min={0}
                      value={reorderLevel}
                      onChange={(e) => setReorderLevel(e.target.value)}
                      placeholder="Alert when below"
                      className="mt-1.5 h-10 bg-background"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-border" />

              {/* Product images */}
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Product images</h2>
                <p className="text-sm text-muted-foreground mb-4">Optional. Up to 10 images (JPG or PNG, 5MB each).</p>
                <ProductImageUpload
                  files={imageFiles}
                  onChange={setImageFiles}
                  disabled={mutation.isPending}
                />
              </section>

              <hr className="border-border" />

              {/* Location & status */}
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Location & status</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="warehouseLocation" className="text-sm text-muted-foreground">Warehouse location</Label>
                    <Input
                      id="warehouseLocation"
                      value={warehouseLocation}
                      onChange={(e) => setWarehouseLocation(e.target.value)}
                      placeholder="e.g. Lagos Main"
                      className="mt-1.5 h-10 bg-background"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-input h-4 w-4"
                    />
                    <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer text-muted-foreground">
                      Active (product available for use)
                    </Label>
                  </div>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 border-t border-border bg-card px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-h-[1.5rem] flex flex-col gap-1">
                {mutation.isError && <p className="text-sm text-destructive">{mutation.error?.message}</p>}
                <p className="text-xs text-muted-foreground"><span className="text-destructive">*</span> Required</p>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard/stocks">Cancel</Link>
                </Button>
                <Button type="submit" disabled={!canSubmit || mutation.isPending}>
                  {mutation.isPending ? "Creating…" : "Create product"}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </>
  );
}
