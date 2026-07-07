"use client";

import { Building2, CheckCircle2, Phone, UserCheck } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { Dialog } from "@/components/modal";
import {
  Avatar,
  Badge,
  EmptyState,
  Field,
  Panel,
  dangerButtonClass,
  inputClass,
  secondaryButtonClass,
  selectClass
} from "@/components/ui";
import { approveRegistration, rejectRegistration } from "@/app/actions";
import { roleLabels, userRoles, type Department, type ProfileWithDepartment } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

type DepartmentOption = Pick<Department, "id" | "name">;

export function RegistrationsClient({
  pending,
  departments,
  canGrantAdmin
}: {
  pending: ProfileWithDepartment[];
  departments: DepartmentOption[];
  canGrantAdmin: boolean;
}) {
  const roleOptions = canGrantAdmin ? userRoles : userRoles.filter((role) => role !== "admin");

  if (pending.length === 0) {
    return (
      <EmptyState
        icon={UserCheck}
        title="Bekleyen kayıt yok"
        description="Yeni kayıt talepleri geldiğinde burada görünecek ve onayınızı bekleyecek."
      />
    );
  }

  return (
    <div className="grid gap-3">
      {pending.map((person) => (
        <Panel key={person.id}>
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex min-w-0 items-start gap-3">
              <Avatar name={person.full_name} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-ink">{person.full_name}</h3>
                  <Badge tone="amber" dot>
                    Onay bekliyor
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-2">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" aria-hidden />
                    {person.departments?.name ?? "Departman seçilmedi"}
                  </span>
                  {person.phone ? (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" aria-hidden />
                      {person.phone}
                    </span>
                  ) : null}
                  <span>{timeAgo(person.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:justify-end">
              <Dialog
                title="Kaydı onayla"
                description="Unvanı ve rolü belirleyip kaydı aktifleştirin."
                trigger={(open) => (
                  <button type="button" onClick={open} className={secondaryButtonClass}>
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    Onayla
                  </button>
                )}
              >
                {(close) => (
                  <ActionForm action={approveRegistration} onSuccess={close} className="grid gap-4">
                    <input type="hidden" name="profile_id" value={person.id} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Rol">
                        <select name="role" className={selectClass} defaultValue="staff">
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {roleLabels[role]}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Departman">
                        <select
                          name="department_id"
                          className={selectClass}
                          defaultValue={person.department_id ?? ""}
                        >
                          <option value="">Seçilmedi</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="Unvan" hint="Personelin görünen unvanı (örn. Pompacı, Kasiyer).">
                      <input name="title" className={inputClass} placeholder="İsteğe bağlı" />
                    </Field>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={close} className={secondaryButtonClass}>
                        Vazgeç
                      </button>
                      <SubmitButton icon={CheckCircle2}>Onayla ve aktifleştir</SubmitButton>
                    </div>
                  </ActionForm>
                )}
              </Dialog>

              <Dialog
                title="Kaydı reddet"
                description="Bu kişi giriş yapamaz. İşlemi onaylıyor musunuz?"
                size="sm"
                trigger={(open) => (
                  <button
                    type="button"
                    onClick={open}
                    className={secondaryButtonClass + " hover:border-signal-red/40 hover:text-signal-red"}
                  >
                    Reddet
                  </button>
                )}
              >
                {(close) => (
                  <ActionForm action={rejectRegistration} onSuccess={close}>
                    <input type="hidden" name="profile_id" value={person.id} />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={close} className={secondaryButtonClass}>
                        Vazgeç
                      </button>
                      <SubmitButton variant="danger" className={dangerButtonClass} pendingText="Reddediliyor...">
                        Reddet
                      </SubmitButton>
                    </div>
                  </ActionForm>
                )}
              </Dialog>
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}
