// SahaPanel icin elle yazilmis Supabase Database tipi.
// Supabase CLI kullaniyorsan `supabase gen types typescript` ciktisi ile
// degistirebilirsin; supabase/schema.sql ile senkron tutulmalidir.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "admin" | "team_leader" | "staff";
export type TaskStatus = "Bekliyor" | "Yapiliyor" | "Tamamlandi";
export type TaskPriority = "Dusuk" | "Normal" | "Yuksek" | "Acil";
export type FaultStatus = "Acik" | "Servise Bildirildi" | "Cozuldu";
export type FaultCategory = "Pompa" | "Market" | "WC" | "Elektrik" | "Saha" | "Diger";
export type FaultSeverity = "Dusuk" | "Orta" | "Yuksek" | "Kritik";

type Timestamps = { created_at: string; updated_at: string };

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: { id: string; name: string } & Timestamps;
        Insert: { id?: string; name: string; created_at?: string; updated_at?: string };
        Update: { id?: string; name?: string; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: UserRole;
          department_id: string | null;
          title: string | null;
          phone: string | null;
          is_active: boolean;
        } & Timestamps;
        Insert: {
          id: string;
          full_name: string;
          role?: UserRole;
          department_id?: string | null;
          title?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: UserRole;
          department_id?: string | null;
          title?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      announcements: {
        Row: { id: string; title: string; body: string; pinned: boolean; created_by: string } & Timestamps;
        Insert: {
          id?: string;
          title: string;
          body: string;
          pinned?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          pinned?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      announcement_reads: {
        Row: { announcement_id: string; user_id: string; read_at: string };
        Insert: { announcement_id: string; user_id: string; read_at?: string };
        Update: { announcement_id?: string; user_id?: string; read_at?: string };
        Relationships: [];
      };
      shifts: {
        Row: {
          id: string;
          shift_date: string;
          profile_id: string;
          starts_at: string;
          ends_at: string;
          is_leave: boolean;
          note: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          shift_date: string;
          profile_id: string;
          starts_at: string;
          ends_at: string;
          is_leave?: boolean;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shift_date?: string;
          profile_id?: string;
          starts_at?: string;
          ends_at?: string;
          is_leave?: boolean;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          assigned_to: string | null;
          shift_id: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          due_date: string | null;
          completed_at: string | null;
          created_by: string;
        } & Timestamps;
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          assigned_to?: string | null;
          shift_id?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          completed_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          assigned_to?: string | null;
          shift_id?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          completed_at?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      faults: {
        Row: {
          id: string;
          category: FaultCategory;
          description: string;
          photo_url: string | null;
          status: FaultStatus;
          severity: FaultSeverity;
          resolution_note: string | null;
          resolved_at: string | null;
          reported_by: string;
        } & Timestamps;
        Insert: {
          id?: string;
          category: FaultCategory;
          description: string;
          photo_url?: string | null;
          status?: FaultStatus;
          severity?: FaultSeverity;
          resolution_note?: string | null;
          resolved_at?: string | null;
          reported_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: FaultCategory;
          description?: string;
          photo_url?: string | null;
          status?: FaultStatus;
          severity?: FaultSeverity;
          resolution_note?: string | null;
          resolved_at?: string | null;
          reported_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      current_user_role: { Args: Record<string, never>; Returns: UserRole };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_manager: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      task_status: TaskStatus;
      task_priority: TaskPriority;
      fault_status: FaultStatus;
      fault_category: FaultCategory;
      fault_severity: FaultSeverity;
    };
    CompositeTypes: { [_ in never]: never };
  };
}

// Kisayol satir tipleri
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type DepartmentRow = Database["public"]["Tables"]["departments"]["Row"];
export type AnnouncementRow = Database["public"]["Tables"]["announcements"]["Row"];
export type AnnouncementReadRow = Database["public"]["Tables"]["announcement_reads"]["Row"];
export type ShiftRow = Database["public"]["Tables"]["shifts"]["Row"];
export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
export type FaultRow = Database["public"]["Tables"]["faults"]["Row"];
