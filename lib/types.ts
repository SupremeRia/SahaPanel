export type UserRole = "admin" | "team_leader" | "staff";

export type TaskStatus = "Bekliyor" | "Yapiliyor" | "Tamamlandi";
export type FaultStatus = "Acik" | "Servise Bildirildi" | "Cozuldu";
export type FaultCategory = "Pompa" | "Market" | "WC" | "Elektrik" | "Saha" | "Diger";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  department_id: string | null;
  is_active: boolean;
  created_at: string;
};

export type Department = {
  id: string;
  name: string;
  created_at: string;
};

export const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  team_leader: "Takim Lideri",
  staff: "Personel"
};

export const taskStatuses: TaskStatus[] = ["Bekliyor", "Yapiliyor", "Tamamlandi"];
export const faultStatuses: FaultStatus[] = ["Acik", "Servise Bildirildi", "Cozuldu"];
export const faultCategories: FaultCategory[] = ["Pompa", "Market", "WC", "Elektrik", "Saha", "Diger"];

export function canManageOperations(role?: UserRole | null) {
  return role === "admin" || role === "team_leader";
}

export function canManageAdmin(role?: UserRole | null) {
  return role === "admin";
}
