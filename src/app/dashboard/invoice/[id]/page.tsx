"use client";

import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore, selectHasManageInvoice } from "@/stores/authStore";
import { invoiceApi, type Invoice } from "@/lib/api";
import { useQuery } from "@/hooks/useQuery";
import { useMutation } from "@/hooks/useMutation";
import { useQueryStore } from "@/stores/queryStore";
import { formatCurrency, formatDate, formatDateTime, formatStatus } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileDown, Banknote, History, ExternalLink, Undo2, X, FileText, Trash2 } from "lucide-react";

function ReceiptThumbnail({ url, isImage }: { url: string; isImage: boolean }) {
  const [imageError, setImageError] = useState(false);
  const showImage = isImage && !imageError;
  const linkClass =
    "flex w-12 h-12 rounded border border-border/60 overflow-hidden bg-muted/30 shrink-0 items-center justify-center";
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClass}
    >
      {showImage ? (
        <img
          src={url}
          alt="Receipt"
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <FileText className="h-5 w-5 text-muted-foreground" />
      )}
    </a>
  );
}

const DELETE_COUNTDOWN_SECONDS = 10;

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const accessToken = useAuthStore((s) => s.accessToken);
  const canManageInvoice = useAuthStore(selectHasManageInvoice);

  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [recordPaymentError, setRecordPaymentError] = useState<string | null>(null);
  const [showUnmarkConfirm, setShowUnmarkConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(DELETE_COUNTDOWN_SECONDS);

  const RECEIPT_MAX_MB = 5;
  const RECEIPT_ACCEPT = "image/jpeg,image/png,image/jpg,application/pdf";

  /** Format amount for display in input (e.g. "50000" → "50,000"). No forced decimals. */
  function formatAmountDisplay(raw: string): string {
    if (!raw.trim()) return "";
    const n = parseFloat(raw.replace(/,/g, ""));
    if (Number.isNaN(n)) return raw;
    return n.toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  /** Parse amount from input (strip commas, return number) */
  function parseAmountInput(s: string): number {
    const n = parseFloat(s.replace(/,/g, ""));
    return Number.isNaN(n) ? 0 : n;
  }

  function handleAmountChange(
    e: React.ChangeEvent<HTMLInputElement>,
    maxAmount: number
  ) {
    let raw = e.target.value.replace(/,/g, "");
    raw = raw.replace(/[^\d.]/g, "");
    const parts = raw.split(".");
    if (parts.length > 2) raw = parts[0] + "." + parts.slice(1).join("");
    if (parts[1]?.length > 2) raw = parts[0] + "." + parts[1].slice(0, 2);
    const num = parseFloat(raw);
    if (!Number.isNaN(num) && num > maxAmount) {
      raw = String(maxAmount);
    }
    setPaymentAmount(raw);
  }

  useEffect(() => {
    if (!paymentReceipt || !paymentReceipt.type.startsWith("image/")) {
      setReceiptPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const url = URL.createObjectURL(paymentReceipt);
    setReceiptPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [paymentReceipt]);

  const setEntry = useQueryStore((s) => s.setEntry);

  const {
    data: invoice,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: `invoice-${id}`,
    queryFn: () => invoiceApi.getById(accessToken!, id!),
    enabled: !!accessToken && !!id,
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (payload: {
      amount: number;
      paymentMethod?: string;
      reference?: string;
      notes?: string;
      receipt?: File;
    }) =>
      invoiceApi.recordPayment(accessToken!, id!, payload).then((d) => d ?? ({} as Invoice)),
    invalidateKeys: "invoice-list",
    onSuccess: (data) => {
      setPaymentAmount("");
      setPaymentReceipt(null);
      setRecordPaymentError(null);
      if (data && "id" in data) {
        setEntry(`invoice-${id}`, { data, status: "success" });
      } else {
        refetch();
      }
    },
  });

  function handleRecordPayment(partial: boolean) {
    setRecordPaymentError(null);
    const amount = partial
      ? parseAmountInput(paymentAmount)
      : (invoice?.balanceDue ?? 0);
    if (amount <= 0) {
      setRecordPaymentError(partial ? "Amount is required." : "No balance due.");
      return;
    }
    if (invoice && amount > invoice.balanceDue) {
      setRecordPaymentError("Amount cannot exceed balance due.");
      return;
    }
    if (!paymentReceipt) {
      setRecordPaymentError("Receipt (image or PDF) is required.");
      return;
    }
    if (paymentReceipt.size > RECEIPT_MAX_MB * 1024 * 1024) {
      setRecordPaymentError(`Receipt must be under ${RECEIPT_MAX_MB}MB.`);
      return;
    }
    recordPaymentMutation.mutateAsync({
      amount,
      receipt: paymentReceipt,
    });
  }

  const paymentAmountNum = parseAmountInput(paymentAmount);
  const canRecordPartial =
    invoice &&
    invoice.balanceDue > 0 &&
    paymentAmount.trim() !== "" &&
    paymentAmountNum > 0 &&
    paymentAmountNum <= invoice.balanceDue &&
    paymentReceipt != null;
  const canMarkFullyPaid = invoice && invoice.balanceDue > 0 && paymentReceipt != null;

  const unmarkPaidMutation = useMutation<Invoice, void>({
    mutationFn: () => invoiceApi.unmarkPaid(accessToken!, id!).then((d) => d ?? ({} as Invoice)),
    invalidateKeys: "invoice-list",
    onSuccess: (data) => {
      setShowUnmarkConfirm(false);
      if (data && "id" in data) {
        setEntry(`invoice-${id}`, { data, status: "success" });
      } else {
        refetch();
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => invoiceApi.delete(accessToken!, id!),
    invalidateKeys: "invoice-list",
    onSuccess: () => {
      setShowDeleteConfirm(false);
      setDeleteCountdown(DELETE_COUNTDOWN_SECONDS);
      router.push("/dashboard/invoice");
    },
  });

  useEffect(() => {
    if (showUnmarkConfirm) {
      const onEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !unmarkPaidMutation.isPending) setShowUnmarkConfirm(false);
      };
      document.addEventListener("keydown", onEscape);
      return () => document.removeEventListener("keydown", onEscape);
    }
  }, [showUnmarkConfirm, unmarkPaidMutation.isPending]);

  useEffect(() => {
    if (!showDeleteConfirm) return;
    setDeleteCountdown(DELETE_COUNTDOWN_SECONDS);
    const t = setInterval(() => {
      setDeleteCountdown((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [showDeleteConfirm]);

  useEffect(() => {
    if (showDeleteConfirm) {
      const onEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !deleteMutation.isPending) setShowDeleteConfirm(false);
      };
      document.addEventListener("keydown", onEscape);
      return () => document.removeEventListener("keydown", onEscape);
    }
  }, [showDeleteConfirm, deleteMutation.isPending]);

  async function handleDownloadPdf() {
    if (!accessToken || !id || !invoice) return;
    setPdfError(null);
    setPdfDownloading(true);
    try {
      const { blob, filename } = await invoiceApi.downloadPdf(
        accessToken,
        id,
        `invoice-${invoice.invoiceNumber}.pdf`
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setPdfDownloading(false);
    }
  }

  if (!id) {
    return (
      <div className="w-full px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Invalid invoice.</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/dashboard/invoice">Back to Invoices</Link>
        </Button>
      </div>
    );
  }

  if ((isLoading || isFetching) && !invoice) {
    return (
      <div className="w-full px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="h-10 w-48 rounded bg-muted animate-pulse mb-4" />
        <div className="h-96 w-full max-w-2xl rounded-xl bg-muted/50 animate-pulse" />
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="w-full px-4 py-8">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 max-w-md mx-auto text-center">
          <h2 className="text-lg font-semibold text-destructive">Unable to load invoice</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error?.message ?? "Invoice not found or you don’t have access."}
          </p>
          <div className="mt-4 flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard/invoice">Back to Invoices</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top bar: back link + status + download PDF */}
      <div className="border-b border-border bg-card/80 sticky top-0 z-10">
        <div className="w-full px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between gap-4 flex-wrap">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground" asChild>
            <Link href="/dashboard/invoice">
              <ArrowLeft className="h-4 w-4" />
              Back to Invoices
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Status</span>
            <span
              className="inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium bg-primary text-primary-foreground"
              title="Invoice status"
            >
              {formatStatus(invoice.status)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={pdfDownloading}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              {pdfDownloading ? "Downloading…" : "Download PDF"}
            </Button>
            {canManageInvoice && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteMutation.isPending}
                className="gap-2 text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete invoice
              </Button>
            )}
          </div>
        </div>
        {pdfError && (
          <p className="px-4 pb-2 text-sm text-destructive">{pdfError}</p>
        )}
      </div>

      {/* Invoice left + Payment status right */}
      <div className="w-full flex flex-col lg:flex-row gap-8 px-4 py-8 sm:px-6 lg:px-8 print:flex-col">
        {/* Left: invoice document */}
        <div className="flex-1 min-w-0 flex justify-center lg:justify-start print:justify-center">
          <article
            className="w-full max-w-[680px] bg-card border border-border rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-0 print:max-w-none"
            style={{ maxHeight: "none" }}
          >
          <div className="p-8 sm:p-10 md:p-12">
            {/* Logo centered */}
            <div className="flex justify-center mb-8">
              <Image
                src="/btech-logo.jpg"
                alt="B tech. Company logo"
                width={180}
                height={180}
                className="object-contain"
                priority
              />
            </div>

            {/* Title and ref */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
                Invoice
              </h1>
              <p className="mt-2 text-lg font-semibold text-foreground font-mono">
                {invoice.invoiceNumber}
              </p>
              <p className="mt-1 inline-flex items-center rounded-md bg-primary/15 text-primary px-2.5 py-0.5 text-sm font-medium border border-primary/30">
                {formatStatus(invoice.status)}
              </p>
            </div>

            {/* Dates row */}
            <div className="flex flex-wrap justify-between gap-6 mb-8 text-sm">
              <div>
                <span className="text-muted-foreground">Issue date</span>
                <p className="font-medium text-foreground">{formatDate(invoice.issueDate)}</p>
              </div>
              {invoice.dueDate && (
                <div>
                  <span className="text-muted-foreground">Due date</span>
                  <p className="font-medium text-foreground">{formatDate(invoice.dueDate)}</p>
                </div>
              )}
              {invoice.paymentTerms && (
                <div>
                  <span className="text-muted-foreground">Payment terms</span>
                  <p className="font-medium text-foreground">{invoice.paymentTerms}</p>
                </div>
              )}
            </div>

            {/* Bill to */}
            <div className="mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Bill to
              </h2>
              <p className="font-semibold text-foreground">{invoice.customerName}</p>
              {invoice.customerCompany && (
                <p className="text-muted-foreground">{invoice.customerCompany}</p>
              )}
              {invoice.customerEmail && (
                <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
              )}
              {invoice.customerPhone && (
                <p className="text-sm text-muted-foreground">{invoice.customerPhone}</p>
              )}
            </div>

            {/* Line items table */}
            <div className="border border-border rounded-lg overflow-hidden mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left font-medium py-3 px-4 text-muted-foreground">Description</th>
                    <th className="text-right font-medium py-3 px-4 text-muted-foreground w-20">Qty</th>
                    <th className="text-left font-medium py-3 px-4 text-muted-foreground w-24">Unit</th>
                    <th className="text-right font-medium py-3 px-4 text-muted-foreground w-28">Unit price</th>
                    <th className="text-right font-medium py-3 px-4 text-muted-foreground w-28">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item) => (
                    <tr key={item.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 px-4 text-foreground">{item.description}</td>
                      <td className="py-3 px-4 text-right tabular-nums">{item.quantity}</td>
                      <td className="py-3 px-4 text-muted-foreground">{item.unit}</td>
                      <td className="py-3 px-4 text-right tabular-nums">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium tabular-nums">
                        {formatCurrency(item.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-full max-w-[280px] space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(invoice.subtotal ?? 0)}</span>
                </div>
                {(invoice.taxAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span className="tabular-nums">{formatCurrency(invoice.taxAmount!)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-foreground pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(invoice.totalAmount ?? 0)}</span>
                </div>
                {(invoice.amountPaid ?? 0) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Amount paid</span>
                    <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(invoice.amountPaid!)}
                    </span>
                  </div>
                )}
                {(invoice.balanceDue ?? 0) > 0 && (
                  <div className="flex justify-between font-medium text-amber-600 dark:text-amber-400">
                    <span>Balance due</span>
                    <span className="tabular-nums">{formatCurrency(invoice.balanceDue!)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Amount in words */}
            {invoice.amountInWords && (
              <p className="text-sm text-muted-foreground italic mb-6">
                {invoice.amountInWords}
              </p>
            )}

            {/* Notes */}
            {invoice.notes && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Notes
                </h3>
                <p className="text-sm text-foreground">{invoice.notes}</p>
              </div>
            )}

            {/* Company footer */}
            {(invoice.companyAddress || invoice.companyPhone) && (
              <div className="pt-6 border-t border-border text-sm text-muted-foreground">
                {invoice.companyAddress && <p>{invoice.companyAddress}</p>}
                {invoice.companyPhone && <p className="mt-1">{invoice.companyPhone}</p>}
              </div>
            )}

            {/* Company bank details */}
            <div className="mt-6 rounded-lg border border-border bg-muted/20 p-4 sm:p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Payment account details
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs">Bank</dt>
                  <dd className="font-medium text-foreground mt-0.5">Zenith Bank</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Account number</dt>
                  <dd className="font-medium text-foreground font-mono mt-0.5">1312105308</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Account name</dt>
                  <dd className="font-medium text-foreground mt-0.5">Best Technologies LTD</dd>
                </div>
              </dl>
            </div>

            {/* Signatures */}
            {(invoice.managerSignedBy || invoice.customerSignedBy) && (
              <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t border-border">
                {invoice.managerSignedBy && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Manager
                    </p>
                    <p className="text-sm font-medium text-foreground">{invoice.managerSignedBy}</p>
                    {invoice.managerSignedAt && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(invoice.managerSignedAt)}
                      </p>
                    )}
                  </div>
                )}
                {invoice.customerSignedBy && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Customer
                    </p>
                    <p className="text-sm font-medium text-foreground">{invoice.customerSignedBy}</p>
                    {invoice.customerSignedAt && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(invoice.customerSignedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </article>
        </div>

        {/* Right: payment status (sticky on large screens) */}
        <aside className="w-full lg:w-[420px] xl:w-[480px] shrink-0 print:hidden">
          <div className="lg:sticky lg:top-24">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-primary" />
                  Payment status
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {invoice.balanceDue > 0
                    ? "Record a payment to update the invoice status. Full payment will reduce stock for linked products."
                    : "This invoice is fully paid."}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoice.balanceDue > 0 ? (
                  <>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="paymentAmount" className="text-xs">Amount * (required)</Label>
                        <div className="relative">
                          <Input
                            id="paymentAmount"
                            type="text"
                            inputMode="decimal"
                            value={paymentAmount ? formatAmountDisplay(paymentAmount) : ""}
                            onChange={(e) => handleAmountChange(e, invoice.balanceDue)}
                            placeholder={formatCurrency(invoice.balanceDue)}
                            className="w-full h-9 rounded-md tabular-nums pr-9"
                            disabled={!canManageInvoice}
                            title={!canManageInvoice ? "Manage invoice permission required" : undefined}
                          />
                          {paymentAmount.trim() !== "" && (
                            <button
                              type="button"
                              onClick={() => setPaymentAmount("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                              aria-label="Clear amount"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="paymentReceipt" className="text-xs">
                          Receipt * (required — image or PDF)
                        </Label>
                        <Input
                          key={paymentReceipt ? "has-file" : "no-file"}
                          id="paymentReceipt"
                          type="file"
                          accept={RECEIPT_ACCEPT}
                          onChange={(e) => setPaymentReceipt(e.target.files?.[0] ?? null)}
                          className="w-full h-9 rounded-md text-sm file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary-foreground"
                          disabled={!canManageInvoice}
                          title={!canManageInvoice ? "Manage invoice permission required" : undefined}
                        />
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG or PDF, max {RECEIPT_MAX_MB}MB
                        </p>
                        {paymentReceipt && (
                          <div className="space-y-2">
                            {receiptPreviewUrl ? (
                              <div className="relative rounded-lg border border-border overflow-hidden bg-muted/30">
                                <img
                                  src={receiptPreviewUrl}
                                  alt="Receipt preview"
                                  className="w-full h-40 object-contain object-center"
                                />
                                <button
                                  type="button"
                                  onClick={() => setPaymentReceipt(null)}
                                  className="absolute top-1.5 right-1.5 p-1.5 rounded-md bg-background/90 text-muted-foreground hover:text-foreground hover:bg-muted shadow-sm"
                                  aria-label="Clear receipt"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                                <FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
                                <p className="text-xs text-foreground truncate flex-1 min-w-0" title={paymentReceipt.name}>
                                  {paymentReceipt.name}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setPaymentReceipt(null)}
                                  className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                                  aria-label="Clear receipt"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                            {receiptPreviewUrl && (
                              <p className="text-xs text-muted-foreground truncate" title={paymentReceipt.name}>
                                {paymentReceipt.name}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRecordPayment(true)}
                          disabled={!canManageInvoice || !canRecordPartial || recordPaymentMutation.isPending}
                          className="w-full h-9"
                          title={!canManageInvoice ? "Manage invoice permission required" : undefined}
                        >
                          {recordPaymentMutation.isPending ? "Saving…" : "Record partial payment"}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRecordPayment(false)}
                          disabled={!canManageInvoice || !canMarkFullyPaid || recordPaymentMutation.isPending}
                          className="w-full h-9"
                          title={!canManageInvoice ? "Manage invoice permission required" : undefined}
                        >
                          Mark as fully paid
                        </Button>
                      </div>
                    </div>
                    {(recordPaymentError || recordPaymentMutation.isError) && (
                      <p className="text-sm text-destructive">
                        {recordPaymentError ?? recordPaymentMutation.error?.message}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-primary">
                      Paid — {formatCurrency(invoice.amountPaid ?? 0)} on this invoice.
                    </p>
                    {invoice.status === "paid" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full h-9 gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800 dark:hover:bg-amber-950/50"
                        onClick={() => setShowUnmarkConfirm(true)}
                        disabled={!canManageInvoice || unmarkPaidMutation.isPending}
                        title={!canManageInvoice ? "Manage invoice permission required" : undefined}
                      >
                        <Undo2 className="h-4 w-4" />
                        {unmarkPaidMutation.isPending ? "Reverting…" : "Unmark as paid"}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment history */}
            <Card className="border-border/60 mt-4">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  Payment history
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoice.payments && invoice.payments.length > 0 ? (
                  <div className="overflow-x-auto -mx-1">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border/60 text-left text-muted-foreground">
                          <th className="py-2 pr-2 font-medium w-16">Receipt</th>
                          <th className="py-2 pr-2 font-medium">Amount</th>
                          <th className="py-2 pr-2 font-medium whitespace-nowrap">Date</th>
                          <th className="py-2 pr-2 font-medium">Method</th>
                          <th className="py-2 pr-2 font-medium">Ref</th>
                          <th className="py-2 pr-2 font-medium w-8" aria-label="View" />
                        </tr>
                      </thead>
                      <tbody>
                        {[...invoice.payments]
                          .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
                          .map((p) => {
                            const isImageUrl =
                              p.receiptUrl &&
                              /\.(jpe?g|png|webp|gif)(\?|$)/i.test(p.receiptUrl);
                            return (
                              <tr
                                key={p.id}
                                className="border-b border-border/40 hover:bg-muted/20"
                              >
                                <td className="py-2 pr-2 align-top">
                                  {p.receiptUrl ? (
                                    isImageUrl ? (
                                      <ReceiptThumbnail url={p.receiptUrl} isImage={true} />
                                    ) : (
                                      <a
                                        href={p.receiptUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-12 h-12 rounded border border-border/60 bg-muted/30 items-center justify-center text-muted-foreground"
                                      >
                                        <FileText className="h-5 w-5" />
                                      </a>
                                    )
                                  ) : (
                                    <span className="flex w-12 h-12 rounded border border-border/40 bg-muted/20 items-center justify-center text-muted-foreground">
                                      <FileText className="h-5 w-5" />
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 pr-2 font-medium tabular-nums">
                                  {formatCurrency(p.amount)}
                                </td>
                                <td className="py-2 pr-2 text-muted-foreground whitespace-nowrap text-xs">
                                  {formatDateTime(p.paidAt)}
                                </td>
                                <td className="py-2 pr-2 text-muted-foreground capitalize">
                                  {formatStatus((p.paymentMethod ?? "").replace(/_/g, " "))}
                                </td>
                                <td className="py-2 pr-2 font-mono text-xs text-muted-foreground max-w-[80px] truncate" title={p.reference ?? undefined}>
                                  {p.reference ?? "—"}
                                </td>
                                <td className="py-2 pl-0">
                                  {p.receiptUrl && (
                                    <a
                                      href={p.receiptUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                                    >
                                      View <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No payment history yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>

      {/* Unmark as paid confirmation modal */}
      {typeof document !== "undefined" &&
        showUnmarkConfirm &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !unmarkPaidMutation.isPending && setShowUnmarkConfirm(false)}
              aria-hidden
            />
            <div
              className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="unmark-paid-title"
            >
              <h2 id="unmark-paid-title" className="text-lg font-semibold text-foreground">
                Unmark as paid?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This will set the invoice back to <strong>issued</strong> and restore the stock that was deducted. Only use this if the invoice was marked as paid by mistake. This only works when the invoice was paid via &quot;Mark as fully paid&quot;, not via payment records.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUnmarkConfirm(false)}
                  disabled={unmarkPaidMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => unmarkPaidMutation.mutateAsync()}
                  disabled={unmarkPaidMutation.isPending}
                  className="gap-2"
                >
                  <Undo2 className="h-4 w-4" />
                  {unmarkPaidMutation.isPending ? "Reverting…" : "Unmark as paid"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Delete invoice confirmation modal (10s countdown) */}
      {typeof document !== "undefined" &&
        showDeleteConfirm &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                if (!deleteMutation.isPending) {
                  setShowDeleteConfirm(false);
                  setDeleteCountdown(DELETE_COUNTDOWN_SECONDS);
                }
              }}
              aria-hidden
            />
            <div
              className="relative w-full max-w-md rounded-xl border border-destructive/30 bg-card p-6 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-invoice-title"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id="delete-invoice-title" className="text-lg font-semibold text-foreground">
                    Delete invoice?
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This will <strong>permanently delete</strong> invoice{" "}
                    <span className="font-mono font-medium text-foreground">{invoice.invoiceNumber}</span>.
                    Stock that was reduced by payments will be restored; payment records and receipt files will be removed. This cannot be undone.
                  </p>
                  <p className="mt-4 text-sm font-medium text-foreground">
                    {deleteCountdown > 0
                      ? `You can confirm in ${deleteCountdown} second${deleteCountdown === 1 ? "" : "s"}.`
                      : "You may confirm and delete below."}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteCountdown(DELETE_COUNTDOWN_SECONDS);
                  }}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(undefined as never)}
                  disabled={deleteCountdown > 0 || deleteMutation.isPending}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteMutation.isPending ? "Deleting…" : "Confirm and delete"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
