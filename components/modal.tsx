"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial);
  return {
    open,
    onOpen: useCallback(() => setOpen(true), []),
    onClose: useCallback(() => setOpen(false), []),
    onToggle: useCallback(() => setOpen((value) => !value), [])
  };
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md"
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 animate-overlay-in bg-ink/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 max-h-[90vh] w-full animate-slide-up overflow-y-auto rounded-t-2xl border border-line bg-surface shadow-pop sm:rounded-2xl",
          sizes[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring -m-1 rounded-md p-1.5 text-muted-2 transition hover:bg-surface-2 hover:text-ink"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// Kendi acilma durumunu yoneten pratik sarmalayici.
// children bir fonksiyondur ve modali kapatmak icin `close` alir.
export function Dialog({
  trigger,
  title,
  description,
  size,
  children
}: {
  trigger: (open: () => void) => React.ReactNode;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  children: (close: () => void) => React.ReactNode;
}) {
  const { open, onOpen, onClose } = useDisclosure();
  return (
    <>
      {trigger(onOpen)}
      <Modal open={open} onClose={onClose} title={title} description={description} size={size}>
        {children(onClose)}
      </Modal>
    </>
  );
}
