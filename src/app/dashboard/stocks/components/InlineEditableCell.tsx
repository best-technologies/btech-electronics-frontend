"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

type CellType = "text" | "number" | "boolean";

interface InlineEditableCellProps {
  value: string | number | boolean | null | undefined;
  type: CellType;
  productId: string;
  field: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (value: string | number | boolean) => void;
  onCancel: () => void;
  disabled?: boolean;
  displayValue?: string;
  className?: string;
  placeholder?: string;
  align?: "left" | "right";
  inputClassName?: string;
}

export function InlineEditableCell({
  value,
  type,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  disabled,
  displayValue,
  className = "",
  placeholder = "",
  align = "left",
  inputClassName = "w-32 min-w-0",
}: InlineEditableCellProps) {
  const [editValue, setEditValue] = useState<string>(() =>
    type === "boolean" ? String(!!value) : value != null ? String(value) : ""
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditValue(type === "boolean" ? String(!!value) : value != null ? String(value) : "");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isEditing, type, value]);

  const hasChange = () => {
    if (type === "boolean") return editValue !== String(!!value);
    if (value == null || value === "") return editValue.trim() !== "";
    return editValue.trim() !== String(value).trim();
  };

  const handleSave = () => {
    if (type === "number") {
      const n = parseFloat(editValue);
      if (Number.isNaN(n)) return;
      onSave(n);
    } else if (type === "boolean") {
      onSave(editValue === "true");
    } else {
      onSave(editValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (hasChange()) handleSave();
      else onCancel();
    }
    if (e.key === "Escape") onCancel();
  };

  const display =
    displayValue !== undefined
      ? displayValue
      : type === "boolean"
        ? value
          ? "Active"
          : "Inactive"
        : value != null && value !== ""
          ? String(value)
          : "—";

  if (!isEditing) {
    const isBooleanActive = type === "boolean" && value;
    return (
      <td
        className={`p-4 cursor-pointer select-none hover:bg-muted/50 rounded-lg transition-colors ${className} ${align === "right" ? "text-right" : ""}`}
        onClick={disabled ? undefined : onStartEdit}
        title="Click to edit"
      >
        {type === "boolean" ? (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              isBooleanActive
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {display}
          </span>
        ) : (
          <span className={value == null || value === "" ? "text-muted-foreground" : ""}>
            {display}
          </span>
        )}
      </td>
    );
  }

  return (
    <td className={`p-4 ${className}`}>
      <div
        className={`flex items-center gap-1.5 ${align === "right" ? "justify-end" : ""}`}
      >
        {type === "boolean" ? (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 rounded-lg border border-input bg-background px-2 text-sm min-w-[100px]"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        ) : (
          <Input
            ref={inputRef}
            type={type === "number" ? "number" : "text"}
            step={type === "number" ? "0.01" : undefined}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`h-8 text-sm rounded-lg ${inputClassName}`}
          />
        )}
        <div className="flex items-center shrink-0 gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
            onClick={handleSave}
            disabled={!hasChange()}
            aria-label="Save"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={onCancel}
            aria-label="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </td>
  );
}
