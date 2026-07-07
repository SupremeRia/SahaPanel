"use client";

import { useMemo, useState } from "react";
import { Briefcase, Building2, Pencil, Phone, UsersRound } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { Dialog } from "@/components/modal";
import { SearchInput, Segmented } from "@/components/inputs";
import {
  Avatar,
  Badge,
  EmptyState,
  Field,
  Panel,
  iconButtonClass,
  inputClass,
  secondaryButtonClass,
  selectClass
} from "@/components/ui";
import { updateProfile, updateProfileActive } from "@/app/actions";
import {
  roleLabels,
  userRoles,
  type Department,
  type ProfileWithDepartment,
  type Tone,
  type UserRole
} from "@/lib/types";
import { cn } from "@/lib/utils";

type DepartmentOption = Pick<Department, "id" | "name">;

const roleTone: Record<UserRole, Tone> = {
  admin: "purple",
  team_leader: "blue",
  staff: "neutral"
};

export function PersonnelClient({
  personnel,
  departments,
  canGrantAdmin
}: {
  personnel: ProfileWithDepartment[];
  departments: DepartmentOption[];
  canGrantAdmin: boolean;
}) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [department, setDepartment] = useState<string>("all");
  const [active, setActive] = useState<"all" | "active" | "inactive">("all");

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: personnel.length };
    for (const r of userRoles) base[r] = personnel.filter((person) => person.role === r).length;
    return base;
  }, [personnel]);

  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr");
    return personnel.filter((person) => {
      if (role !== "all" && person.role !== role) return false;
      if (department !== "all" && person.department_id !== department) return false;
      if (active === "active" && !person.is_active) return false;
      if (active === "inactive" && person.is_active) return false;
      if (query) {
        const haystack = `${person.full_name} ${person.title ?? ""} ${person.phone ?? ""}`.toLocaleLowerCase("tr");
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [personnel, search, role, department, active]);

  return (
    <div className="grid gap-4">
      <Panel className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented
            value={role}
            onChange={setRole}
            options={[
              { value: "all", label: "Tümü", count: counts.all },
              ...userRoles.map((r) => ({ value: r, label: roleLabels[r], count: counts[r] }))
            ]}
          />
          <Segmented
            value={active}
            onChange={setActive}
            options={[
              { value: "all", label: "Tümü" },
              { value: "active", label: "Aktif" },
              { value: "inactive", label: "Pasif" }
            ]}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <SearchInput value={search} onChange={setSearch} placeholder="Ad, unvan veya telefon ara..." />
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className={cn(selectClass, "sm:w-56")}
            aria-label="Departmana göre filtrele"
          >
            <option value="all">Tüm departmanlar</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </Panel>

      {visible.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="Personel bulunamadı"
          description="Filtreleri değiştirin ya da yeni bir personel kaydı ekleyin."
        />
      ) : (
        <div className="grid gap-3">
          {visible.map((person) => (
            <Panel key={person.id}>
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar name={person.full_name} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-ink">{person.full_name}</h3>
                      <Badge tone={roleTone[person.role]}>{roleLabels[person.role]}</Badge>
                      <Badge tone={person.is_active ? "green" : "red"} dot>
                        {person.is_active ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-2">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" aria-hidden />
                        {person.departments?.name ?? "Departman yok"}
                      </span>
                      {person.title ? (
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" aria-hidden />
                          {person.title}
                        </span>
                      ) : null}
                      {person.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" aria-hidden />
                          {person.phone}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  <Dialog
                    title="Personeli düzenle"
                    description="Rol, departman ve iletişim bilgilerini güncelleyin."
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
                      <ActionForm action={updateProfile} onSuccess={close} className="grid gap-4">
                        <input type="hidden" name="id" value={person.id} />
                        <Field label="Ad Soyad">
                          <input name="full_name" className={inputClass} defaultValue={person.full_name} required />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Rol">
                            <select name="role" className={selectClass} defaultValue={person.role}>
                              {(canGrantAdmin
                                ? userRoles
                                : Array.from(new Set([...userRoles.filter((r) => r !== "admin"), person.role]))
                              ).map((r) => (
                                <option key={r} value={r}>
                                  {roleLabels[r]}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Departman">
                            <select name="department_id" className={selectClass} defaultValue={person.department_id ?? ""}>
                              <option value="">Seçilmedi</option>
                              {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                  {dept.name}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Unvan">
                            <input name="title" className={inputClass} defaultValue={person.title ?? ""} />
                          </Field>
                          <Field label="Telefon">
                            <input name="phone" className={inputClass} defaultValue={person.phone ?? ""} />
                          </Field>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={close} className={secondaryButtonClass}>
                            Vazgeç
                          </button>
                          <SubmitButton>Kaydet</SubmitButton>
                        </div>
                      </ActionForm>
                    )}
                  </Dialog>

                  <ActionForm action={updateProfileActive}>
                    <input type="hidden" name="profile_id" value={person.id} />
                    <input type="hidden" name="is_active" value={person.is_active ? "false" : "true"} />
                    <SubmitButton variant="secondary" className="min-h-9 px-3">
                      {person.is_active ? "Pasif yap" : "Aktif yap"}
                    </SubmitButton>
                  </ActionForm>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
