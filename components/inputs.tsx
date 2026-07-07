"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputClass } from "@/components/ui";

export function SearchInput({
  value,
  onChange,
  placeholder = "Ara...",
  className
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(inputClass, "pl-9 pr-9")}
        aria-label={placeholder}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-2 hover:text-ink"
          aria-label="Temizle"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

export type SegmentedOption<T extends string> = { value: T; label: string; count?: number };

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn("inline-flex flex-wrap gap-1 rounded-lg border border-line bg-surface-2 p-1", className)}
      role="tablist"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "focus-ring inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition",
              active ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
            )}
          >
            {option.label}
            {typeof option.count === "number" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs font-semibold",
                  active ? "bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200" : "bg-surface text-muted-2"
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
