import { CheckCircle2, Plus } from "lucide-react";
import { createAnnouncement, markAnnouncementRead } from "@/app/actions";
import { getCurrentProfile } from "@/lib/auth";
import { canManageOperations } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { Badge, Field, PageHeader, Panel, buttonClass, inputClass, secondaryButtonClass } from "@/components/ui";

export default async function AnnouncementsPage() {
  const { supabase, user, profile } = await getCurrentProfile();
  const canManage = canManageOperations(profile?.role);
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*, profiles(full_name), announcement_reads(user_id, profiles(full_name))")
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-6">
      <PageHeader title="Duyurular" description="Okundu bilgisi takip edilen resmi ekip duyurulari." />

      {canManage ? (
        <Panel>
          <form action={createAnnouncement} className="grid gap-4 lg:grid-cols-[1fr_2fr_auto] lg:items-end">
            <Field label="Baslik">
              <input name="title" className={inputClass} required />
            </Field>
            <Field label="Duyuru metni">
              <textarea name="body" className={`${inputClass} min-h-10`} required />
            </Field>
            <button className={buttonClass}>
              <Plus className="h-4 w-4" aria-hidden />
              Olustur
            </button>
          </form>
        </Panel>
      ) : null}

      <div className="grid gap-4">
        {announcements?.map((announcement: any) => {
          const reads = announcement.announcement_reads ?? [];
          const hasRead = reads.some((read: any) => read.user_id === user.id);

          return (
            <Panel key={announcement.id}>
              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-ink">{announcement.title}</h2>
                    {hasRead ? <Badge tone="green">Okundu</Badge> : <Badge tone="amber">Bekliyor</Badge>}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{announcement.body}</p>
                  <p className="mt-3 text-xs text-slate-400">
                    {announcement.profiles?.full_name ?? "Yetkili"} - {formatDateTime(announcement.created_at)}
                  </p>
                </div>
                <form action={markAnnouncementRead}>
                  <input type="hidden" name="announcement_id" value={announcement.id} />
                  <button className={hasRead ? secondaryButtonClass : buttonClass}>
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    Okudum
                  </button>
                </form>
              </div>
              {canManage ? (
                <div className="mt-4 border-t border-line pt-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">Okuyanlar</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {reads.length
                      ? reads.map((read: any) => read.profiles?.full_name ?? "Personel").join(", ")
                      : "Henuz okuyan yok."}
                  </p>
                </div>
              ) : null}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
