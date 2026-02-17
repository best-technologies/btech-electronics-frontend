import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  received: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  inspected: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
  available: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  partial_out: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  closed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  packing: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800",
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  partial: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  invoice: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  packing_list: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  delivery_note: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
  receipt: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  suspended: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  inactive: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = status?.toLowerCase().replace(/\s+/g, "_") ?? "pending";
  const style = STATUS_STYLES[key] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        style,
        className
      )}
    >
      {status ?? "—"}
    </span>
  );
}
