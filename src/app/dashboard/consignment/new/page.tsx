"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore, selectHasManageConsignment, selectHasManageStock } from "@/stores/authStore";
import {
  consignmentApi,
  type CreateConsignmentPayload,
  type ConsignmentItemPayload,
  type StockSearchItem,
} from "@/lib/api";
import { useMutation } from "@/hooks/useMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ProductSearchSelect } from "@/components/ProductSearchSelect";
import { ArrowLeft, ChevronDown, ChevronUp, Plus, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

/** Form state for a line item (productId comes from selected product when submitting). */
type ConsignmentItemForm = Omit<ConsignmentItemPayload, "productId">;

const defaultItem: ConsignmentItemForm = {
  productName: "",
  cartons: 0,
  quantity: 0,
  unit: "pieces",
  unitPrice: 0,
  totalCost: 0,
  wholesalePrice: undefined,
  retailPrice: undefined,
};

function computeTotalCost(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

export default function NewConsignmentPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const userProfile = useAuthStore((s) => s.userProfile);
  const canManageConsignment = useAuthStore(selectHasManageConsignment);
  const canManageStock = useAuthStore(selectHasManageStock);

  const [supplierName, setSupplierName] = useState("");
  const [supplierReference, setSupplierReference] = useState("");
  const [salesPersonName, setSalesPersonName] = useState("");
  const [salesPersonPhone, setSalesPersonPhone] = useState("");
  const [salesPersonEmail, setSalesPersonEmail] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paymentModeTerms, setPaymentModeTerms] = useState("");
  const [manufacturerOrderNumber, setManufacturerOrderNumber] = useState("");
  const [dispatchDocumentNumber, setDispatchDocumentNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [totalPaid, setTotalPaid] = useState<string>("");
  const [balanceToPay, setBalanceToPay] = useState<string>("");
  const [amountToPayInWords, setAmountToPayInWords] = useState("");
  const [amountPaidInWords, setAmountPaidInWords] = useState("");
  const [receivedAt, setReceivedAt] = useState("");
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ConsignmentItemForm[]>([{ ...defaultItem }]);
  const [showPayment, setShowPayment] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [expandedItemOptions, setExpandedItemOptions] = useState<Record<number, boolean>>({});
  const [selectedProductForItem, setSelectedProductForItem] = useState<Record<number, StockSearchItem | null>>({});
  const [itemImageIndex, setItemImageIndex] = useState<Record<number, number>>({});

  const mutation = useMutation({
    mutationFn: (payload: CreateConsignmentPayload) =>
      consignmentApi.create(accessToken!, payload).then((d) => d ?? ({} as { id: string })),
    invalidateKeys: "consignment",
    onSuccess: () => router.push("/dashboard/consignment"),
    // onError: do nothing — form state is preserved so the user can fix and retry
  });

  useEffect(() => {
    if (userProfile != null && !canManageConsignment) {
      router.replace("/dashboard/consignment");
    }
  }, [userProfile, canManageConsignment, router]);

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, { ...defaultItem }]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
    setSelectedProductForItem((prev) => {
      const next: Record<number, StockSearchItem | null> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const i = Number(k);
        if (i < index) next[i] = v;
        if (i > index) next[i - 1] = v;
      });
      return next;
    });
    setItemImageIndex((prev) => {
      const next: Record<number, number> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const i = Number(k);
        if (i < index) next[i] = v;
        if (i > index) next[i - 1] = v;
      });
      return next;
    });
  }, []);

  const updateItem = useCallback(
    (index: number, field: keyof ConsignmentItemForm, value: string | number | undefined) => {
      setItems((prev) => {
        const next = prev.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        );
        if (field === "quantity" || field === "unitPrice") {
          const item = next[index];
          const qty = Number(item.quantity);
          const price = Number(item.unitPrice);
          next[index] = { ...item, totalCost: computeTotalCost(qty, price) };
        }
        return next;
      });
    },
    []
  );

  const selectProductForItem = useCallback((index: number, product: StockSearchItem | null) => {
    setItems((prev) => {
      const next = prev.map((item, i) => {
        if (i !== index) return item;
        if (!product) {
          return { ...item, productName: "", unit: "pieces", unitPrice: 0, totalCost: 0, sku: undefined, wholesalePrice: undefined, retailPrice: undefined };
        }
        const unitPrice = product.costPrice ?? 0;
        const qty = Number(item.quantity) || 0;
        return {
          ...item,
          productName: product.name,
          unit: product.unit || "pieces",
          unitPrice,
          totalCost: computeTotalCost(qty, unitPrice),
          wholesalePrice: product.wholesalePrice ?? undefined,
          retailPrice: product.retailPrice ?? undefined,
          sku: product.sku ?? undefined,
        };
      });
      return next;
    });
    setSelectedProductForItem((prev) => ({ ...prev, [index]: product }));
    setItemImageIndex((prev) => ({ ...prev, [index]: 0 }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validItems: ConsignmentItemPayload[] = items
      .map((item, index) => ({
        item,
        index,
        productId: selectedProductForItem[index]?.id,
      }))
      .filter(
        ({ item, productId }) =>
          item.productName.trim() &&
          productId &&
          item.cartons >= 0 &&
          item.quantity > 0 &&
          item.unitPrice >= 0
      )
      .map(({ item, productId }) => ({
        productId: productId!,
        productName: item.productName.trim(),
        cartons: Number(item.cartons),
        quantity: Number(item.quantity),
        unit: (item.unit as string) || "pieces",
        unitPrice: Number(item.unitPrice),
        totalCost: Number(item.totalCost) || computeTotalCost(Number(item.quantity), Number(item.unitPrice)),
        wholesalePrice: item.wholesalePrice != null ? Number(item.wholesalePrice) : undefined,
        retailPrice: item.retailPrice != null ? Number(item.retailPrice) : undefined,
        sku: item.sku?.toString().trim() || undefined,
        description: item.description?.toString().trim() || undefined,
        brand: item.brand?.toString().trim() || undefined,
        model: item.model?.toString().trim() || undefined,
        condition: item.condition?.toString().trim() || undefined,
      }));

    const payload: CreateConsignmentPayload = {
      referenceNumber: `CONS-${Date.now()}`,
      supplierName: supplierName.trim(),
      supplierReference: supplierReference.trim() || undefined,
      salesPersonName: salesPersonName.trim() || undefined,
      salesPersonPhone: salesPersonPhone.trim() || undefined,
      salesPersonEmail: salesPersonEmail.trim() || undefined,
      invoiceNumber: invoiceNumber.trim() || undefined,
      deliveryNote: deliveryNote.trim() || undefined,
      deliveryDate: deliveryDate.trim() || undefined,
      deliveryTime: deliveryTime.trim() || undefined,
      paymentModeTerms: paymentModeTerms.trim() || undefined,
      manufacturerOrderNumber: manufacturerOrderNumber.trim() || undefined,
      dispatchDocumentNumber: dispatchDocumentNumber.trim() || undefined,
      bankName: bankName.trim() || undefined,
      bankAccountNumber: bankAccountNumber.trim() || undefined,
      bankAccountName: bankAccountName.trim() || undefined,
      totalPaid: totalPaid !== "" ? Number(totalPaid) : undefined,
      balanceToPay: balanceToPay !== "" ? Number(balanceToPay) : undefined,
      amountToPayInWords: amountToPayInWords.trim() || undefined,
      amountPaidInWords: amountPaidInWords.trim() || undefined,
      receivedAt: receivedAt.trim() ? new Date(receivedAt.trim()).toISOString() : undefined,
      warehouseLocation: warehouseLocation.trim() || undefined,
      notes: notes.trim() || undefined,
      items: validItems.length > 0 ? validItems : undefined,
    };
    try {
      await mutation.mutateAsync(payload);
      // Only on success does onSuccess run (navigation). Form is never cleared on error.
    } catch {
      // Error is already stored in mutation.error and shown in UI. Do not clear form.
    }
  }

  const toggleItemOptions = (index: number) => {
    setExpandedItemOptions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const canSubmit =
    supplierName.trim() !== "" &&
    items.every((item, index) => {
      const hasProduct = item.productName.trim() !== "";
      if (!hasProduct) return true;
      const hasSelectedProduct = !!selectedProductForItem[index]?.id;
      return (
        hasSelectedProduct &&
        Number(item.quantity) > 0 &&
        Number(item.unitPrice) >= 0 &&
        Number(item.cartons) >= 0
      );
    });

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/consignment"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Consignments
            </Link>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              New consignment
            </h1>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="consignment-form w-full max-w-6xl mx-auto">
          {/* Single card: neutral border, clear sections */}
          <Card className="overflow-hidden border border-border bg-card shadow-sm">
            <div className="p-6 sm:p-8 space-y-8">
              {/* Row 1: Basics + Sales side by side on large screens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Basics</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="supplierName" className="text-sm font-medium text-foreground">Supplier name <span className="text-destructive" aria-hidden="true">*</span></Label>
                      <Input id="supplierName" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Manufacturer or supplier" required className="mt-1.5 h-10 bg-background" />
                    </div>
                    <div>
                      <Label htmlFor="supplierReference" className="text-sm text-muted-foreground">Supplier reference</Label>
                      <Input id="supplierReference" value={supplierReference} onChange={(e) => setSupplierReference(e.target.value)} placeholder="e.g. MFG-PO-789" className="mt-1.5 h-10 bg-background" />
                    </div>
                  </div>
                </section>
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Sales person</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="salesPersonName" className="text-sm text-muted-foreground">Name</Label>
                      <Input id="salesPersonName" value={salesPersonName} onChange={(e) => setSalesPersonName(e.target.value)} placeholder="Full name" className="mt-1.5 h-10 bg-background" />
                    </div>
                    <div>
                      <Label htmlFor="salesPersonPhone" className="text-sm text-muted-foreground">Phone</Label>
                      <Input id="salesPersonPhone" type="tel" value={salesPersonPhone} onChange={(e) => setSalesPersonPhone(e.target.value)} placeholder="+234 800 000 0000" className="mt-1.5 h-10 bg-background" />
                    </div>
                    <div>
                      <Label htmlFor="salesPersonEmail" className="text-sm text-muted-foreground">Email</Label>
                      <Input id="salesPersonEmail" type="email" value={salesPersonEmail} onChange={(e) => setSalesPersonEmail(e.target.value)} placeholder="name@company.com" className="mt-1.5 h-10 bg-background" />
                    </div>
                  </div>
                </section>
              </div>

              <hr className="border-border" />

              {/* Invoice & delivery — 3 columns */}
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Invoice & delivery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber" className="text-sm text-muted-foreground">Invoice number</Label>
                    <Input id="invoiceNumber" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-2025-100" className="mt-1.5 h-10 bg-background" />
                  </div>
                  <div>
                    <Label htmlFor="deliveryNote" className="text-sm text-muted-foreground">Delivery note</Label>
                    <Input id="deliveryNote" value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)} placeholder="DN-2025-050" className="mt-1.5 h-10 bg-background" />
                  </div>
                  <div>
                    <Label htmlFor="deliveryDate" className="text-sm text-muted-foreground">Delivery date</Label>
                    <Input id="deliveryDate" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="mt-1.5 h-10 bg-background" />
                  </div>
                  <div>
                    <Label htmlFor="deliveryTime" className="text-sm text-muted-foreground">Time</Label>
                    <Input id="deliveryTime" type="time" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className="mt-1.5 h-10 bg-background" />
                  </div>
                  <div>
                    <Label htmlFor="paymentModeTerms" className="text-sm text-muted-foreground">Payment terms</Label>
                    <Input id="paymentModeTerms" value={paymentModeTerms} onChange={(e) => setPaymentModeTerms(e.target.value)} placeholder="e.g. Bank transfer, 30 days" className="mt-1.5 h-10 bg-background" />
                  </div>
                  <div>
                    <Label htmlFor="manufacturerOrderNumber" className="text-sm text-muted-foreground">Manufacturer order no.</Label>
                    <Input id="manufacturerOrderNumber" value={manufacturerOrderNumber} onChange={(e) => setManufacturerOrderNumber(e.target.value)} placeholder="ORD-12345" className="mt-1.5 h-10 bg-background" />
                  </div>
                  <div>
                    <Label htmlFor="dispatchDocumentNumber" className="text-sm text-muted-foreground">Dispatch document no.</Label>
                    <Input id="dispatchDocumentNumber" value={dispatchDocumentNumber} onChange={(e) => setDispatchDocumentNumber(e.target.value)} placeholder="DISP-001" className="mt-1.5 h-10 bg-background" />
                  </div>
                </div>
              </section>

              {/* Payment — collapsible */}
              <section>
                <button type="button" onClick={() => setShowPayment(!showPayment)} className="w-full flex items-center justify-between py-2 text-left group">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Payment details</h2>
                  {showPayment ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {showPayment && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                    <div>
                      <Label htmlFor="bankName" className="text-sm text-muted-foreground">Bank name</Label>
                      <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. GTBank" className="mt-1.5 h-10 bg-background" />
                    </div>
                    <div>
                      <Label htmlFor="bankAccountNumber" className="text-sm text-muted-foreground">Account number</Label>
                      <Input id="bankAccountNumber" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} placeholder="0123456789" className="mt-1.5 h-10 bg-background" />
                    </div>
                    <div>
                      <Label htmlFor="bankAccountName" className="text-sm text-muted-foreground">Account name</Label>
                      <Input id="bankAccountName" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} placeholder="Account holder name" className="mt-1.5 h-10 bg-background" />
                    </div>
                    <div>
                      <Label htmlFor="totalPaid" className="text-sm text-muted-foreground">Total paid</Label>
                      <Input id="totalPaid" type="number" step="0.01" value={totalPaid} onChange={(e) => setTotalPaid(e.target.value)} className="mt-1.5 h-10 bg-background" />
                    </div>
                    <div>
                      <Label htmlFor="balanceToPay" className="text-sm text-muted-foreground">Balance to pay</Label>
                      <Input id="balanceToPay" type="number" step="0.01" value={balanceToPay} onChange={(e) => setBalanceToPay(e.target.value)} className="mt-1.5 h-10 bg-background" />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1" />
                    <div className="sm:col-span-2">
                      <Label htmlFor="amountToPayInWords" className="text-sm text-muted-foreground">Amount to pay (in words)</Label>
                      <Input id="amountToPayInWords" value={amountToPayInWords} onChange={(e) => setAmountToPayInWords(e.target.value)} placeholder="e.g. Seventy-five thousand naira only" className="mt-1.5 h-10 bg-background" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="amountPaidInWords" className="text-sm text-muted-foreground">Amount paid (in words)</Label>
                      <Input id="amountPaidInWords" value={amountPaidInWords} onChange={(e) => setAmountPaidInWords(e.target.value)} placeholder="e.g. Fifty thousand naira only" className="mt-1.5 h-10 bg-background" />
                    </div>
                  </div>
                )}
              </section>

              {/* Other — collapsible */}
              <section>
                <button type="button" onClick={() => setShowOther(!showOther)} className="w-full flex items-center justify-between py-2 text-left group">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Other</h2>
                  {showOther ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {showOther && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div>
                      <Label htmlFor="receivedAt" className="text-sm text-muted-foreground">Received at</Label>
                      <Input id="receivedAt" type="datetime-local" value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)} className="mt-1.5 h-10 bg-background" />
                    </div>
                    <div>
                      <Label htmlFor="warehouseLocation" className="text-sm text-muted-foreground">Warehouse location</Label>
                      <Input id="warehouseLocation" value={warehouseLocation} onChange={(e) => setWarehouseLocation(e.target.value)} placeholder="e.g. Lagos Main" className="mt-1.5 h-10 bg-background" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="notes" className="text-sm text-muted-foreground">Notes</Label>
                      <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" className="mt-1.5 h-10 bg-background" />
                    </div>
                  </div>
                )}
              </section>

              <hr className="border-border" />

              {/* Items */}
              <section>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</h2>
                  <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Add item
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Add line items below, or leave empty and add them after creating the consignment.</p>
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const selectedProduct = selectedProductForItem[index];
                    const images = selectedProduct?.images ?? [];
                    const imageIndex = itemImageIndex[index] ?? 0;
                    const currentImage = images[imageIndex]?.secure_url;
                    const hasMultipleImages = images.length > 1;
                    return (
                    <div key={index} className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 items-end ${selectedProduct ? "lg:grid-cols-7" : "lg:grid-cols-6"}`}>
                        {selectedProduct && (
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-sm text-muted-foreground">Selected product</Label>
                            <div className="flex items-center gap-1">
                              {currentImage ? (
                                <>
                                  {hasMultipleImages && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 shrink-0 rounded-md"
                                      onClick={() => setItemImageIndex((p) => ({ ...p, [index]: Math.max(0, (p[index] ?? 0) - 1) }))}
                                      disabled={imageIndex === 0}
                                      aria-label="Previous image"
                                    >
                                      <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-border bg-muted/30">
                                    <img src={currentImage} alt={item.productName} className="h-full w-full object-cover" />
                                  </div>
                                  {hasMultipleImages && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 shrink-0 rounded-md"
                                      onClick={() => setItemImageIndex((p) => ({ ...p, [index]: Math.min(images.length - 1, (p[index] ?? 0) + 1) }))}
                                      disabled={imageIndex === images.length - 1}
                                      aria-label="Next image"
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <div className="h-14 w-14 shrink-0 rounded-lg border border-dashed border-border bg-muted/20 flex items-center justify-center text-muted-foreground text-xs">
                                  No image
                                </div>
                              )}
                            </div>
                            {hasMultipleImages && (
                              <p className="text-xs text-muted-foreground">
                                Image {imageIndex + 1} of {images.length}
                              </p>
                            )}
                          </div>
                        )}
                        <div className={selectedProduct ? "col-span-2" : "col-span-2"}>
                          <Label className="text-sm text-muted-foreground">Product <span className="text-destructive" aria-hidden="true">*</span></Label>
                          <ProductSearchSelect
                            accessToken={accessToken}
                            value={item.productName}
                            onSelect={(p) => selectProductForItem(index, p)}
                            placeholder="Search by name or SKU…"
                            id={`item-product-${index}`}
                            className="mt-1.5"
                            addNewProductHref="/dashboard/stocks/new"
                            canAddNewProduct={canManageStock}
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Cartons <span className="text-destructive" aria-hidden="true">*</span></Label>
                          <Input type="number" min={0} value={item.cartons || ""} onChange={(e) => updateItem(index, "cartons", e.target.value ? Number(e.target.value) : 0)} className="mt-1.5 h-10 bg-background" />
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Quantity <span className="text-destructive" aria-hidden="true">*</span></Label>
                          <Input type="number" min={1} value={item.quantity || ""} onChange={(e) => updateItem(index, "quantity", e.target.value ? Number(e.target.value) : 0)} className="mt-1.5 h-10 bg-background" />
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Unit price (cost) <span className="text-destructive" aria-hidden="true">*</span></Label>
                          <Input type="number" step="0.01" min={0} value={item.unitPrice || ""} onChange={(e) => updateItem(index, "unitPrice", e.target.value ? Number(e.target.value) : 0)} className="mt-1.5 h-10 bg-background" />
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Wholesale price</Label>
                          <Input type="number" step="0.01" min={0} value={item.wholesalePrice ?? ""} onChange={(e) => updateItem(index, "wholesalePrice", e.target.value ? Number(e.target.value) : undefined)} className="mt-1.5 h-10 bg-background" placeholder="0.00" />
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Retail price</Label>
                          <Input type="number" step="0.01" min={0} value={item.retailPrice ?? ""} onChange={(e) => updateItem(index, "retailPrice", e.target.value ? Number(e.target.value) : undefined)} className="mt-1.5 h-10 bg-background" placeholder="0.00" />
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Total</Label>
                          <Input type="number" step="0.01" value={item.totalCost || ""} readOnly className="mt-1.5 h-10 bg-muted/80 text-muted-foreground cursor-default" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => toggleItemOptions(index)}>
                          <MoreHorizontal className="h-3.5 w-3.5" />
                          {expandedItemOptions[index] ? "Less" : "More options"}
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-destructive" onClick={() => removeItem(index)} disabled={items.length === 1}>
                          Remove
                        </Button>
                      </div>
                      {expandedItemOptions[index] && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-border">
                          <div>
                            <Label className="text-sm text-muted-foreground">Unit</Label>
                            <Input value={item.unit ?? "pieces"} onChange={(e) => updateItem(index, "unit", e.target.value)} className="mt-1.5 h-10 bg-background" />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">SKU</Label>
                            <Input value={item.sku ?? ""} onChange={(e) => updateItem(index, "sku", e.target.value)} placeholder="Stock keeping unit" className="mt-1.5 h-10 bg-background" />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Brand</Label>
                            <Input value={item.brand ?? ""} onChange={(e) => updateItem(index, "brand", e.target.value)} placeholder="Brand name" className="mt-1.5 h-10 bg-background" />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Model</Label>
                            <Input value={item.model ?? ""} onChange={(e) => updateItem(index, "model", e.target.value)} placeholder="Model" className="mt-1.5 h-10 bg-background" />
                          </div>
                          <div className="sm:col-span-2">
                            <Label className="text-sm text-muted-foreground">Description</Label>
                            <Input value={item.description ?? ""} onChange={(e) => updateItem(index, "description", e.target.value)} placeholder="Short description" className="mt-1.5 h-10 bg-background" />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Condition</Label>
                            <Input value={item.condition ?? "new"} onChange={(e) => updateItem(index, "condition", e.target.value)} placeholder="new" className="mt-1.5 h-10 bg-background" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              </section>
            </div>

            {/* Sticky footer: actions + error */}
            <div className="sticky bottom-0 border-t border-border bg-card px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-h-[1.5rem] flex flex-col gap-1">
                {mutation.isError && <p className="text-sm text-destructive">{mutation.error?.message}</p>}
                <p className="text-xs text-muted-foreground"><span className="text-destructive">*</span> Required</p>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard/consignment">Cancel</Link>
                </Button>
                <Button type="submit" disabled={!canSubmit || mutation.isPending}>
                  {mutation.isPending ? "Creating…" : "Create consignment"}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </>
  );
}
