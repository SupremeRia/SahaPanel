// Hafif, bagimliliksiz form dogrulama yardimcilari.

export function getString(formData: FormData, key: string): string | null {
  const item = formData.get(key);
  return typeof item === "string" && item.trim() ? item.trim() : null;
}

export function getBoolean(formData: FormData, key: string): boolean {
  const item = formData.get(key);
  return item === "on" || item === "true" || item === "1";
}

export function getEnum<T extends string>(formData: FormData, key: string, allowed: readonly T[]): T | null {
  const value = getString(formData, key);
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

export type FieldRule = {
  key: string;
  label: string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
};

export function validate(formData: FormData, rules: FieldRule[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const rule of rules) {
    const value = getString(formData, rule.key);
    if (rule.required && !value) {
      errors[rule.key] = `${rule.label} zorunludur.`;
      continue;
    }
    if (value && rule.minLength && value.length < rule.minLength) {
      errors[rule.key] = `${rule.label} en az ${rule.minLength} karakter olmalı.`;
    }
    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors[rule.key] = `${rule.label} en fazla ${rule.maxLength} karakter olabilir.`;
    }
  }
  return errors;
}

// Fotograf yuklemeleri icin dogrulama
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export function validatePhoto(file: File): string | null {
  if (file.size > MAX_PHOTO_BYTES) return "Fotoğraf 5 MB'tan küçük olmalı.";
  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Yalnızca JPEG, PNG veya WebP fotoğraf yükleyebilirsiniz.";
  }
  return null;
}
