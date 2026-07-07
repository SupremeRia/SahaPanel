"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/toast";
import { Modal, useDisclosure } from "@/components/modal";
import { buttonClass, dangerButtonClass, iconButtonClass, secondaryButtonClass } from "@/components/ui";
import { idle, type ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";

type ServerAction = (state: ActionResult, formData: FormData) => Promise<ActionResult>;

export function ActionForm({
  action,
  children,
  className,
  successMessage,
  resetOnSuccess = false,
  onSuccess
}: {
  action: ServerAction;
  children: React.ReactNode;
  className?: string;
  successMessage?: string;
  resetOnSuccess?: boolean;
  onSuccess?: () => void;
}) {
  const [state, formAction] = useActionState(action, idle);
  const { success, error } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const handled = useRef<ActionResult | null>(null);

  useEffect(() => {
    if (state === idle || state === handled.current) return;
    handled.current = state;
    if (state.ok) {
      const message = state.message ?? successMessage;
      if (message) success(message);
      if (resetOnSuccess) formRef.current?.reset();
      onSuccess?.();
    } else if (state.error) {
      error(state.error);
    }
  }, [state, success, error, successMessage, resetOnSuccess, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className={className}>
      {children}
    </form>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function SubmitButton({
  children,
  className,
  pendingText = "Kaydediliyor...",
  icon: Icon,
  variant = "primary"
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
  icon?: React.ElementType;
  variant?: "primary" | "secondary" | "danger";
}) {
  const { pending } = useFormStatus();
  const base =
    variant === "secondary" ? secondaryButtonClass : variant === "danger" ? dangerButtonClass : buttonClass;

  return (
    <button type="submit" disabled={pending} className={cn(base, className)} aria-busy={pending}>
      {pending ? <Spinner /> : Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
      {pending ? pendingText : children}
    </button>
  );
}

// Onayli silme: tetik butonu + onay modali + gizli alanlar
export function DeleteButton({
  action,
  fields,
  title = "Kaydı sil",
  message = "Bu işlem geri alınamaz. Devam etmek istiyor musunuz?",
  triggerLabel,
  triggerClassName,
  confirmLabel = "Sil"
}: {
  action: ServerAction;
  fields: Record<string, string>;
  title?: string;
  message?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  confirmLabel?: string;
}) {
  const { open, onOpen, onClose } = useDisclosure();
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className={cn(triggerClassName ?? iconButtonClass, "hover:border-signal-red/40 hover:text-signal-red")}
        aria-label={triggerLabel ?? title}
        title={triggerLabel ?? title}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        {triggerLabel}
      </button>
      <Modal open={open} onClose={onClose} title={title} description={message} size="sm">
        <ActionForm action={action} onSuccess={onClose} successMessage="Kayıt silindi.">
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className={secondaryButtonClass}>
              Vazgeç
            </button>
            <SubmitButton variant="danger" pendingText="Siliniyor...">
              {confirmLabel}
            </SubmitButton>
          </div>
        </ActionForm>
      </Modal>
    </>
  );
}
