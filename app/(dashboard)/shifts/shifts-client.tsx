"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  ImagePlus,
  Images,
  Pencil,
  Plus,
  StickyNote
} from "lucide-react";
import { ActionForm, DeleteButton, SubmitButton } from "@/components/action-form";
import { Dialog } from "@/components/modal";
import { ImageLightbox } from "@/components/lightbox";
import { SearchInput, Segmented } from "@/components/inputs";
import {
  Badge,
  EmptyState,
  Field,
  Panel,
  SectionTitle,
  buttonClass,
  iconButtonClass,
  inputClass,
  secondaryButtonClass,
  selectClass
} from "@/components/ui";
import {
  createShift,
  createShiftBoard,
  deleteShift,
  deleteShiftBoard,
  updateShift
} from "@/app/actions";
import type { ShiftBoard, ShiftWithRelations } from "@/lib/types";
import { cn, formatDate, formatTime } from "@/lib/utils";

type ProfileOption = { id: string; full_name: string };
type ViewMode = "list" | "calendar";

const trMonthsShort = [
  "Oca",
  "Şub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Ağu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara"
];

const trWeekdays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const fileInputClass =
  "focus-ring w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink transition file:mr-3 file:rounded file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-surface";

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Pazar
  const diff = day === 0 ? -6 : 1 - day; // Pazartesi'ye çek
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shortName(name?: string | null): string {
  if (!name) return "Personel";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export function ShiftsClient({
  shifts,
  profiles,
  boards,
  isManager
}: {
  shifts: ShiftWithRelations[];
  profiles: ProfileOption[];
  boards: ShiftBoard[];
  isManager: boolean;
}) {
  const [view, setView] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [person, setPerson] = useState<string>("all");
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));

  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr");
    return shifts.filter((shift) => {
      if (isManager && person !== "all" && shift.profile_id !== person) return false;
      if (query) {
        const haystack = `${shift.profiles?.full_name ?? ""} ${shift.note ?? ""}`.toLocaleLowerCase("tr");
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [shifts, search, person, isManager]);

  return (
    <div className="grid gap-4">
      <ShiftBoards boards={boards} isManager={isManager} />

      <Panel className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "list", label: "Liste" },
              { value: "calendar", label: "Takvim" }
            ]}
          />
          {isManager ? (
            <Dialog
              title="Yeni vardiya"
              description="Personel için tarih, saat ve izin bilgisi girin."
              trigger={(open) => (
                <button type="button" onClick={open} className={buttonClass}>
                  <Plus className="h-4 w-4" aria-hidden />
                  Yeni vardiya
                </button>
              )}
            >
              {(close) => (
                <ActionForm action={createShift} onSuccess={close} className="grid gap-4">
                  <ShiftFields profiles={profiles} />
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
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <SearchInput value={search} onChange={setSearch} placeholder="Personel veya not ara..." />
          {isManager ? (
            <select
              value={person}
              onChange={(event) => setPerson(event.target.value)}
              className={cn(selectClass, "sm:w-56")}
              aria-label="Personele göre filtrele"
            >
              <option value="all">Tüm personel</option>
              {profiles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.full_name}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </Panel>

      {view === "list" ? (
        <ListView shifts={visible} profiles={profiles} isManager={isManager} />
      ) : (
        <CalendarView
          shifts={visible}
          weekStart={weekStart}
          onPrev={() => setWeekStart((prev) => addDays(prev, -7))}
          onNext={() => setWeekStart((prev) => addDays(prev, 7))}
          onToday={() => setWeekStart(startOfWeek(new Date()))}
        />
      )}
    </div>
  );
}

function ListView({
  shifts,
  profiles,
  isManager
}: {
  shifts: ShiftWithRelations[];
  profiles: ProfileOption[];
  isManager: boolean;
}) {
  if (shifts.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Vardiya bulunamadı"
        description="Filtreleri değiştirin ya da yeni bir vardiya oluşturun."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {shifts.map((shift) => (
        <Panel key={shift.id} className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-ink">
                {shift.profiles?.full_name ?? "Personel"}
              </h3>
              <p className="mt-1 text-sm text-muted">{formatDate(shift.shift_date)}</p>
            </div>
            <Badge tone={shift.is_leave ? "amber" : "green"} dot>
              {shift.is_leave ? "İzinli" : "Vardiyada"}
            </Badge>
          </div>

          <p className="text-2xl font-semibold tabular-nums text-ink">
            {formatTime(shift.starts_at)} - {formatTime(shift.ends_at)}
          </p>

          {shift.note ? (
            <p className="flex items-start gap-1.5 text-sm leading-6 text-muted">
              <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-2" aria-hidden />
              <span className="whitespace-pre-wrap">{shift.note}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-2">Not yok.</p>
          )}

          {shift.photo_url ? (
            <ImageLightbox
              src={shift.photo_url}
              alt={`${shift.profiles?.full_name ?? "Personel"} vardiya görseli`}
              title="Vardiya görseli"
              thumbClassName="h-24 w-full"
            />
          ) : null}

          {isManager ? (
            <div className="mt-auto flex items-center gap-2 border-t border-line pt-3">
              <Dialog
                title="Vardiyayı düzenle"
                description="Vardiya bilgilerini güncelleyin."
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
                  <ActionForm action={updateShift} onSuccess={close} className="grid gap-4">
                    <input type="hidden" name="id" value={shift.id} />
                    <ShiftFields profiles={profiles} shift={shift} />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={close} className={secondaryButtonClass}>
                        Vazgeç
                      </button>
                      <SubmitButton>Kaydet</SubmitButton>
                    </div>
                  </ActionForm>
                )}
              </Dialog>
              <DeleteButton action={deleteShift} fields={{ id: shift.id }} title="Vardiyayı sil" />
            </div>
          ) : null}
        </Panel>
      ))}
    </div>
  );
}

function CalendarView({
  shifts,
  weekStart,
  onPrev,
  onNext,
  onToday
}: {
  shifts: ShiftWithRelations[];
  weekStart: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const todayKey = dateKey(new Date());

  const byDay = useMemo(() => {
    const map = new Map<string, ShiftWithRelations[]>();
    for (const shift of shifts) {
      const list = map.get(shift.shift_date) ?? [];
      list.push(shift);
      map.set(shift.shift_date, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    }
    return map;
  }, [shifts]);

  const weekEnd = addDays(weekStart, 6);
  const label =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${weekStart.getDate()} - ${weekEnd.getDate()} ${trMonthsShort[weekEnd.getMonth()]}`
      : `${weekStart.getDate()} ${trMonthsShort[weekStart.getMonth()]} - ${weekEnd.getDate()} ${trMonthsShort[weekEnd.getMonth()]}`;

  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            className={iconButtonClass}
            aria-label="Önceki hafta"
            title="Önceki hafta"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <span className="min-w-32 text-center text-sm font-semibold text-ink">{label}</span>
          <button
            type="button"
            onClick={onNext}
            className={iconButtonClass}
            aria-label="Sonraki hafta"
            title="Sonraki hafta"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <button type="button" onClick={onToday} className={cn(secondaryButtonClass, "min-h-9 px-3")}>
          Bu hafta
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[46rem] grid-cols-7 gap-2">
          {days.map((day, index) => {
            const key = dateKey(day);
            const isToday = key === todayKey;
            const dayShifts = byDay.get(key) ?? [];
            return (
              <div
                key={key}
                className={cn(
                  "flex min-h-40 flex-col gap-2 rounded-lg border border-line bg-surface-2 p-2",
                  isToday && "border-brand-600 ring-1 ring-brand-600/30"
                )}
              >
                <div className="flex items-baseline justify-between px-0.5">
                  <span className={cn("text-xs font-semibold uppercase", isToday ? "text-brand-700" : "text-muted-2")}>
                    {trWeekdays[index]}
                  </span>
                  <span className={cn("text-sm font-semibold", isToday ? "text-brand-700" : "text-ink")}>
                    {day.getDate()}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {dayShifts.length === 0 ? (
                    <span className="px-0.5 text-xs text-muted-2">—</span>
                  ) : (
                    dayShifts.map((shift) => (
                      <div key={shift.id} className="rounded-md border border-line bg-surface p-1.5 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "h-2 w-2 shrink-0 rounded-full",
                              shift.is_leave ? "bg-amber-500" : "bg-brand-500"
                            )}
                            aria-hidden
                          />
                          <span className="truncate font-medium text-ink" title={shift.profiles?.full_name ?? undefined}>
                            {shortName(shift.profiles?.full_name)}
                          </span>
                          {shift.photo_url ? (
                            <ImageLightbox
                              src={shift.photo_url}
                              alt={`${shift.profiles?.full_name ?? "Personel"} vardiya görseli`}
                              title="Vardiya görseli"
                              trigger={(open) => (
                                <button
                                  type="button"
                                  onClick={open}
                                  className="focus-ring ml-auto shrink-0 rounded p-0.5 text-muted-2 hover:text-ink"
                                  aria-label="Vardiya görselini aç"
                                  title="Vardiya görseli"
                                >
                                  <ImageIcon className="h-3.5 w-3.5" aria-hidden />
                                </button>
                              )}
                            />
                          ) : null}
                        </div>
                        <p className="mt-0.5 pl-3.5 tabular-nums text-muted">
                          {formatTime(shift.starts_at)}-{formatTime(shift.ends_at)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

function ShiftBoards({ boards, isManager }: { boards: ShiftBoard[]; isManager: boolean }) {
  if (!isManager && boards.length === 0) return null;

  return (
    <Panel className="flex flex-col gap-4">
      <SectionTitle
        title="Haftalık Vardiya Planı"
        description="Excel'den oluşturduğunuz haftalık planı görsel olarak paylaşın; küçük resme tıklayınca büyür."
        action={
          isManager ? (
            <Dialog
              title="Vardiya görseli ekle"
              description="Haftalık plan görselini yükleyin (JPG, PNG veya WebP)."
              trigger={(open) => (
                <button type="button" onClick={open} className={buttonClass}>
                  <ImagePlus className="h-4 w-4" aria-hidden />
                  Görsel ekle
                </button>
              )}
            >
              {(close) => (
                <ActionForm action={createShiftBoard} onSuccess={close} className="grid gap-4">
                  <Field label="Başlık" hint="Örn. 12-18 Mayıs Haftası">
                    <input name="title" className={inputClass} placeholder="İsteğe bağlı" />
                  </Field>
                  <Field label="Hafta başlangıcı" hint="İsteğe bağlı">
                    <input name="week_start" type="date" className={inputClass} />
                  </Field>
                  <Field label="Görsel">
                    <input name="image" type="file" accept="image/*" required className={fileInputClass} />
                  </Field>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={close} className={secondaryButtonClass}>
                      Vazgeç
                    </button>
                    <SubmitButton icon={ImagePlus}>Yükle</SubmitButton>
                  </div>
                </ActionForm>
              )}
            </Dialog>
          ) : undefined
        }
      />

      {boards.length === 0 ? (
        <EmptyState
          icon={Images}
          title="Henüz plan görseli yok"
          description="Haftalık vardiya planını görsel olarak yükleyerek ekiple paylaşın."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {boards.map((board) => (
            <div key={board.id} className="flex flex-col gap-2">
              <ImageLightbox
                src={board.image_url}
                alt={board.title ?? "Vardiya planı"}
                title={board.title ?? "Vardiya planı"}
                thumbClassName="aspect-[4/3] w-full"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{board.title ?? "Vardiya planı"}</p>
                  {board.week_start ? (
                    <p className="text-xs text-muted-2">{formatDate(board.week_start)}</p>
                  ) : null}
                </div>
                {isManager ? (
                  <DeleteButton
                    action={deleteShiftBoard}
                    fields={{ id: board.id, image_url: board.image_url }}
                    title="Görseli sil"
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function ShiftFields({
  profiles,
  shift
}: {
  profiles: ProfileOption[];
  shift?: ShiftWithRelations;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tarih">
          <input
            name="shift_date"
            type="date"
            className={inputClass}
            defaultValue={shift?.shift_date ?? ""}
            required
          />
        </Field>
        <Field label="Personel">
          <select name="profile_id" className={selectClass} defaultValue={shift?.profile_id ?? ""} required>
            <option value="" disabled>
              Seçin
            </option>
            {profiles.map((item) => (
              <option key={item.id} value={item.id}>
                {item.full_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Başlangıç">
          <input
            name="starts_at"
            type="time"
            className={inputClass}
            defaultValue={shift ? formatTime(shift.starts_at) : ""}
            required
          />
        </Field>
        <Field label="Bitiş">
          <input
            name="ends_at"
            type="time"
            className={inputClass}
            defaultValue={shift ? formatTime(shift.ends_at) : ""}
            required
          />
        </Field>
      </div>
      <Field label="Not">
        <input name="note" className={inputClass} defaultValue={shift?.note ?? ""} placeholder="İsteğe bağlı" />
      </Field>
      <Field label="Vardiya görseli (isteğe bağlı)" hint="Plan/Excel fotoğrafı ekleyebilirsiniz. JPG, PNG veya WebP.">
        <input name="photo" type="file" accept="image/*" className={fileInputClass} />
      </Field>
      {shift?.photo_url ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 p-2">
          <span className="text-xs text-muted">Bu vardiyada bir görsel yüklü.</span>
          <label className="flex items-center gap-2 text-xs font-medium text-ink">
            <input type="checkbox" name="remove_photo" className="h-4 w-4 rounded border-line accent-brand-600" />
            Görseli kaldır
          </label>
          <input type="hidden" name="photo_url" value={shift.photo_url} />
        </div>
      ) : null}
      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input
          name="is_leave"
          type="checkbox"
          defaultChecked={shift?.is_leave ?? false}
          className="h-4 w-4 rounded border-line accent-brand-600"
        />
        İzinli
      </label>
    </>
  );
}
