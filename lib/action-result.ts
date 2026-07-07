// Sunucu aksiyonlarinin (server actions) standart donus tipi.
// ActionForm bu sonucu okuyup kullaniciya toast/hata gosterir.

export type ActionResult = {
  ok: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const idle: ActionResult = { ok: false };

export function ok(message?: string): ActionResult {
  return { ok: true, message };
}

export function fail(error: string, fieldErrors?: Record<string, string>): ActionResult {
  return { ok: false, error, fieldErrors };
}

// Supabase hata nesnelerini kullaniciya uygun mesaja cevir
export function describeError(error: unknown, fallback = "Bir hata olustu. Lütfen tekrar deneyin."): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    const message = String((error as { message: unknown }).message ?? "");
    if (/duplicate key|unique/i.test(message)) return "Bu kayıt zaten mevcut.";
    if (/row-level security|permission|not authorized/i.test(message)) return "Bu işlem için yetkiniz yok.";
    if (/foreign key/i.test(message)) return "İlişkili kayıt bulunamadı.";
    return message || fallback;
  }
  return fallback;
}
