"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore, selectHasManageInvoice, selectHasManageStock } from "@/stores/authStore";
import {
  invoiceApi,
  DEFAULT_INVOICE_TAX_RATE,
  type CreateInvoicePayload,
  type CreateInvoiceItemPayload,
  type StockSearchItem,
} from "@/lib/api";
import { useMutation } from "@/hooks/useMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ProductSearchSelect } from "@/components/ProductSearchSelect";
import { ArrowLeft, Check, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEFAULT_COMPANY_ADDRESS = "121/123, Obafemi Awolowo Way, Oke-Ado, Ibadan";
const DEFAULT_COMPANY_PHONE = "08038086862, 08174615808";

type InvoicePriceType = "wholesale" | "retail" | "cost" | "custom";

const PRICE_TYPE_LABELS: Record<InvoicePriceType, string> = {
  cost: "Cost",
  wholesale: "Wholesale",
  retail: "Retail",
  custom: "Custom",
};

interface LineItemRow extends CreateInvoiceItemPayload {
  id: string;
  /** Which product price to use for this line (only when product is from catalog). */
  priceType?: InvoicePriceType;
  /** Stored from product at selection time so we can switch wholesale/retail/cost. */
  productWholesalePrice?: number | null;
  productRetailPrice?: number | null;
  productCostPrice?: number | null;
}

function getDefaultDueDate(issueDate: string): string {
  if (!issueDate) return "";
  const d = new Date(issueDate);
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function computeTaxAmount(subtotal: number, taxRate: number): number {
  return roundMoney((subtotal * taxRate) / 100);
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
  const [dueDate, setDueDate] = useState(() => {
    const issue = new Date().toISOString().slice(0, 10);
    return getDefaultDueDate(issue);
  });

  function handleIssueDateChange(nextIssue: string) {
    setIssueDate(nextIssue);
    setDueDate((prev) => (prev === "" && nextIssue ? getDefaultDueDate(nextIssue) : prev));
  }
  const [taxRate, setTaxRate] = useState<string>("7.5");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [notes, setNotes] = useState("");
  const [companyAddress, setCompanyAddress] = useState(DEFAULT_COMPANY_ADDRESS);
  const [companyPhone, setCompanyPhone] = useState(DEFAULT_COMPANY_PHONE);
  const [managerSignedBy, setManagerSignedBy] = useState("");
  const [customerSignedBy, setCustomerSignedBy] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [lineItems, setLineItems] = useState<LineItemRow[]>([
    { id: "1", description: "", quantity: 0, unit: "pieces", unitPrice: 0, totalAmount: 0 },
  ]);

  function handleTaxRateChange(value: string) {
    setTaxRate(value);
  }

  function handleTaxRateBlur() {
    if (taxRate.trim() === "") {
      setTaxRate(String(DEFAULT_INVOICE_TAX_RATE));
    }
  }

  const canManageStock = useAuthStore(selectHasManageStock);

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

  const subtotal = roundMoney(
    lineItems.reduce((s, r) => s + (r.quantity || 0) * (r.unitPrice || 0), 0)
  );
  const rate =
    taxRate === "" ? 0 : Math.max(0, Math.min(100, Number(taxRate) || 0));
  const tax = computeTaxAmount(subtotal, rate);
  const total = roundMoney(subtotal + tax);
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
        quantity: 0,
        unit: "pieces",
        unitPrice: 0,
        totalAmount: 0,
      },
    ]);
  }

  const hasPriceChoice = (row: LineItemRow) =>
    row.productId &&
    (row.productWholesalePrice != null ||
      row.productRetailPrice != null ||
      row.productCostPrice != null);

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
          const q = field === "quantity" ? (Number(value) || 0) : row.quantity;
          const p = field === "unitPrice" ? Number(value) : row.unitPrice;
          next.totalAmount = Math.round(q * p * 100) / 100;
        }
        return next;
      })
    );
  }

  function selectProduct(id: string, product: StockSearchItem | null) {
    if (!product) {
      setLineItems((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row;
          return {
            ...row,
            description: "",
            productId: undefined,
            unit: "pieces",
            unitPrice: 0,
            totalAmount: 0,
            priceType: undefined,
            productWholesalePrice: undefined,
            productRetailPrice: undefined,
            productCostPrice: undefined,
          };
        })
      );
      return;
    }
    const wholesale = product.wholesalePrice ?? product.retailPrice ?? null;
    const retail = product.retailPrice ?? product.wholesalePrice ?? null;
    const cost = product.costPrice != null ? product.costPrice : null;
    const defaultType: InvoicePriceType =
      wholesale != null ? "wholesale" : cost != null ? "cost" : retail != null ? "retail" : "wholesale";
    const defaultPrice =
      defaultType === "wholesale"
        ? (wholesale ?? retail ?? cost ?? 0)
        : defaultType === "cost"
          ? (cost ?? wholesale ?? retail ?? 0)
          : (retail ?? wholesale ?? cost ?? 0);
    const qty = lineItems.find((r) => r.id === id)?.quantity ?? 0;
    setLineItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        return {
          ...row,
          description: product.name,
          productId: product.id,
          unit: product.unit || "pieces",
          unitPrice: defaultPrice,
          totalAmount: (qty || 0) * defaultPrice,
          priceType: defaultType,
          productWholesalePrice: product.wholesalePrice ?? null,
          productRetailPrice: product.retailPrice ?? null,
          productCostPrice: cost,
        };
      })
    );
  }

  function setLinePriceType(id: string, priceType: InvoicePriceType) {
    setLineItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        if (priceType === "custom") {
          return { ...row, priceType };
        }
        const price =
          priceType === "retail"
            ? (row.productRetailPrice ?? row.productWholesalePrice ?? row.productCostPrice ?? 0)
            : priceType === "wholesale"
              ? (row.productWholesalePrice ?? row.productRetailPrice ?? row.productCostPrice ?? 0)
              : (row.productCostPrice ?? row.productWholesalePrice ?? row.productRetailPrice ?? 0);
        return {
          ...row,
          priceType,
          unitPrice: price,
          totalAmount: (row.quantity || 0) * price,
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
        ...(row.priceType && { priceType: row.priceType }),
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
      taxRate: rate,
      taxAmount: tax,
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
              <CardContent className="p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  <div className="min-w-0">
                    <Label htmlFor="customerName" className="text-xs">Customer *</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Name"
                      required
                      className="mt-1 h-9 rounded-md min-w-0"
                    />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="customerCompany" className="text-xs">Company</Label>
                    <Input
                      id="customerCompany"
                      value={customerCompany}
                      onChange={(e) => setCustomerCompany(e.target.value)}
                      placeholder="Optional"
                      className="mt-1 h-9 rounded-md min-w-0"
                    />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="issueDate" className="text-xs">Issue date *</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={issueDate}
                      onChange={(e) => handleIssueDateChange(e.target.value)}
                      required
                      className="mt-1 h-9 rounded-md min-w-0"
                    />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="dueDate" className="text-xs">Due date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1 h-9 rounded-md min-w-0"
                    />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="customerEmail" className="text-xs">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="billing@example.com"
                      className="mt-1 h-9 rounded-md min-w-0"
                    />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="customerPhone" className="text-xs">Phone</Label>
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+234..."
                      className="mt-1 h-9 rounded-md min-w-0"
                    />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="paymentTerms" className="text-xs">Terms</Label>
                    <Input
                      id="paymentTerms"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      placeholder="Net 30"
                      className="mt-1 h-9 rounded-md min-w-0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line items: table */}
            <Card className="border-border/60 overflow-hidden">
              <CardContent className="p-0">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <span className="text-sm font-medium text-foreground">Items</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="text-left font-medium py-2 px-3 text-muted-foreground min-w-[200px]">Product</th>
                        <th className="text-right font-medium py-2 px-3 text-muted-foreground min-w-[72px] sm:w-24">Qty</th>
                        <th className="text-left font-medium py-2 px-3 text-muted-foreground w-[12%]">Unit</th>
                        <th className="text-left font-medium py-2 px-3 text-muted-foreground w-[18%]">Price type</th>
                        <th className="text-right font-medium py-2 px-3 text-muted-foreground w-[14%]">Price</th>
                        <th className="text-right font-medium py-2 px-3 text-muted-foreground w-[12%]">Total</th>
                        <th className="w-9 px-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((row) => (
                        <tr key={row.id} className="border-b border-border/60 hover:bg-muted/20">
                          <td className="px-3 py-2 align-top">
                            <ProductSearchSelect
                              accessToken={accessToken}
                              value={row.description}
                              onSelect={(p) => selectProduct(row.id, p)}
                              placeholder="Search by name or SKU…"
                              id={`invoice-item-product-${row.id}`}
                              className="min-w-[200px]"
                              addNewProductHref="/dashboard/stocks/new"
                              canAddNewProduct={canManageStock}
                            />
                          </td>
                          <td className="px-2 py-2 sm:px-3 sm:py-2 text-right min-w-[72px] sm:w-24 align-top">
                            <Input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              value={row.quantity === 0 ? "" : row.quantity}
                              onChange={(e) => {
                                const v = e.target.value;
                                const num = v === "" ? 0 : Math.max(0, Math.floor(Number(v)) || 0);
                                updateLineItem(row.id, "quantity", num);
                              }}
                              onFocus={(e) => e.target.select()}
                              placeholder="0"
                              className="h-11 w-full min-w-[64px] rounded-md border border-input bg-background text-right focus-visible:ring-2 text-base tabular-nums sm:h-8 sm:min-w-0 sm:border-0 sm:bg-transparent sm:text-sm sm:focus-visible:ring-1"
                            />
                          </td>
                          <td className="px-2 py-2 sm:px-3 sm:py-2">
                            <Input
                              value={row.unit}
                              onChange={(e) => updateLineItem(row.id, "unit", e.target.value)}
                              className="h-11 w-full min-w-[72px] rounded-md border border-input bg-background focus-visible:ring-2 text-base sm:h-8 sm:w-20 sm:min-w-0 sm:border-0 sm:bg-transparent sm:text-sm sm:focus-visible:ring-1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            {hasPriceChoice(row) ? (() => {
                              const currentType = row.priceType ?? "wholesale";
                              const options: { type: InvoicePriceType; amount: number }[] = [
                                { type: "custom", amount: row.unitPrice || 0 },
                              ];
                              if (row.productCostPrice != null) {
                                options.push({ type: "cost", amount: row.productCostPrice });
                              }
                              if (row.productWholesalePrice != null) {
                                options.push({ type: "wholesale", amount: row.productWholesalePrice });
                              }
                              if (row.productRetailPrice != null) {
                                options.push({ type: "retail", amount: row.productRetailPrice });
                              }
                              return (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="h-8 w-full min-w-[7.5rem] justify-between gap-2 px-2 font-normal"
                                      aria-label="Price type: wholesale, retail, cost, or custom"
                                    >
                                      <span className="min-w-0 flex-1 truncate text-left text-xs text-foreground">
                                        {PRICE_TYPE_LABELS[currentType]}
                                      </span>
                                      <span className="flex shrink-0 items-center gap-1">
                                        <span className="text-[0.65rem] leading-tight text-muted-foreground tabular-nums sm:text-[0.7rem]">
                                          {formatCurrency(row.unitPrice || 0)}
                                        </span>
                                        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                      </span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start" className="min-w-[12rem]">
                                    {options.map((opt) => {
                                      const selected = currentType === opt.type;
                                      return (
                                        <DropdownMenuItem
                                          key={opt.type}
                                          onSelect={() => setLinePriceType(row.id, opt.type)}
                                          className="flex cursor-pointer items-baseline justify-between gap-2 py-1.5 pl-1.5 pr-2"
                                        >
                                          <span className="flex min-w-0 flex-1 items-center gap-1.5">
                                            <span className="flex w-3.5 shrink-0 justify-center" aria-hidden>
                                              {selected ? (
                                                <Check className="h-3.5 w-3.5 opacity-80" />
                                              ) : null}
                                            </span>
                                            <span
                                              className={cn("truncate text-sm", selected && "font-medium")}
                                            >
                                              {PRICE_TYPE_LABELS[opt.type]}
                                            </span>
                                          </span>
                                          <span className="shrink-0 pl-1.5 text-[0.65rem] leading-none text-muted-foreground tabular-nums sm:text-[0.7rem]">
                                            {formatCurrency(opt.amount)}
                                          </span>
                                        </DropdownMenuItem>
                                      );
                                    })}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              );
                            })() : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-sm text-foreground">
                            {row.priceType === "custom" ? (
                              <Input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                min={0}
                                value={row.unitPrice === 0 ? "" : row.unitPrice}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  const num = v === "" ? 0 : Math.max(0, Number(v) || 0);
                                  updateLineItem(row.id, "unitPrice", num);
                                }}
                                onFocus={(e) => e.target.select()}
                                placeholder="0"
                                className="h-11 w-full min-w-[110px] rounded-md border border-input bg-background text-right focus-visible:ring-2 text-base tabular-nums sm:h-8 sm:min-w-0 sm:border-0 sm:bg-transparent sm:text-sm sm:focus-visible:ring-1"
                              />
                            ) : (
                              formatCurrency(row.unitPrice || 0)
                            )}
                          </td>
                          <td className="px-3 py-2 text-right font-medium tabular-nums text-foreground">
                            {formatCurrency((row.quantity || 0) * (row.unitPrice || 0))}
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
                      <tr className="border-t border-border bg-muted/10">
                        <td className="px-3 py-2 align-middle" colSpan={4}>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-foreground">Tax (VAT)</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-muted-foreground"
                              onClick={() => setTaxRate("0")}
                            >
                              No tax
                            </Button>
                            {rate === 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-muted-foreground"
                                onClick={() => setTaxRate(String(DEFAULT_INVOICE_TAX_RATE))}
                              >
                                Apply {DEFAULT_INVOICE_TAX_RATE}%
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right align-middle">
                          <div className="flex items-center justify-end gap-1">
                            <Input
                              id="taxRate"
                              type="number"
                              inputMode="decimal"
                              step="0.1"
                              min={0}
                              max={100}
                              value={taxRate}
                              onChange={(e) => handleTaxRateChange(e.target.value)}
                              onBlur={handleTaxRateBlur}
                              onFocus={(e) => e.target.select()}
                              className="h-8 w-20 rounded-md border border-input bg-background text-right tabular-nums text-sm"
                              aria-label="Tax rate percentage"
                            />
                            <span className="text-sm text-muted-foreground">%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right font-medium tabular-nums text-foreground align-middle">
                          {formatCurrency(tax)}
                        </td>
                        <td className="px-2 py-2" />
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={7} className="border-t border-border bg-muted/20 px-4 py-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addLineItem}
                            className="h-9 w-full gap-1.5 text-sm sm:w-auto sm:min-w-[120px]"
                          >
                            <Plus className="h-4 w-4" />
                            Add line
                          </Button>
                        </td>
                      </tr>
                    </tfoot>
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
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({rate}%)</span>
                    <span className="tabular-nums font-medium">{formatCurrency(tax)}</span>
                  </div>
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
