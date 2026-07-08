"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import {
  canManageAdmin,
  canManageOperations,
  faultCategories,
  faultSeverities,
  faultStatuses,
  taskPriorities,
  taskStatuses,
  userRoles
} from "@/lib/types";
import { describeError, fail, ok, type ActionResult } from "@/lib/action-result";
import { getBoolean, getEnum, getString, validatePhoto } from "@/lib/validation";

// ---------------------------------------------------------------------------
// Yetki koruma yardimcilari
// ---------------------------------------------------------------------------
type Session = Awaited<ReturnType<typeof getCurrentProfile>>;

async function ensure(kind: "auth" | "ops" | "admin"): Promise<{ session: Session; denied: ActionResult | null }> {
  const session = await getCurrentProfile();
  const role = session.profile?.role;
  if (kind === "admin" && !canManageAdmin(role)) {
    return { session, denied: fail("Bu işlem için yönetici yetkisi gerekli.") };
  }
  if (kind === "ops" && !canManageOperations(role)) {
    return { session, denied: fail("Bu işlem için yetkiniz bulunmuyor.") };
  }
  return { session, denied: null };
}

async function attempt(
  fn: () => PromiseLike<{ error: unknown }>,
  successMessage: string,
  paths: string[]
): Promise<ActionResult> {
  try {
    const { error } = await fn();
    if (error) return fail(describeError(error));
    paths.forEach((path) => revalidatePath(path));
    return ok(successMessage);
  } catch (error) {
    return fail(describeError(error));
  }
}

// Ortak gorsel yukleme (arıza/vardiya fotolari). Basarida herkese acik URL doner.
async function uploadImage(
  supabase: Session["supabase"],
  bucket: string,
  userId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  const photoError = validatePhoto(file);
  if (photoError) return { error: photoError };
  const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) return { error: "Görsel yüklenemedi: " + describeError(error) };
  return { url: data?.path ? supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl : undefined };
}

