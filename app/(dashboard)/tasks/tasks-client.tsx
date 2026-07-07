"use client";

import { useMemo, useState } from "react";
import { CalendarClock, ClipboardList, Download, Pencil, Plus, UserRound } from "lucide-react";
import { ActionForm, DeleteButton, SubmitButton } from "@/components/action-form";
import { Dialog } from "@/components/modal";
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
import { createTask, deleteTask, updateTask, updateTaskStatus } from "@/app/actions";
import {
  taskPriorities,
  taskPriorityLabels,
  taskPriorityTone,
  taskStatuses,
  taskStatusLabels,
  taskStatusTone,
  type TaskStatus,
  type TaskWithRelations
} from "@/lib/types";
import { cn, formatDate, formatTime, isOverdue, toCsv } from "@/lib/utils";

type ProfileOption = { id: string; full_name: string };
type ShiftOption = { id: string; shift_date: string; starts_at: string; ends_at: string };

const priorityWeight: Record<string, number> = { Acil: 3, Yuksek: 2, Normal: 1, Dusuk: 0 };

function shiftLabel(shift: ShiftOption) {
  return `${formatDate(shift.shift_date)} · ${formatTime(shift.starts_at)}-${formatTime(shift.ends_at)}`;
}

export function TasksClient({
  tasks,
  profiles,
  shifts,
  canManage,
  currentUserId
}: {
  tasks: TaskWithRelations[];
  profiles: ProfileOption[];
  shifts: ShiftOption[];
  canManage: boolean;
  currentUserId: string;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [assignee, setAssignee] = useState<string>("all");

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: tasks.length };
    for (const s of taskStatuses) base[s] = tasks.filter((task) => task.status === s).length;
    return base;
  }, [tasks]);

  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr");
    return tasks
      .filter((task) => {
        if (status !== "all" && task.status !== status) return false;
        if (assignee !== "all" && task.assigned_to !== assignee) return false;
        if (query) {
          const haystack = `${task.title} ${task.description ?? ""}`.toLocaleLowerCase("tr");
          if (!haystack.includes(query)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aDone = a.status === "Tamamlandi";
        const bDone = b.status === "Tamamlandi";
        if (aDone !== bDone) return aDone ? 1 : -1;
        const aOver = isOverdue(a.due_date, aDone);
        const bOver = isOverdue(b.due_date, bDone);
        if (aOver !== bOver) return aOver ? -1 : 1;
        const weight = (priorityWeight[b.priority] ?? 0) - (priorityWeight[a.priority] ?? 0);
        if (weight !== 0) return weight;
        return (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
      });
  }, [tasks, search, status, assignee]);

  function exportCsv() {
    const rows = visible.map((task) => ({
      Baslik: task.title,
      Aciklama: task.description ?? "",
      Atanan: task.assignee?.full_name ?? "",
      Oncelik: taskPriorityLabels[task.priority],
      Durum: taskStatusLabels[task.status],
      "Son tarih": task.due_date ?? ""
    }));
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gorevler.csv";
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
              ...taskStatuses.map((s) => ({ value: s, label: taskStatusLabels[s], count: counts[s] }))
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={exportCsv} className={cn(secondaryButtonClass, "min-h-9 px-3")}>
              <Download className="h-4 w-4" aria-hidden />
              CSV
            </button>
            {canManage ? (
              <Dialog
                title="Yeni görev"
                description="Görevi personele veya vardiyaya atayın."
                trigger={(open) => (
                  <button type="button" onClick={open} className={buttonClass}>
                    <Plus className="h-4 w-4" aria-hidden />
                    Yeni görev
                  </button>
                )}
              >
                {(close) => (
                  <ActionForm action={createTask} onSuccess={close} className="grid gap-4">
                    <TaskFields profiles={profiles} shifts={shifts} />
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
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <SearchInput value={search} onChange={setSearch} placeholder="Görev ara..." />
          <select
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
            className={cn(selectClass, "sm:w-56")}
            aria-label="Personele göre filtrele"
          >
            <option value="all">Tüm personel</option>
            {profiles.map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name}
              </option>
            ))}
          </select>
        </div>
      </Panel>

      {visible.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Görev bulunamadı"
          description="Filtreleri değiştirin ya da yeni bir görev oluşturun."
        />
      ) : (
        <div className="grid gap-3">
          {visible.map((task) => {
            const overdue = isOverdue(task.due_date, task.status === "Tamamlandi");
            const canUpdate = canManage || task.assigned_to === currentUserId;
            return (
              <Panel key={task.id} className={cn(overdue && "border-signal-red/40")}>
                <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-ink">{task.title}</h3>
                      <Badge tone={taskStatusTone[task.status]} dot>
                        {taskStatusLabels[task.status]}
                      </Badge>
                      <Badge tone={taskPriorityTone[task.priority]}>{taskPriorityLabels[task.priority]}</Badge>
                      {overdue ? <Badge tone="red">Gecikti</Badge> : null}
                    </div>
                    {task.description ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{task.description}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-2">
                      <span className="inline-flex items-center gap-1">
                        <UserRound className="h-3.5 w-3.5" aria-hidden />
                        {task.assignee?.full_name ?? "Vardiya / genel"}
                      </span>
                      <span className={cn("inline-flex items-center gap-1", overdue && "font-semibold text-signal-red dark:text-red-300")}>
                        <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                        Son tarih: {formatDate(task.due_date)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:items-end">
                    {canUpdate ? (
                      <ActionForm action={updateTaskStatus} className="flex items-center gap-2">
                        <input type="hidden" name="task_id" value={task.id} />
                        <select name="status" defaultValue={task.status} className={cn(selectClass, "min-h-9 w-40")}>
                          {taskStatuses.map((s) => (
                            <option key={s} value={s}>
                              {taskStatusLabels[s]}
                            </option>
                          ))}
                        </select>
                        <SubmitButton className="min-h-9 px-3" pendingText="...">
                          Uygula
                        </SubmitButton>
                      </ActionForm>
                    ) : null}
                    {canManage ? (
                      <div className="flex items-center gap-2">
                        <Dialog
                          title="Görevi düzenle"
                          trigger={(open) => (
                            <button type="button" onClick={open} className={iconButtonClass} aria-label="Düzenle" title="Düzenle">
                              <Pencil className="h-4 w-4" aria-hidden />
                            </button>
                          )}
                        >
                          {(close) => (
                            <ActionForm action={updateTask} onSuccess={close} className="grid gap-4">
                              <input type="hidden" name="id" value={task.id} />
                              <TaskFields profiles={profiles} shifts={shifts} task={task} withStatus />
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={close} className={secondaryButtonClass}>
                                  Vazgeç
                                </button>
                                <SubmitButton>Kaydet</SubmitButton>
                              </div>
                            </ActionForm>
                          )}
                        </Dialog>
                        <DeleteButton action={deleteTask} fields={{ id: task.id }} title="Görevi sil" />
                      </div>
                    ) : null}
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TaskFields({
  profiles,
  shifts,
  task,
  withStatus = false
}: {
  profiles: ProfileOption[];
  shifts: ShiftOption[];
  task?: TaskWithRelations;
  withStatus?: boolean;
}) {
  return (
    <>
      <Field label="Görev başlığı">
        <input name="title" className={inputClass} defaultValue={task?.title ?? ""} required />
      </Field>
      <Field label="Açıklama">
        <textarea name="description" className={textareaClass} defaultValue={task?.description ?? ""} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Personel">
          <select name="assigned_to" className={selectClass} defaultValue={task?.assigned_to ?? ""}>
            <option value="">Seçilmedi</option>
            {profiles.map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Öncelik">
          <select name="priority" className={selectClass} defaultValue={task?.priority ?? "Normal"}>
            {taskPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {taskPriorityLabels[priority]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vardiya">
          <select name="shift_id" className={selectClass} defaultValue={task?.shift_id ?? ""}>
            <option value="">Seçilmedi</option>
            {shifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shiftLabel(shift)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Son tarih">
          <input name="due_date" type="date" className={inputClass} defaultValue={task?.due_date ?? ""} />
        </Field>
      </div>
      {withStatus ? (
        <Field label="Durum">
          <select name="status" className={selectClass} defaultValue={task?.status ?? "Bekliyor"}>
            {taskStatuses.map((s) => (
              <option key={s} value={s}>
                {taskStatusLabels[s]}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
    </>
  );
}
