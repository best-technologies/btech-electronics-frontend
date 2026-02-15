import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Capitalize first letter of each word (e.g. "john doe" → "John Doe"). */
export function formatWords(value: string): string {
  if (!value?.trim()) return value ?? "";
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/** Format first + last name for display (proper case). */
export function formatFullName(
  firstName?: string | null,
  lastName?: string | null
): string {
  const first = firstName?.trim();
  const last = lastName?.trim();
  if (!first && !last) return "";
  return [formatWords(first ?? ""), formatWords(last ?? "")].filter(Boolean).join(" ");
}

/** Format role for display (e.g. "admin" → "Admin"). */
export function formatRole(role: string): string {
  return formatWords(role ?? "");
}

/** Format status for display (e.g. "active" → "Active"). */
export function formatStatus(status: string): string {
  return formatWords(status ?? "");
}

/** Format ISO date for display (e.g. "2024-01-15T10:30:00Z" → "15 Jan 2024" or localized). */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

/** Format ISO date and time for display. */
export function formatDateTime(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  try {
    const d = new Date(isoDate);
    return d.toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoDate;
  }
}

/** Format number as currency (e.g. 1234.56 → "₦1,234.56" or "1,234.56"). */
export function formatCurrency(
  value: number,
  currency: string = "NGN",
  locale: string = "en-NG"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