// Herkese acik URL'den depo icindeki obje yolunu cikar (best-effort silme icin).
function storagePathFromUrl(url: string, bucket: string): string | null {
  const marker = `/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

// ---------------------------------------------------------------------------
// Kimlik
// ---------------------------------------------------------------------------
export async function signOut() {
  const { supabase } = await getCurrentProfile();
  await supabase.auth.signOut();
  redirect("/login");
}

// ---------------------------------------------------------------------------
// Duyurular
// ---------------------------------------------------------------------------
export async function createAnnouncement(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const title = getString(formData, "title");
  const body = getString(formData, "body");
  if (!title || !body) {
    return fail("Başlık ve duyuru metni zorunludur.", {
      title: !title ? "Başlık zorunludur." : "",
      body: !body ? "Duyuru metni zorunludur." : ""
    });
  }
  return attempt(
    () =>
      session.supabase.from("announcements").insert({
        title,
        body,
        pinned: getBoolean(formData, "pinned"),
        created_by: session.user.id
      }),
    "Duyuru oluşturuldu.",
    ["/announcements", "/dashboard"]
  );
}

export async function updateAnnouncement(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const id = getString(formData, "id");
  const title = getString(formData, "title");
  const body = getString(formData, "body");
  if (!id) return fail("Kayıt bulunamadı.");
  if (!title || !body) return fail("Başlık ve duyuru metni zorunludur.");
  return attempt(
    () =>
      session.supabase
        .from("announcements")
        .update({ title, body, pinned: getBoolean(formData, "pinned") })
        .eq("id", id),
    "Duyuru güncellendi.",
    ["/announcements", "/dashboard"]
  );
}

export async function toggleAnnouncementPin(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const id = getString(formData, "id");
  if (!id) return fail("Kayıt bulunamadı.");
  const pinned = getBoolean(formData, "pinned");
  return attempt(
    () => session.supabase.from("announcements").update({ pinned: !pinned }).eq("id", id),
    pinned ? "Sabitleme kaldırıldı." : "Duyuru sabitlendi.",
    ["/announcements", "/dashboard"]
  );
}

export async function deleteAnnouncement(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const id = getString(formData, "id");
  if (!id) return fail("Kayıt bulunamadı.");
  return attempt(
    () => session.supabase.from("announcements").delete().eq("id", id),
    "Duyuru silindi.",
    ["/announcements", "/dashboard"]
  );
}

export async function markAnnouncementRead(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session } = await ensure("auth");
  const announcementId = getString(formData, "announcement_id");
  if (!announcementId) return fail("Kayıt bulunamadı.");
  return attempt(
    () =>
      session.supabase
        .from("announcement_reads")
        .upsert({ announcement_id: announcementId, user_id: session.user.id }),
    "Okundu olarak işaretlendi.",
    ["/announcements", "/dashboard"]
  );
}

export async function unmarkAnnouncementRead(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session } = await ensure("auth");
  const announcementId = getString(formData, "announcement_id");
  if (!announcementId) return fail("Kayıt bulunamadı.");
  return attempt(
    () =>
      session.supabase
        .from("announcement_reads")
        .delete()
        .eq("announcement_id", announcementId)
        .eq("user_id", session.user.id),
    "Okundu işareti kaldırıldı.",
    ["/announcements", "/dashboard"]
  );
}

// ---------------------------------------------------------------------------
// Gorevler
// ---------------------------------------------------------------------------
export async function createTask(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const title = getString(formData, "title");
  if (!title) return fail("Görev başlığı zorunludur.", { title: "Görev başlığı zorunludur." });
  return attempt(
    () =>
      session.supabase.from("tasks").insert({
        title,
        description: getString(formData, "description"),
        assigned_to: getString(formData, "assigned_to"),
        shift_id: getString(formData, "shift_id"),
        due_date: getString(formData, "due_date"),
        priority: getEnum(formData, "priority", taskPriorities) ?? "Normal",
        status: "Bekliyor",
        created_by: session.user.id
      }),
    "Görev oluşturuldu.",
    ["/tasks", "/dashboard"]
  );
}

export async function updateTask(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const id = getString(formData, "id");
  const title = getString(formData, "title");
  if (!id) return fail("Kayıt bulunamadı.");
  if (!title) return fail("Görev başlığı zorunludur.");
  return attempt(
    () =>
      session.supabase
        .from("tasks")
        .update({
          title,
          description: getString(formData, "description"),
          assigned_to: getString(formData, "assigned_to"),
          shift_id: getString(formData, "shift_id"),
          due_date: getString(formData, "due_date"),
          priority: getEnum(formData, "priority", taskPriorities) ?? "Normal",
          status: getEnum(formData, "status", taskStatuses) ?? "Bekliyor"
        })
        .eq("id", id),
    "Görev güncellendi.",
    ["/tasks", "/dashboard"]
  );
}

export async function updateTaskStatus(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session } = await ensure("auth");
  const id = getString(formData, "task_id");
  const status = getEnum(formData, "status", taskStatuses);
  if (!id || !status) return fail("Geçersiz durum.");
  return attempt(
    () => session.supabase.from("tasks").update({ status }).eq("id", id),
    "Görev durumu güncellendi.",
    ["/tasks", "/dashboard"]
  );
}

export async function deleteTask(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const id = getString(formData, "id");
  if (!id) return fail("Kayıt bulunamadı.");
  return attempt(
    () => session.supabase.from("tasks").delete().eq("id", id),
    "Görev silindi.",
    ["/tasks", "/dashboard"]
  );
}

// ---------------------------------------------------------------------------
// Arizalar
// ---------------------------------------------------------------------------
export async function createFault(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session } = await ensure("auth");
  const { supabase, user } = session;
  const category = getEnum(formData, "category", faultCategories);
  const description = getString(formData, "description");
  if (!category || !description) {
    return fail("Kategori ve açıklama zorunludur.", {
      description: !description ? "Açıklama zorunludur." : ""
    });
  }

  let photoUrl: string | null = null;
  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    const photoError = validatePhoto(file);
    if (photoError) return fail(photoError, { photo: photoError });
    const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { data, error: uploadError } = await supabase.storage
      .from("fault-photos")
      .upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (uploadError) return fail("Fotoğraf yüklenemedi: " + describeError(uploadError));
    if (data?.path) {
      photoUrl = supabase.storage.from("fault-photos").getPublicUrl(data.path).data.publicUrl;
    }
  }

  return attempt(
    () =>
      supabase.from("faults").insert({
        category,
        description,
        severity: getEnum(formData, "severity", faultSeverities) ?? "Orta",
        status: "Acik",
        photo_url: photoUrl,
        reported_by: user.id
      }),
    "Arıza bildirimi oluşturuldu.",
    ["/faults", "/dashboard"]
  );
}

export async function updateFault(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const id = getString(formData, "id");
  const description = getString(formData, "description");
  const category = getEnum(formData, "category", faultCategories);
  if (!id) return fail("Kayıt bulunamadı.");
  if (!category || !description) return fail("Kategori ve açıklama zorunludur.");
  return attempt(
    () =>
      session.supabase
        .from("faults")
        .update({
          category,
          description,
          severity: getEnum(formData, "severity", faultSeverities) ?? "Orta",
          status: getEnum(formData, "status", faultStatuses) ?? "Acik",
          resolution_note: getString(formData, "resolution_note")
        })
        .eq("id", id),
    "Arıza güncellendi.",
    ["/faults", "/dashboard"]
  );
}

export async function updateFaultStatus(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const id = getString(formData, "fault_id");
  const status = getEnum(formData, "status", faultStatuses);
  if (!id || !status) return fail("Geçersiz durum.");
  return attempt(
    () =>
      session.supabase
        .from("faults")
        .update({ status, resolution_note: getString(formData, "resolution_note") })
        .eq("id", id),
    "Arıza durumu güncellendi.",
    ["/faults", "/dashboard"]
  );
}

export async function deleteFault(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const id = getString(formData, "id");
  if (!id) return fail("Kayıt bulunamadı.");

  // Fotografi de temizlemeye calis (best-effort)
  const photoUrl = getString(formData, "photo_url");
  if (photoUrl) {
    const marker = "/fault-photos/";
    const index = photoUrl.indexOf(marker);
    if (index !== -1) {
      const objectPath = decodeURIComponent(photoUrl.slice(index + marker.length));
      await session.supabase.storage.from("fault-photos").remove([objectPath]);
    }
  }

  return attempt(
    () => session.supabase.from("faults").delete().eq("id", id),
    "Arıza kaydı silindi.",
    ["/faults", "/dashboard"]
  );
}

// ---------------------------------------------------------------------------
// Vardiyalar
// ---------------------------------------------------------------------------
export async function createShift(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const shiftDate = getString(formData, "shift_date");
  const profileId = getString(formData, "profile_id");
  const startsAt = getString(formData, "starts_at");
  const endsAt = getString(formData, "ends_at");
  if (!shiftDate || !profileId || !startsAt || !endsAt) {
    return fail("Tarih, personel, başlangıç ve bitiş zorunludur.");
  }

  let photoUrl: string | null = null;
  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadImage(session.supabase, "shift-photos", session.user.id, file);
    if (upload.error) return fail(upload.error, { photo: upload.error });
    photoUrl = upload.url ?? null;
  }

  return attempt(
    () =>
      session.supabase.from("shifts").insert({
        shift_date: shiftDate,
        profile_id: profileId,
        starts_at: startsAt,
        ends_at: endsAt,
        is_leave: getBoolean(formData, "is_leave"),
        note: getString(formData, "note"),
        photo_url: photoUrl
      }),
    "Vardiya eklendi.",
    ["/shifts", "/dashboard"]
  );
}

export async function updateShift(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const id = getString(formData, "id");
  const shiftDate = getString(formData, "shift_date");
  const profileId = getString(formData, "profile_id");
  const startsAt = getString(formData, "starts_at");
  const endsAt = getString(formData, "ends_at");
  if (!id) return fail("Kayıt bulunamadı.");
  if (!shiftDate || !profileId || !startsAt || !endsAt) {
    return fail("Tarih, personel, başlangıç ve bitiş zorunludur.");
  }

  // Mevcut fotografi koru; yeni foto yuklenirse degistir; "kaldir" isaretliyse sil.
  let photoUrl = getString(formData, "photo_url");
  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadImage(session.supabase, "shift-photos", session.user.id, file);
    if (upload.error) return fail(upload.error, { photo: upload.error });
    photoUrl = upload.url ?? photoUrl;
  } else if (getBoolean(formData, "remove_photo")) {
    photoUrl = null;
  }

  return attempt(
    () =>
      session.supabase
        .from("shifts")
        .update({
          shift_date: shiftDate,
          profile_id: profileId,
          starts_at: startsAt,
          ends_at: endsAt,
          is_leave: getBoolean(formData, "is_leave"),
          note: getString(formData, "note"),
          photo_url: photoUrl
        })
        .eq("id", id),
    "Vardiya güncellendi.",
    ["/shifts", "/dashboard"]
  );
}

export async function deleteShift(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const id = getString(formData, "id");
  if (!id) return fail("Kayıt bulunamadı.");
  return attempt(
    () => session.supabase.from("shifts").delete().eq("id", id),
    "Vardiya silindi.",
    ["/shifts", "/dashboard"]
  );
}

// ---------------------------------------------------------------------------
// Vardiya görselleri (haftalık plan — Excel çıktısı/fotoğraf)
// ---------------------------------------------------------------------------
export async function createShiftBoard(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return fail("Görsel zorunludur.", { image: "Bir görsel seçin." });
  }
  const upload = await uploadImage(session.supabase, "shift-photos", session.user.id, file);
  if (upload.error) return fail(upload.error, { image: upload.error });
  if (!upload.url) return fail("Görsel yüklenemedi.");

  const imageUrl = upload.url;
  return attempt(
    () =>
      session.supabase.from("shift_boards").insert({
        title: getString(formData, "title"),
        week_start: getString(formData, "week_start"),
        image_url: imageUrl,
        created_by: session.user.id
      }),
    "Vardiya görseli eklendi.",
    ["/shifts", "/dashboard"]
  );
}

export async function deleteShiftBoard(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const id = getString(formData, "id");
  if (!id) return fail("Kayıt bulunamadı.");

  const imageUrl = getString(formData, "image_url");
  if (imageUrl) {
    const objectPath = storagePathFromUrl(imageUrl, "shift-photos");
    if (objectPath) await session.supabase.storage.from("shift-photos").remove([objectPath]);
  }

  return attempt(
    () => session.supabase.from("shift_boards").delete().eq("id", id),
    "Vardiya görseli silindi.",
    ["/shifts", "/dashboard"]
  );
}

// ---------------------------------------------------------------------------
// Personel & profil
// ---------------------------------------------------------------------------
export async function updateProfile(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const id = getString(formData, "id");
  const fullName = getString(formData, "full_name");
  const role = getEnum(formData, "role", userRoles) ?? "staff";
  if (!id || !fullName) return fail("Kullanıcı ve ad soyad zorunludur.");

  // Admin olmayan yetkili, bir admin'i düzenleyemez veya admin rolü atayamaz.
  // (DB guard bunu zaten engeller; burada net bir uyarı vererek yanıltıcı
  // "başarılı" mesajını önlüyoruz.)
  if (!canManageAdmin(session.profile?.role)) {
    if (role === "admin") return fail("Admin rolünü yalnızca admin atayabilir.");
    const { data: target } = await session.supabase.from("profiles").select("role").eq("id", id).maybeSingle();
    if (target?.role === "admin") return fail("Bir yöneticiyi yalnızca admin düzenleyebilir.");
  }

  return attempt(
    () =>
      session.supabase
        .from("profiles")
        .update({
          full_name: fullName,
          role,
          department_id: getString(formData, "department_id"),
          title: getString(formData, "title"),
          phone: getString(formData, "phone")
        })
        .eq("id", id),
    "Personel güncellendi.",
    ["/personnel", "/admin"]
  );
}

export async function updateProfileActive(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const id = getString(formData, "profile_id");
  if (!id) return fail("Kayıt bulunamadı.");
  const isActive = getBoolean(formData, "is_active");

  // Admin olmayan yetkili, bir admin'in aktiflik durumunu değiştiremez.
  if (!canManageAdmin(session.profile?.role)) {
    const { data: target } = await session.supabase.from("profiles").select("role").eq("id", id).maybeSingle();
    if (target?.role === "admin") return fail("Bir yöneticinin durumunu yalnızca admin değiştirebilir.");
  }

  return attempt(
    () => session.supabase.from("profiles").update({ is_active: isActive }).eq("id", id),
    isActive ? "Personel aktifleştirildi." : "Personel pasifleştirildi.",
    ["/personnel", "/admin"]
  );
}

// ---------------------------------------------------------------------------
// Kayıt istekleri (self-servis kayıt onayı) — yetkili = admin veya takım lideri
// ---------------------------------------------------------------------------
// RPC "başarılı" dönse bile satır güncellenmemiş olabilir (ör. şema eski, kayıt
// zaten işlenmiş). Onayın gerçekten veritabanına yazıldığını okuyarak doğrula.
async function verifyRegistrationStatus(
  session: Session,
  target: string,
  expected: "approved" | "rejected"
): Promise<ActionResult | null> {
  const { data, error } = await session.supabase
    .from("profiles")
    .select("registration_status")
    .eq("id", target)
    .maybeSingle();
  if (error) return fail(describeError(error));
  if (!data) return fail("Kullanıcı profili bulunamadı.");
  if (data.registration_status !== expected) {
    return fail(
      "İşlem veritabanına kaydedilemedi. Kayıt onay bekliyor durumunda olmayabilir veya Supabase şeması güncel değil; " +
        "lütfen supabase/schema.sql dosyasını Supabase SQL editöründe yeniden çalıştırın."
    );
  }
  return null;
}

export async function approveRegistration(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const target = getString(formData, "profile_id");
  if (!target) return fail("Kayıt bulunamadı.");
  const role = getEnum(formData, "role", userRoles) ?? "staff";
  try {
    const { error } = await session.supabase.rpc("approve_registration", {
      target,
      new_role: role,
      dept: getString(formData, "department_id"),
      new_title: getString(formData, "title")
    });
    if (error) return fail(describeError(error));
    const notApplied = await verifyRegistrationStatus(session, target, "approved");
    if (notApplied) return notApplied;
  } catch (error) {
    return fail(describeError(error));
  }
  ["/registrations", "/personnel", "/admin", "/dashboard"].forEach((path) => revalidatePath(path));
  return ok("Kayıt onaylandı; personel artık giriş yapabilir.");
}

export async function rejectRegistration(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const target = getString(formData, "profile_id");
  if (!target) return fail("Kayıt bulunamadı.");
  try {
    const { error } = await session.supabase.rpc("reject_registration", { target });
    if (error) return fail(describeError(error));
    const notApplied = await verifyRegistrationStatus(session, target, "rejected");
    if (notApplied) return notApplied;
  } catch (error) {
    return fail(describeError(error));
  }
  ["/registrations", "/dashboard"].forEach((path) => revalidatePath(path));
  return ok("Kayıt reddedildi.");
}

export async function updateOwnProfile(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session } = await ensure("auth");
  const fullName = getString(formData, "full_name");
  if (!fullName) return fail("Ad soyad zorunludur.", { full_name: "Ad soyad zorunludur." });
  return attempt(
    () =>
      session.supabase
        .from("profiles")
        .update({
          full_name: fullName,
          title: getString(formData, "title"),
          phone: getString(formData, "phone")
        })
        .eq("id", session.user.id),
    "Profiliniz güncellendi.",
    ["/profile", "/dashboard"]
  );
}

// ---------------------------------------------------------------------------
// Departmanlar
// ---------------------------------------------------------------------------
export async function createDepartment(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const name = getString(formData, "name");
  if (!name) return fail("Departman adı zorunludur.", { name: "Departman adı zorunludur." });
  return attempt(
    () => session.supabase.from("departments").insert({ name }),
    "Departman eklendi.",
    ["/admin", "/personnel"]
  );
}

export async function updateDepartment(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const id = getString(formData, "id");
  const name = getString(formData, "name");
  if (!id || !name) return fail("Departman adı zorunludur.");
  return attempt(
    () => session.supabase.from("departments").update({ name }).eq("id", id),
    "Departman güncellendi.",
    ["/admin", "/personnel"]
  );
}

export async function deleteDepartment(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { session, denied } = await ensure("ops");
  if (denied) return denied;
  const id = getString(formData, "id");
  if (!id) return fail("Kayıt bulunamadı.");
  return attempt(
    () => session.supabase.from("departments").delete().eq("id", id),
    "Departman silindi.",
    ["/admin", "/personnel"]
  );
}
