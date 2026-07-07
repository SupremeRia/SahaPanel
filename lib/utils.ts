export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

// "5 saat once" gibi goreli zaman
export function timeAgo(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value).getTime();
  const diff = date - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("tr-TR", { numeric: "auto" });
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60]
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return "az önce";
}

// HH:MM formatina indir (Postgres time "08:00:00" -> "08:00")
export function formatTime(value?: string | null) {
  if (!value) return "-";
  return value.slice(0, 5);
}

export function initials(name?: string | null) {
  if (!name) return "SP";
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Son tarihi gecmis ve tamamlanmamis gorevler icin
export function isOverdue(dueDate?: string | null, done = false) {
  if (!dueDate || done) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}

// Gunun saatine gore selamlama
export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 6) return "İyi geceler";
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}

// Basit CSV uretimi (Excel/Sheets uyumlu, UTF-8 BOM ile)
export function toCsv(rows: Array<Record<string, unknown>>, headers?: string[]) {
  if (rows.length === 0) return "";
  const cols = headers ?? Object.keys(rows[0]);
  const escape = (val: unknown) => {
    const str = val == null ? "" : String(val);
    return /[",\n;]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const head = cols.join(";");
  const body = rows.map((row) => cols.map((col) => escape(row[col])).join(";")).join("\n");
  return `﻿${head}\n${body}`;
}

export function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : plural ?? singular}`;
}
