"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; message: string };

type ToastContextValue = {
  toast: (kind: ToastKind, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast, ToastProvider icinde kullanilmalidir.");
  return ctx;
}

const config: Record<ToastKind, { icon: React.ElementType; className: string; iconClass: string }> = {
  success: {
    icon: CheckCircle2,
    className: "border-brand-500/30",
    iconClass: "text-brand-600 dark:text-brand-300"
  },
  error: {
    icon: TriangleAlert,
    className: "border-signal-red/30",
    iconClass: "text-signal-red dark:text-red-300"
  },
  info: {
    icon: Info,
    className: "border-signal-blue/30",
    iconClass: "text-signal-blue dark:text-sky-300"
  }
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const remove = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((kind: ToastKind, message: string) => {
    counter.current += 1;
    const id = counter.current;
    setItems((current) => [...current, { id, kind, message }]);
  }, []);

  const value: ToastContextValue = {
    toast,
    success: (message) => toast("success", message),
    error: (message) => toast("error", message),
    info: (message) => toast("info", message)
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:bottom-4 sm:right-4 sm:left-auto sm:items-end">
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onClose={() => remove(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const { icon: Icon, className, iconClass } = config[item.kind];

  useEffect(() => {
    const timer = setTimeout(onClose, 4200);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-lg border bg-surface px-4 py-3 shadow-pop",
        className
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} aria-hidden />
      <p className="flex-1 text-sm font-medium text-ink">{item.message}</p>
      <button
        type="button"
        onClick={onClose}
        className="focus-ring -m-1 rounded p-1 text-muted-2 transition hover:text-ink"
        aria-label="Kapat"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
