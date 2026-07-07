"use client";

import { useMemo, useState } from "react";
import { Download, Pencil, Plus, Siren, UserRound } from "lucide-react";
import { ActionForm, DeleteButton, SubmitButton } from "@/components/action-form";
import { Dialog, Modal, useDisclosure } from "@/components/modal";
import { SearchInput, Segmented } from "@/components/inputs";
import {
  Badge,
  EmptyState,
  Field,
  Panel,
  buttonClass,
  iconButtonClass,
  inputClass,
  secondaryButtonClass,
  selectClass,
  textareaClass
} from "@/components/ui";
import { createFault, deleteFault, updateFault, updateFaultStatus } from "@/app/actions";
import {
  faultCategories,
  faultCategoryLabels,
  faultSeverities,
  faultSeverityLabels,
  faultSeverityTone,
  faultStatuses,
  faultStatusLabels,
  faultStatusTone,
  type FaultCategory,
  type FaultStatus,
  type FaultWithRelations
} from "@/lib/types";
import { cn, formatDate, timeAgo, toCsv } from "@/lib/utils";

const severityWeight: Record<string, number> = { Kritik: 3, Yuksek: 2, Orta: 1, Dusuk: 0 };

export function FaultsClient({
  faults,
  canManage,
  currentUserId
}: {
  faults: FaultWithRelations[];
  canManage: boolean;
  currentUserId: string;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FaultStatus | "all">("all");
  const [category, setCategory] = useState<FaultCategory | "all">("all");

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: faults.length };
    for (const s of faultStatuses) base[s] = faults.filter((fault) => fault.status === s).length;
    return base;
  }, [faults]);

  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr");
    return faults
      .filter((fault) => {
        if (status !== "all" && fault.status !== status) return false;
        if (category !== "all" && fault.category !== category) return false;
        if (query && !fault.description.toLocaleLowerCase("tr").includes(query)) return false;
        return true;
      })
      .sort((a, b) => {
        const aOpen = a.status !== "Cozuldu";
        const bOpen = b.status !== "Cozuldu";
        if (aOpen !== bOpen) return aOpen ? -1 : 1;
        const weight = (severityWeight[b.severity] ?? 0) - (severityWeight[a.severity] ?? 0);
        if (weight !== 0) return weight;
        return (b.created_at ?? "").localeCompare(a.created_at ?? "");
      });
  }, [faults, search, status, category]);

  function exportCsv() {
    const rows = visible.map((fault) => ({
      Kategori: faultCategoryLabels[fault.category],
      Aciklama: fault.description,
      Onem: faultSeverityLabels[fault.severity],
      Durum: faultStatusLabels[fault.status],
      Tarih: formatDate(fault.created_at)
    }));
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "arizalar.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-4">
      <Panel className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "Tümü", count: counts.all },
              ...faultStatuses.map((s) => ({ value: s, label: faultStatusLabels[s], count: counts[s] }))
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={exportCsv} className={cn(secondaryButtonClass, "min-h-9 px-3")}>
              <Download className="h-4 w-4" aria-hidden />
              CSV
            </button>
            <Dialog
              title="Yeni arıza"
              description="Sahada karşılaştığınız arızayı kaydedin."
              trigger={(open) => (
                <button type="button" onClick={open} className={buttonClass}>
                  <Plus className="h-4 w-4" aria-hidden />
                  Yeni arıza
                </button>
              )}
            >
              {(close) => (
                <ActionForm action={createFault} onSuccess={close} className="grid gap-4">
                  <FaultFields withPhoto />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={close} className={secondaryButtonClass}>
                      Vazgeç
                    </button>
                    <SubmitButton icon={Plus}>Bildir</SubmitButton>
                  </div>
                </ActionForm>
              )}
            </Dialog>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <SearchInput value={search} onChange={setSearch} placeholder="Açıklamada ara..." />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as FaultCategory | "all")}
            className={cn(selectClass, "sm:w-56")}
            aria-label="Kategoriye göre filtrele"
          >
            <option value="all">Tüm kategoriler</option>
            {faultCategories.map((c) => (
              <option key={c} value={c}>
                {faultCategoryLabels[c]}
              </option>
            ))}
          </select>
        </div>
      </Panel>

      {visible.length === 0 ? (
        <EmptyState
          icon={Siren}
          title="Arıza kaydı yok"
          description="Filtreleri değiştirin ya da yeni bir arıza bildirin."
        />
      ) : (
        <div className="grid gap-3">
          {visible.map((fault) => (
            <Panel key={fault.id} className={cn(fault.status !== "Cozuldu" && "border-signal-red/40")}>
              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-ink">{faultCategoryLabels[fault.category]}</h3>
                    <Badge tone={faultStatusTone[fault.status]} dot>
                      {faultStatusLabels[fault.status]}
                    </Badge>
                    <Badge tone={faultSeverityTone[fault.severity]}>{faultSeverityLabels[fault.severity]}</Badge>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{fault.description}</p>

                  {fault.photo_url ? (
                    <FaultPhoto src={fault.photo_url} alt={`${faultCategoryLabels[fault.category]} arıza fotoğrafı`} />
                  ) : null}

                  {fault.resolution_note ? (
                    <div className="mt-3 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-muted">
                      <span className="font-semibold text-ink">Çözüm notu:</span> {fault.resolution_note}
                    </div>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-2">
                    <span className="inline-flex items-center gap-1">
                      <UserRound className="h-3.5 w-3.5" aria-hidden />
                      {fault.profiles?.full_name ?? "Personel"}
                      {fault.reported_by === currentUserId ? " · Siz" : ""}
                    </span>
                    <span>{timeAgo(fault.created_at)}</span>
                  </div>
                </div>

                {canManage ? (
                  <div className="flex flex-col gap-2 lg:items-end">
                    <ActionForm action={updateFaultStatus} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="fault_id" value={fault.id} />
                      <select name="status" defaultValue={fault.status} className={cn(selectClass, "min-h-9 w-44")}>
                        {faultStatuses.map((s) => (
                          <option key={s} value={s}>
                            {faultStatusLabels[s]}
                          </option>
                        ))}
                      </select>
                      <input
                        name="resolution_note"
                        defaultValue={fault.resolution_note ?? ""}
                        placeholder="Çözüm notu (opsiyonel)"
                        className={cn(inputClass, "min-h-9 w-52")}
                      />
                      <SubmitButton className="min-h-9 px-3" pendingText="...">
                        Uygula
                      </SubmitButton>
                    </ActionForm>

                    <div className="flex items-center gap-2">
                      <Dialog
                        title="Arızayı düzenle"
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
                          <ActionForm action={updateFault} onSuccess={close} className="grid gap-4">
                            <input type="hidden" name="id" value={fault.id} />
                            <FaultFields fault={fault} withStatus />
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={close} className={secondaryButtonClass}>
                                Vazgeç
                              </button>
                              <SubmitButton>Kaydet</SubmitButton>
                            </div>
                          </ActionForm>
                        )}
                      </Dialog>
                      <DeleteButton
                        action={deleteFault}
                        fields={{ id: fault.id, photo_url: fault.photo_url ?? "" }}
                        title="Arıza kaydını sil"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

function FaultPhoto({ src, alt }: { src: string; alt: string }) {
  const { open, onOpen, onClose } = useDisclosure();
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="focus-ring mt-3 inline-flex overflow-hidden rounded-lg border border-line"
        aria-label="Fotoğrafı büyüt"
        title="Fotoğrafı büyüt"
      >
        {/* Kullanici tarafindan yuklenen dinamik Supabase URL'si; next/image uygun degil */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="h-16 w-16 rounded object-cover" />
      </button>
      <Modal open={open} onClose={onClose} title="Arıza fotoğrafı" size="lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="mx-auto max-h-[70vh] w-auto rounded-lg object-contain"
        />
        <div className="mt-4 flex justify-end">
          <a href={src} target="_blank" rel="noreferrer" className={secondaryButtonClass}>
            Yeni sekmede aç
          </a>
        </div>
      </Modal>
    </>
  );
}

function FaultFields({
  fault,
  withStatus = false,
  withPhoto = false
}: {
  fault?: FaultWithRelations;
  withStatus?: boolean;
  withPhoto?: boolean;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kategori">
          <select name="category" className={selectClass} defaultValue={fault?.category ?? "Pompa"} required>
            {faultCategories.map((c) => (
              <option key={c} value={c}>
                {faultCategoryLabels[c]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Önem">
          <select name="severity" className={selectClass} defaultValue={fault?.severity ?? "Orta"}>
            {faultSeverities.map((s) => (
              <option key={s} value={s}>
                {faultSeverityLabels[s]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Açıklama">
        <textarea name="description" className={textareaClass} defaultValue={fault?.description ?? ""} required />
      </Field>
      {withPhoto ? (
        <Field label="Fotoğraf" hint="İsteğe bağlı — arızayı gösteren bir görsel ekleyebilirsiniz.">
          <input name="photo" type="file" accept="image/*" className={cn(inputClass, "p-2")} />
        </Field>
      ) : null}
      {withStatus ? (
        <>
          <Field label="Durum">
            <select name="status" className={selectClass} defaultValue={fault?.status ?? "Acik"}>
              {faultStatuses.map((s) => (
                <option key={s} value={s}>
                  {faultStatusLabels[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Çözüm notu">
            <textarea name="resolution_note" className={textareaClass} defaultValue={fault?.resolution_note ?? ""} />
          </Field>
        </>
      ) : null}
    </>
  );
}
