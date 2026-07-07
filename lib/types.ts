import type {
  AnnouncementRow,
  DepartmentRow,
  FaultRow,
  ProfileRow,
  ShiftRow,
  TaskRow,
  UserRole,
  TaskStatus,
  TaskPriority,
  FaultStatus,
  FaultCategory,
  FaultSeverity
} from "@/lib/database.types";

export type {
  UserRole,
  TaskStatus,
  TaskPriority,
  FaultStatus,
  FaultCategory,
  FaultSeverity
} from "@/lib/database.types";

export type Profile = ProfileRow;
export type Department = DepartmentRow;

// Ortak tonlar (rozet / uyari renkleri)
export type Tone = "neutral" | "green" | "amber" | "red" | "blue" | "purple";

// ---------------------------------------------------------------------------
// Etiketler (kayitli enum degerleri ASCII, ekranda Turkce gosterilir)
// ---------------------------------------------------------------------------
export const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  team_leader: "Takım Lideri",
  staff: "Personel"
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  Bekliyor: "Bekliyor",
  Yapiliyor: "Yapılıyor",
  Tamamlandi: "Tamamlandı"
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  Dusuk: "Düşük",
  Normal: "Normal",
  Yuksek: "Yüksek",
  Acil: "Acil"
};

export const faultStatusLabels: Record<FaultStatus, string> = {
  Acik: "Açık",
  "Servise Bildirildi": "Servise Bildirildi",
  Cozuldu: "Çözüldü"
};

export const faultCategoryLabels: Record<FaultCategory, string> = {
  Pompa: "Pompa",
  Market: "Market",
  WC: "WC",
  Elektrik: "Elektrik",
  Saha: "Saha",
  Diger: "Diğer"
};

export const faultSeverityLabels: Record<FaultSeverity, string> = {
  Dusuk: "Düşük",
  Orta: "Orta",
  Yuksek: "Yüksek",
  Kritik: "Kritik"
};

// ---------------------------------------------------------------------------
// Tonlar
// ---------------------------------------------------------------------------
export const taskStatusTone: Record<TaskStatus, Tone> = {
  Bekliyor: "amber",
  Yapiliyor: "blue",
  Tamamlandi: "green"
};

export const taskPriorityTone: Record<TaskPriority, Tone> = {
  Dusuk: "neutral",
  Normal: "blue",
  Yuksek: "amber",
  Acil: "red"
};

export const faultStatusTone: Record<FaultStatus, Tone> = {
  Acik: "red",
  "Servise Bildirildi": "blue",
  Cozuldu: "green"
};

export const faultSeverityTone: Record<FaultSeverity, Tone> = {
  Dusuk: "neutral",
  Orta: "blue",
  Yuksek: "amber",
  Kritik: "red"
};

// ---------------------------------------------------------------------------
// Enum listeleri (formlarda ve filtrelerde kullanilir)
// ---------------------------------------------------------------------------
export const userRoles: UserRole[] = ["admin", "team_leader", "staff"];
export const taskStatuses: TaskStatus[] = ["Bekliyor", "Yapiliyor", "Tamamlandi"];
export const taskPriorities: TaskPriority[] = ["Dusuk", "Normal", "Yuksek", "Acil"];
export const faultStatuses: FaultStatus[] = ["Acik", "Servise Bildirildi", "Cozuldu"];
export const faultCategories: FaultCategory[] = ["Pompa", "Market", "WC", "Elektrik", "Saha", "Diger"];
export const faultSeverities: FaultSeverity[] = ["Dusuk", "Orta", "Yuksek", "Kritik"];

// ---------------------------------------------------------------------------
// Rol yetki yardimcilari
// ---------------------------------------------------------------------------
export function canManageOperations(role?: UserRole | null) {
  return role === "admin" || role === "team_leader";
}

export function canManageAdmin(role?: UserRole | null) {
  return role === "admin";
}

// ---------------------------------------------------------------------------
// Iliskili (join) sorgu goruntu tipleri
// ---------------------------------------------------------------------------
export type ProfileName = { full_name: string } | null;

export type ProfileWithDepartment = Profile & {
  departments?: { name: string } | null;
};

export type AnnouncementWithRelations = AnnouncementRow & {
  profiles?: ProfileName;
  announcement_reads?: Array<{ user_id: string; profiles?: ProfileName }>;
};

export type TaskWithRelations = TaskRow & {
  assignee?: ProfileName;
  shifts?: { shift_date: string; starts_at: string; ends_at: string } | null;
};

export type FaultWithRelations = FaultRow & {
  profiles?: ProfileName;
};

export type ShiftWithRelations = ShiftRow & {
  profiles?: ProfileName;
};
