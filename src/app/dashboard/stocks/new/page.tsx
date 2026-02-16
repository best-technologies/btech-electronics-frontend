"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { stockApi, type CreateStockPayload } from "@/lib/api";
import { useMutation } from "@/hooks/useMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductImageUpload } from "../components";
import { ArrowLeft } from "lucide-react";

export default function NewStockPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("pieces");
  const [initialStock, setInitialStock] = useState<string>("0");
  const [costPrice, setCostPrice] = useState<string>("");
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
    document.title = "Add new stock | BTech-Electronics";
  }, []);

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
      reorderLevel: reorderLevel !== "" ? Number(reorderLevel) : undefined,
      warehouseLocation: warehouseLocation.trim() || undefined,
      isActive,
    };
    mutation.mutateAsync({ ...payload, imageFiles: imageFiles.length ? imageFiles : undefined });
  }

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/stocks"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Stocks
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Add new stock
          </h1>
          <p className="mt-0.5 text-muted-foreground">
            Create a product in the master catalog. Use a unique SKU.
          </p>
        </div>
      </div>

      <div className="w-full px-4 py-8 sm:px-6 lg:px-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Product details</CardTitle>
              <p className="text-sm text-muted-foreground">
                SKU and name are required. Other fields are optional.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. PHONE-X-128"
                    required
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Product name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Smartphone 128GB"
                    required
                    className="rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Brand name"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Model"
                    className="rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Electronics"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="pieces"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Stock & pricing</CardTitle>
              <p className="text-sm text-muted-foreground">
                Initial stock, cost price, and reorder level for alerts.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initialStock">Initial stock</Label>
                  <Input
                    id="initialStock"
                    type="number"
                    min={0}
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost price</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    min={0}
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0.00"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorderLevel">Reorder level</Label>
                  <Input
                    id="reorderLevel"
                    type="number"
                    min={0}
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    placeholder="Alert when below"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Product images</CardTitle>
              <p className="text-sm text-muted-foreground">
                Optional. Add up to 10 images (JPG or PNG, 5MB each). Stored in Cloudinary.
              </p>
            </CardHeader>
            <CardContent>
              <ProductImageUpload
                files={imageFiles}
                onChange={setImageFiles}
                disabled={mutation.isPending}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Location & status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="warehouseLocation">Warehouse location</Label>
                <Input
                  id="warehouseLocation"
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  placeholder="e.g. Lagos Main"
                  className="rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-input"
                />
                <Label htmlFor="isActive" className="font-normal cursor-pointer">
                  Active (product is available for use)
                </Label>
              </div>
            </CardContent>
          </Card>

          {mutation.isError && (
            <p className="text-destructive text-sm">{mutation.error?.message}</p>
          )}
          <div className="flex gap-3">
            <Button type="submit" disabled={mutation.isPending} className="rounded-lg">
              {mutation.isPending ? "Creating…" : "Create product"}
            </Button>
            <Button type="button" variant="outline" asChild className="rounded-lg">
              <Link href="/dashboard/stocks">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
