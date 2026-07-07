"use client";

import { useMemo, useState } from "react";
import { Bell, CheckCircle2, Pencil, Pin, PinOff, Plus } from "lucide-react";
import { ActionForm, DeleteButton, SubmitButton } from "@/components/action-form";
import { Dialog } from "@/components/modal";
import { SearchInput, Segmented } from "@/components/inputs";
import {
  Badge,
  EmptyState,
  Field,
  Panel,
  ProgressBar,
  buttonClass,
  ghostButtonClass,
  iconButtonClass,
  inputClass,
  secondaryButtonClass,
  textareaClass
} from "@/components/ui";
import {
  createAnnouncement,
  deleteAnnouncement,
  markAnnouncementRead,
  toggleAnnouncementPin,
  unmarkAnnouncementRead,
  updateAnnouncement
} from "@/app/actions";
import { type AnnouncementWithRelations } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

type Filter = "all" | "unread" | "pinned";

export function AnnouncementsClient({
  announcements,
  canManage,
  currentUserId,
  totalActive
}: {
  announcements: AnnouncementWithRelations[];
  canManage: boolean;
  currentUserId: string;
  totalActive: number;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const hasRead = (announcement: AnnouncementWithRelations) =>
    (announcement.announcement_reads ?? []).some((read) => read.user_id === currentUserId);

  const counts = useMemo(
    () => ({
      all: announcements.length,
      unread: announcements.filter((a) => !hasRead(a)).length,
      pinned: announcements.filter((a) => a.pinned).length
    }),
    [announcements] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr");
    return announcements
      .filter((announcement) => {
        if (filter === "unread" && hasRead(announcement)) return false;
        if (filter === "pinned" && !announcement.pinned) return false;
        if (query) {
          const haystack = `${announcement.title} ${announcement.body ?? ""}`.toLocaleLowerCase("tr");
          if (!haystack.includes(query)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return (b.created_at ?? "").localeCompare(a.created_at ?? "");
      });
  }, [announcements, search, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid gap-4">
      <Panel className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "Tümü", count: counts.all },
              { value: "unread", label: "Okunmamış", count: counts.unread },
              { value: "pinned", label: "Sabitli", count: counts.pinned }
            ]}
          />
          {canManage ? (
            <Dialog
              title="Yeni duyuru"
              description="Ekibe iletmek istediğiniz duyuruyu yazın."
              trigger={(open) => (
                <button type="button" onClick={open} className={buttonClass}>
                  <Plus className="h-4 w-4" aria-hidden />
                  Yeni duyuru
                </button>
              )}
            >
              {(close) => (
                <ActionForm action={createAnnouncement} onSuccess={close} className="grid gap-4">
                  <AnnouncementFields />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={close} className={secondaryButtonClass}>
                      Vazgeç
                    </button>
                    <SubmitButton icon={Plus}>Oluştur</SubmitButton>
                  </div>
                </ActionForm>
              )}
            </Dialog>
          ) : null}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Duyuru ara..." />
      </Panel>

      {visible.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Duyuru bulunamadı"
          description="Filtreleri değiştirin ya da yeni bir duyuru oluşturun."
        />
      ) : (
        <div className="grid gap-3">
          {visible.map((announcement) => {
            const reads = announcement.announcement_reads ?? [];
            const read = hasRead(announcement);
            const readerNames = reads
              .map((r) => r.profiles?.full_name)
              .filter((name): name is string => Boolean(name));

            return (
              <Panel key={announcement.id} className={announcement.pinned ? "border-signal-purple/30" : undefined}>
                <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-ink">{announcement.title}</h2>
                      {announcement.pinned ? (
                        <Badge tone="purple">
                          <Pin className="h-3 w-3" aria-hidden />
                          Sabitli
                        </Badge>
                      ) : null}
                      {read ? <Badge tone="green">Okundu</Badge> : <Badge tone="amber">Bekliyor</Badge>}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{announcement.body}</p>
                    <p className="mt-3 text-xs text-muted-2">
                      {announcement.profiles?.full_name ?? "Yetkili"} · {timeAgo(announcement.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-2 lg:items-end">
                    {read ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 dark:text-brand-200">
                          <CheckCircle2 className="h-4 w-4" aria-hidden />
                          Okundu
                        </span>
                        <ActionForm action={unmarkAnnouncementRead}>
                          <input type="hidden" name="announcement_id" value={announcement.id} />
                          <SubmitButton variant="secondary" className={ghostButtonClass} pendingText="...">
                            Geri al
                          </SubmitButton>
                        </ActionForm>
                      </div>
                    ) : (
                      <ActionForm action={markAnnouncementRead}>
                        <input type="hidden" name="announcement_id" value={announcement.id} />
                        <SubmitButton icon={CheckCircle2} pendingText="...">
                          Okudum
                        </SubmitButton>
                      </ActionForm>
                    )}

                    {canManage ? (
                      <div className="flex items-center gap-2">
                        <Dialog
                          title="Duyuruyu düzenle"
                          trigger={(open) => (
                            <button
                              type="button"
                              onClick={open}
                              className={iconButtonClass}
                              aria-label="Düzenle"
                              title="Düzenle"
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                            </button>
                          )}
                        >
                          {(close) => (
                            <ActionForm action={updateAnnouncement} onSuccess={close} className="grid gap-4">
                              <input type="hidden" name="id" value={announcement.id} />
                              <AnnouncementFields announcement={announcement} />
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={close} className={secondaryButtonClass}>
                                  Vazgeç
                                </button>
                                <SubmitButton>Kaydet</SubmitButton>
                              </div>
                            </ActionForm>
                          )}
                        </Dialog>
                        <ActionForm action={toggleAnnouncementPin}>
                          <input type="hidden" name="id" value={announcement.id} />
                          <input type="hidden" name="pinned" value={String(announcement.pinned)} />
                          <SubmitButton
                            variant="secondary"
                            className={iconButtonClass}
                            pendingText=""
                            icon={announcement.pinned ? PinOff : Pin}
                          >
                            <span className="sr-only">
                              {announcement.pinned ? "Sabitlemeyi kaldır" : "Sabitle"}
                            </span>
                          </SubmitButton>
                        </ActionForm>
                        <DeleteButton action={deleteAnnouncement} fields={{ id: announcement.id }} title="Duyuruyu sil" />
                      </div>
                    ) : null}
                  </div>
                </div>

                {canManage ? (
                  <div className="mt-4 border-t border-line pt-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-2">Okuyanlar</p>
                      <span className="text-xs font-medium text-muted">
                        {reads.length} / {totalActive} okudu
                      </span>
                    </div>
                    <ProgressBar value={reads.length} max={totalActive} />
                    <p className="mt-2 text-sm text-muted">
                      {readerNames.length ? readerNames.join(", ") : "Henüz okuyan yok."}
                    </p>
                  </div>
                ) : null}
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AnnouncementFields({ announcement }: { announcement?: AnnouncementWithRelations }) {
  return (
    <>
      <Field label="Başlık">
        <input name="title" className={inputClass} defaultValue={announcement?.title ?? ""} required />
      </Field>
      <Field label="Duyuru metni">
        <textarea name="body" className={textareaClass} defaultValue={announcement?.body ?? ""} required />
      </Field>
      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input
          type="checkbox"
          name="pinned"
          defaultChecked={announcement?.pinned ?? false}
          className="focus-ring h-4 w-4 rounded border-line text-brand-600"
        />
        <span className="inline-flex items-center gap-1.5">
          <Pin className="h-4 w-4 text-muted-2" aria-hidden />
          Sabitle
        </span>
      </label>
    </>
  );
}
