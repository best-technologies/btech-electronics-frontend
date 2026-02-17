import type { ConsignmentSortBy, ConsignmentStatus } from "@/lib/api";

export const CONSIGNMENT_LIST_KEY_PREFIX = "consignment-list";
export const DEFAULT_LIMIT = 20;

export const SORT_OPTIONS: { value: ConsignmentSortBy; label: string }[] = [
  { value: "createdAt", label: "Created" },
  { value: "deliveryDate", label: "Delivery date" },
  { value: "referenceNumber", label: "Reference" },
  { value: "overallTotalCost", label: "Total cost" },
  { value: "status", label: "Status" },
];

export const STATUS_OPTIONS: { value: ConsignmentStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "received", label: "Received" },
  { value: "inspected", label: "Inspected" },
  { value: "available", label: "Available" },
  { value: "partial_out", label: "Partial out" },
  { value: "closed", label: "Closed" },
];

export const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };
