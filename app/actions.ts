"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { canManageAdmin, canManageOperations } from "@/lib/types";

function value(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === "string" && item.trim() ? item.trim() : null;
}

async function requireOperations() {
  const session = await getCurrentProfile();
  if (!canManageOperations(session.profile?.role)) redirect("/dashboard");
  return session;
}

async function requireAdmin() {
  const session = await getCurrentProfile();
  if (!canManageAdmin(session.profile?.role)) redirect("/dashboard");
  return session;
}

export async function signOut() {
  const { supabase } = await getCurrentProfile();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createAnnouncement(formData: FormData) {
  const { supabase, user } = await requireOperations();
  await supabase.from("announcements").insert({
    title: value(formData, "title"),
    body: value(formData, "body"),
    created_by: user.id
  });
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
}

export async function markAnnouncementRead(formData: FormData) {
  const { supabase, user } = await getCurrentProfile();
  await supabase.from("announcement_reads").upsert({
    announcement_id: value(formData, "announcement_id"),
    user_id: user.id
  });
  revalidatePath("/announcements");
}

export async function createTask(formData: FormData) {
  const { supabase, user } = await requireOperations();
  await supabase.from("tasks").insert({
    title: value(formData, "title"),
    description: value(formData, "description"),
    assigned_to: value(formData, "assigned_to"),
    shift_id: value(formData, "shift_id"),
    due_date: value(formData, "due_date"),
    status: "Bekliyor",
    created_by: user.id
  });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function updateTaskStatus(formData: FormData) {
  const { supabase } = await getCurrentProfile();
  await supabase
    .from("tasks")
    .update({ status: value(formData, "status") })
    .eq("id", value(formData, "task_id"));
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function createFault(formData: FormData) {
  const { supabase, user } = await getCurrentProfile();
  let photoUrl: string | null = null;
  const file = formData.get("photo");

  if (file instanceof File && file.size > 0) {
    const extension = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { data } = await supabase.storage.from("fault-photos").upload(path, file, {
      upsert: false
    });
    if (data?.path) {
      const publicData = supabase.storage.from("fault-photos").getPublicUrl(data.path);
      photoUrl = publicData.data.publicUrl;
    }
  }

  await supabase.from("faults").insert({
    category: value(formData, "category"),
    description: value(formData, "description"),
    status: "Acik",
    photo_url: photoUrl,
    reported_by: user.id
  });
  revalidatePath("/faults");
  revalidatePath("/dashboard");
}

export async function updateFaultStatus(formData: FormData) {
  const { supabase } = await requireOperations();
  await supabase
    .from("faults")
    .update({ status: value(formData, "status") })
    .eq("id", value(formData, "fault_id"));
  revalidatePath("/faults");
  revalidatePath("/dashboard");
}

export async function createShift(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("shifts").insert({
    shift_date: value(formData, "shift_date"),
    profile_id: value(formData, "profile_id"),
    starts_at: value(formData, "starts_at"),
    ends_at: value(formData, "ends_at"),
    is_leave: formData.get("is_leave") === "on",
    note: value(formData, "note")
  });
  revalidatePath("/shifts");
  revalidatePath("/dashboard");
}

export async function createProfile(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("profiles").insert({
    id: value(formData, "id"),
    full_name: value(formData, "full_name"),
    role: value(formData, "role"),
    department_id: value(formData, "department_id"),
    is_active: true
  });
  revalidatePath("/personnel");
  revalidatePath("/admin");
}

export async function updateProfileActive(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("profiles")
    .update({ is_active: formData.get("is_active") === "true" })
    .eq("id", value(formData, "profile_id"));
  revalidatePath("/personnel");
  revalidatePath("/admin");
}

export async function createDepartment(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("departments").insert({ name: value(formData, "name") });
  revalidatePath("/admin");
  revalidatePath("/personnel");
}
