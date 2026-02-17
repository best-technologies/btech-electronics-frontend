"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore, selectHasManageInvoice } from "@/stores/authStore";
import {
  invoiceApi,
  stockApi,
  type CreateInvoicePayload,
  type CreateInvoiceItemPayload,
  type StockProduct,
} from "@/lib/api";
import { useMutation } from "@/hooks/useMutation";
import { useQuery } from "@/hooks/useQuery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const DEFAULT_COMPANY_ADDRESS = "121/123, Obafemi Awolowo Way, Oke-Ado, Ibadan";
const DEFAULT_COMPANY_PHONE = "08038086862, 08174615808";

interface LineItemRow extends CreateInvoiceItemPayload {
  id: string;
}

function getDefaultDueDate(issueDate: string): string {
  if (!issueDate) return "";
  const d = new Date(issueDate);
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export default function NewInvoicePage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const userProfile = useAuthStore((s) => s.userProfile);
  const canManageInvoice = useAuthStore(selectHasManageInvoice);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [taxAmount, setTaxAmount] = useState<string>("0");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [notes, setNotes] = useState("");
  const [companyAddress, setCompanyAddress] = useState(DEFAULT_COMPANY_ADDRESS);
  const [companyPhone, setCompanyPhone] = useState(DEFAULT_COMPANY_PHONE);
  const [managerSignedBy, setManagerSignedBy] = useState("");
  const [customerSignedBy, setCustomerSignedBy] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [lineItems, setLineItems] = useState<LineItemRow[]>([
    { id: "1", description: "", quantity: 1, unit: "pieces", unitPrice: 0, totalAmount: 0 },
  ]);

  const { data: stockList } = useQuery({
    queryKey: "stock-list-invoice-new",
    queryFn: () => stockApi.list(accessToken!, { limit: 500 }),
    enabled: !!accessToken,
  });
  const products: StockProduct[] = stockList?.items ?? [];

  const mutation = useMutation({
    mutationFn: (payload: CreateInvoicePayload) =>
      invoiceApi.create(accessToken!, payload).then((d) => d ?? ({} as { id: string })),
    invalidateKeys: "invoice-list",
    onSuccess: (data) => {
      if (data?.id) router.push(`/dashboard/invoice/${data.id}`);
      else router.push("/dashboard/invoice");
    },
  });

  useEffect(() => {
    document.title = "New invoice | BTech-Electronics";
  }, []);

  useEffect(() => {
    if (userProfile != null && !canManageInvoice) {
      router.replace("/dashboard/invoice");
    }
  }, [userProfile, canManageInvoice, router]);

  useEffect(() => {
    if (issueDate && !dueDate) setDueDate(getDefaultDueDate(issueDate));
  }, [issueDate]);

  const subtotal = lineItems.reduce((s, r) => s + (r.quantity || 0) * (r.unitPrice || 0), 0);
  const tax = taxAmount !== "" ? Number(taxAmount) : 0;
  const total = subtotal + tax;
  const itemCount = lineItems.filter((r) => r.description.trim() && r.quantity > 0).length;

  const canSubmit =
    customerName.trim() !== "" &&
    issueDate !== "" &&
    itemCount >= 1;

  function addLineItem() {
    setLineItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        unit: "pieces",
        unitPrice: 0,
        totalAmount: 0,
      },
    ]);
  }

  function removeLineItem(id: string) {
    setLineItems((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  function updateLineItem(
    id: string,
    field: keyof CreateInvoiceItemPayload,
    value: string | number
  ) {
    setLineItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          const q = field === "quantity" ? Number(value) : row.quantity;
          const p = field === "unitPrice" ? Number(value) : row.unitPrice;
          next.totalAmount = Math.round(q * p * 100) / 100;
        }
        return next;
      })
    );
  }

  function selectProduct(id: string, product: StockProduct) {
    setLineItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        return {
          ...row,
          description: product.name,
          productId: product.id,
          unit: product.unit || "pieces",
          unitPrice: product.costPrice ?? 0,
          totalAmount: (row.quantity || 1) * (product.costPrice ?? 0),
        };
      })
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);
    if (!customerName.trim()) {
      setValidationError("Customer name is required.");
      return;
    }
    const items: CreateInvoiceItemPayload[] = lineItems
      .filter((row) => row.description.trim() && row.quantity > 0)
      .map((row) => ({
        description: row.description.trim(),
        productId: row.productId || undefined,
        quantity: row.quantity,
        unit: row.unit || "pieces",
        unitPrice: row.unitPrice,
        totalAmount: row.totalAmount,
      }));
    if (items.length === 0) {
      setValidationError("Add at least one line item with description and quantity.");
      return;
    }
    const payload: CreateInvoicePayload = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      customerCompany: customerCompany.trim() || undefined,
      issueDate,
      dueDate: dueDate || undefined,
      taxAmount: taxAmount !== "" ? Number(taxAmount) : undefined,
      paymentTerms: paymentTerms.trim() || undefined,
      notes: notes.trim() || undefined,
      companyAddress: companyAddress.trim() || undefined,
      companyPhone: companyPhone.trim() || undefined,
      managerSignedBy: managerSignedBy.trim() || undefined,
      customerSignedBy: customerSignedBy.trim() || undefined,
      items,
    };
    mutation.mutateAsync(payload);
  }

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/invoice"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Invoices
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              New invoice
            </h1>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Left: main form */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Customer + dates: one compact block */}
            <Card className="border-border/60 overflow-hidden">
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="customerName" className="text-xs">Customer *</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Name"
                      required
                      className="mt-1 h-9 rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerCompany" className="text-xs">Company</Label>
                    <Input
                      id="customerCompany"
                      value={customerCompany}
                      onChange={(e) => setCustomerCompany(e.target.value)}
                      placeholder="Optional"
                      className="mt-1 h-9 rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issueDate" className="text-xs">Issue date *</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      required
                      className="mt-1 h-9 rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate" className="text-xs">Due date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1 h-9 rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail" className="text-xs">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="billing@example.com"
                      className="mt-1 h-9 rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone" className="text-xs">Phone</Label>
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+234..."
                      className="mt-1 h-9 rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentTerms" className="text-xs">Terms</Label>
                    <Input
                      id="paymentTerms"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      placeholder="Net 30"
                      className="mt-1 h-9 rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxAmount" className="text-xs">Tax</Label>
                    <Input
                      id="taxAmount"
                      type="number"
                      step="0.01"
                      min={0}
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(e.target.value)}
                      className="mt-1 h-9 rounded-md"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line items: table */}
            <Card className="border-border/60 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                  <span className="text-sm font-medium text-foreground">Items</span>
                  <Button type="button" variant="ghost" size="sm" onClick={addLineItem} className="h-8 gap-1.5 text-xs">
                    <Plus className="h-3.5 w-3.5" />
                    Add line
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="text-left font-medium py-2.5 px-3 text-muted-foreground w-[28%]">Description</th>
                        <th className="text-left font-medium py-2.5 px-3 text-muted-foreground w-[18%]">From stock</th>
                        <th className="text-right font-medium py-2.5 px-3 text-muted-foreground w-[10%]">Qty</th>
                        <th className="text-left font-medium py-2.5 px-3 text-muted-foreground w-[12%]">Unit</th>
                        <th className="text-right font-medium py-2.5 px-3 text-muted-foreground w-[14%]">Price</th>
                        <th className="text-right font-medium py-2.5 px-3 text-muted-foreground w-[12%]">Total</th>
                        <th className="w-9" />
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((row) => (
                        <tr key={row.id} className="border-b border-border/60 hover:bg-muted/20">
                          <td className="px-3 py-2">
                            <Input
                              value={row.description}
                              onChange={(e) => updateLineItem(row.id, "description", e.target.value)}
                              placeholder="Item description"
                              className="h-8 rounded-md border-0 bg-transparent focus-visible:ring-1 text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            {products.length > 0 ? (
                              <select
                                value={row.productId ?? ""}
                                onChange={(e) => {
                                  const id = e.target.value;
                                  const product = products.find((p) => p.id === id);
                                  if (product) selectProduct(row.id, product);
                                }}
                                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                              >
                                <option value="">—</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>{p.sku}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Input
                              type="number"
                              min={1}
                              value={row.quantity}
                              onChange={(e) => updateLineItem(row.id, "quantity", Number(e.target.value))}
                              className="h-8 w-16 rounded-md border-0 bg-transparent text-right focus-visible:ring-1 text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={row.unit}
                              onChange={(e) => updateLineItem(row.id, "unit", e.target.value)}
                              className="h-8 w-20 rounded-md border-0 bg-transparent focus-visible:ring-1 text-sm"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              value={row.unitPrice || ""}
                              onChange={(e) =>
                                updateLineItem(row.id, "unitPrice", parseFloat(e.target.value) || 0)
                              }
                              className="h-8 w-24 rounded-md border-0 bg-transparent text-right focus-visible:ring-1 text-sm ml-auto"
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-medium tabular-nums text-foreground">
                            {row.quantity * (row.unitPrice || 0)}
                          </td>
                          <td className="px-2 py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => removeLineItem(row.id)}
                              disabled={lineItems.length === 1}
                              aria-label="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Collapsible: notes, company, signatures */}
            <div className="border border-border/60 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowMore(!showMore)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                More options (notes, company, signatures)
                {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showMore && (
                <div className="px-4 pb-4 pt-1 border-t border-border/60 space-y-4">
                  <div>
                    <Label htmlFor="notes" className="text-xs">Notes</Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional"
                      className="mt-1 h-9 rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyAddress" className="text-xs">Company address</Label>
                      <Input
                        id="companyAddress"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className="mt-1 h-9 rounded-md"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyPhone" className="text-xs">Company phone</Label>
                      <Input
                        id="companyPhone"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        className="mt-1 h-9 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="managerSignedBy" className="text-xs">Manager signed by</Label>
                      <Input
                        id="managerSignedBy"
                        value={managerSignedBy}
                        onChange={(e) => setManagerSignedBy(e.target.value)}
                        className="mt-1 h-9 rounded-md"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerSignedBy" className="text-xs">Customer signed by</Label>
                      <Input
                        id="customerSignedBy"
                        value={customerSignedBy}
                        onChange={(e) => setCustomerSignedBy(e.target.value)}
                        className="mt-1 h-9 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: sticky summary + actions */}
          <aside className="lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-6 space-y-4">
              <Card className="border-border/60 overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="tabular-nums font-medium">{formatCurrency(tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-border">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="tabular-nums font-bold text-lg">{formatCurrency(total)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {itemCount} item{itemCount !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>

              {(validationError || mutation.isError) && (
                <p className="text-destructive text-sm">
                  {validationError ?? mutation.error?.message}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={!canSubmit || mutation.isPending}
                  className="w-full rounded-lg"
                >
                  {mutation.isPending ? "Creating…" : "Create invoice"}
                </Button>
                <Button type="button" variant="outline" asChild className="w-full rounded-lg">
                  <Link href="/dashboard/invoice">Cancel</Link>
                </Button>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </>
  );
}
