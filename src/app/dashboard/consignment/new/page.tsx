"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import {
  consignmentApi,
  type CreateConsignmentPayload,
  type ConsignmentItemPayload,
} from "@/lib/api";
import { useMutation } from "@/hooks/useMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const defaultItem: ConsignmentItemPayload = {
  productName: "",
  cartons: 0,
  quantity: 0,
  unit: "pieces",
  unitPrice: 0,
  totalCost: 0,
};

function computeTotalCost(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

export default function NewConsignmentPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [referenceNumber, setReferenceNumber] = useState("");
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
  const [items, setItems] = useState<ConsignmentItemPayload[]>([{ ...defaultItem }]);

  const mutation = useMutation({
    mutationFn: (payload: CreateConsignmentPayload) =>
      consignmentApi.create(accessToken!, payload).then((d) => d ?? ({} as { id: string })),
    invalidateKeys: "consignment",
    onSuccess: () => router.push("/dashboard/consignment"),
  });

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, { ...defaultItem }]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }, []);

  const updateItem = useCallback(
    (index: number, field: keyof ConsignmentItemPayload, value: string | number) => {
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validItems = items
      .filter(
        (i) =>
          i.productName.trim() &&
          i.cartons >= 0 &&
          i.quantity > 0 &&
          i.unitPrice >= 0
      )
      .map((i) => ({
        productName: i.productName.trim(),
        cartons: Number(i.cartons),
        quantity: Number(i.quantity),
        unit: (i.unit as string) || "pieces",
        unitPrice: Number(i.unitPrice),
        totalCost: Number(i.totalCost) || computeTotalCost(Number(i.quantity), Number(i.unitPrice)),
        sku: i.sku?.toString().trim() || undefined,
        description: i.description?.toString().trim() || undefined,
        brand: i.brand?.toString().trim() || undefined,
        model: i.model?.toString().trim() || undefined,
        condition: i.condition?.toString().trim() || undefined,
      }));

    const payload: CreateConsignmentPayload = {
      referenceNumber: referenceNumber.trim(),
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
    mutation.mutateAsync(payload);
  }

  return (
    <div className="p-6 max-w-4xl">
      <Link
        href="/dashboard/consignment"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Consignment
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        Register new consignment
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reference</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="referenceNumber">Reference number *</Label>
                <Input
                  id="referenceNumber"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. CONS-2025-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierName">Supplier name *</Label>
                <Input
                  id="supplierName"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="supplierReference">Supplier reference</Label>
                <Input
                  id="supplierReference"
                  value={supplierReference}
                  onChange={(e) => setSupplierReference(e.target.value)}
                  placeholder="e.g. MFG-PO-789"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales person</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salesPersonName">Name</Label>
                <Input
                  id="salesPersonName"
                  value={salesPersonName}
                  onChange={(e) => setSalesPersonName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salesPersonPhone">Phone</Label>
                <Input
                  id="salesPersonPhone"
                  type="tel"
                  value={salesPersonPhone}
                  onChange={(e) => setSalesPersonPhone(e.target.value)}
                  placeholder="+2348012345678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salesPersonEmail">Email</Label>
                <Input
                  id="salesPersonEmail"
                  type="email"
                  value={salesPersonEmail}
                  onChange={(e) => setSalesPersonEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoice & delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="INV-2025-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryNote">Delivery note</Label>
                <Input
                  id="deliveryNote"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="DN-2025-050"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Delivery date</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Delivery time (HH:mm)</Label>
                <Input
                  id="deliveryTime"
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="14:30"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="paymentModeTerms">Payment mode / terms</Label>
                <Input
                  id="paymentModeTerms"
                  value={paymentModeTerms}
                  onChange={(e) => setPaymentModeTerms(e.target.value)}
                  placeholder="e.g. Bank Transfer - 30 days"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturerOrderNumber">Manufacturer order number</Label>
                <Input
                  id="manufacturerOrderNumber"
                  value={manufacturerOrderNumber}
                  onChange={(e) => setManufacturerOrderNumber(e.target.value)}
                  placeholder="ORD-MFG-12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dispatchDocumentNumber">Dispatch document number</Label>
                <Input
                  id="dispatchDocumentNumber"
                  value={dispatchDocumentNumber}
                  onChange={(e) => setDispatchDocumentNumber(e.target.value)}
                  placeholder="DISP-001"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank name</Label>
                <Input
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. GTBank"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Account number</Label>
                <Input
                  id="bankAccountNumber"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="0123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccountName">Account name</Label>
                <Input
                  id="bankAccountName"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalPaid">Total paid</Label>
                <Input
                  id="totalPaid"
                  type="number"
                  step="0.01"
                  value={totalPaid}
                  onChange={(e) => setTotalPaid(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balanceToPay">Balance to pay</Label>
                <Input
                  id="balanceToPay"
                  type="number"
                  step="0.01"
                  value={balanceToPay}
                  onChange={(e) => setBalanceToPay(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="amountToPayInWords">Amount to pay (in words)</Label>
                <Input
                  id="amountToPayInWords"
                  value={amountToPayInWords}
                  onChange={(e) => setAmountToPayInWords(e.target.value)}
                  placeholder="e.g. Seventy Five Thousand Naira Only"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="amountPaidInWords">Amount paid (in words)</Label>
                <Input
                  id="amountPaidInWords"
                  value={amountPaidInWords}
                  onChange={(e) => setAmountPaidInWords(e.target.value)}
                  placeholder="e.g. Fifty Thousand Naira Only"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Other</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receivedAt">Received at (datetime)</Label>
                <Input
                  id="receivedAt"
                  type="datetime-local"
                  value={receivedAt}
                  onChange={(e) => setReceivedAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouseLocation">Warehouse location</Label>
                <Input
                  id="warehouseLocation"
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  placeholder="e.g. Lagos Main"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Items</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Optional. Leave empty to create the consignment first and add items later (two-step).
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              Add item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 p-4 rounded-lg border border-border"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Product name *</Label>
                    <Input
                      value={item.productName}
                      onChange={(e) =>
                        updateItem(index, "productName", e.target.value)
                      }
                      placeholder="e.g. Smartphone 128GB Black"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Cartons *</Label>
                    <Input
                      type="number"
                      min={0}
                      value={item.cartons || ""}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "cartons",
                          e.target.value ? Number(e.target.value) : 0
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Quantity *</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity || ""}
                      onChange={(e) => {
                        const v = e.target.value ? Number(e.target.value) : 0;
                        updateItem(index, "quantity", v);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Unit</Label>
                    <Input
                      value={item.unit ?? "pieces"}
                      onChange={(e) =>
                        updateItem(index, "unit", e.target.value)
                      }
                      placeholder="pieces"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Unit price *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={item.unitPrice || ""}
                      onChange={(e) => {
                        const v = e.target.value ? Number(e.target.value) : 0;
                        updateItem(index, "unitPrice", v);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Total cost</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.totalCost || ""}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">SKU</Label>
                    <Input
                      value={item.sku ?? ""}
                      onChange={(e) =>
                        updateItem(index, "sku", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={item.description ?? ""}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Brand</Label>
                    <Input
                      value={item.brand ?? ""}
                      onChange={(e) =>
                        updateItem(index, "brand", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Model</Label>
                    <Input
                      value={item.model ?? ""}
                      onChange={(e) =>
                        updateItem(index, "model", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Condition</Label>
                    <Input
                      value={item.condition ?? "new"}
                      onChange={(e) =>
                        updateItem(index, "condition", e.target.value)
                      }
                      placeholder="new"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-fit"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  Remove item
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {mutation.isError && (
          <p className="text-destructive text-sm">{mutation.error?.message}</p>
        )}
        <div className="flex gap-3">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating…" : "Create consignment"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/consignment">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
