"use client";

import { Building2, Pencil, Plus, UserPlus } from "lucide-react";
import { ActionForm, DeleteButton, SubmitButton } from "@/components/action-form";
import { Dialog } from "@/components/modal";
import {
  EmptyState,
  Field,
  Panel,
  SectionTitle,
  iconButtonClass,
  inputClass,
  secondaryButtonClass,
  selectClass
} from "@/components/ui";
import { createDepartment, createProfile, deleteDepartment, updateDepartment } from "@/app/actions";
import { roleLabels, userRoles, type Department } from "@/lib/types";

export function AdminClient({ departments }: { departments: Department[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel className="flex flex-col gap-4">
        <SectionTitle title="Departmanlar" description="Personelin bağlı olduğu departmanları tanımlayın." />

        <ActionForm
          action={createDepartment}
          resetOnSuccess
          successMessage="Departman eklendi."
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <Field label="Departman adı">
            <input name="name" className={inputClass} placeholder="Örn. Pompa" required />
          </Field>
          <SubmitButton icon={Plus} className="sm:min-w-28">
            Ekle
          </SubmitButton>
        </ActionForm>

        {departments.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Departman yok"
            description="Yukarıdaki alandan ilk departmanı ekleyin."
          />
        ) : (
          <ul className="grid gap-2">
            {departments.map((department) => (
              <li
                key={department.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2"
              >
                <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
                  <Building2 className="h-4 w-4 text-muted-2" aria-hidden />
                  {department.name}
                </span>
                <div className="flex items-center gap-2">
                  <Dialog
                    title="Departmanı düzenle"
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
                      <ActionForm action={updateDepartment} onSuccess={close} className="grid gap-4">
                        <input type="hidden" name="id" value={department.id} />
                        <Field label="Departman adı">
                          <input name="name" className={inputClass} defaultValue={department.name} required />
                        </Field>
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={close} className={secondaryButtonClass}>
                            Vazgeç
                          </button>
                          <SubmitButton>Kaydet</SubmitButton>
                        </div>
                      </ActionForm>
                    )}
                  </Dialog>
                  <DeleteButton action={deleteDepartment} fields={{ id: department.id }} title="Departmanı sil" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel className="flex flex-col gap-4">
        <SectionTitle title="Personel profil kaydı" description="Mevcut bir kimlik için profil oluşturun." />
        <p className="text-sm text-muted">
          Supabase Auth kullanıcısı oluşturduktan sonra kullanıcı ID&apos;si ile profil kaydı açın.
        </p>

        <ActionForm
          action={createProfile}
          resetOnSuccess
          successMessage="Personel kaydı oluşturuldu."
          className="grid gap-4"
        >
          <Field label="Auth kullanıcı ID">
            <input name="id" className={inputClass} placeholder="00000000-0000-0000-0000-000000000000" required />
          </Field>
          <Field label="Ad Soyad">
            <input name="full_name" className={inputClass} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Rol">
              <select name="role" className={selectClass} defaultValue="staff">
                {userRoles.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Departman">
              <select name="department_id" className={selectClass} defaultValue="">
                <option value="">Seçilmedi</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Unvan">
              <input name="title" className={inputClass} />
            </Field>
            <Field label="Telefon">
              <input name="phone" className={inputClass} />
            </Field>
          </div>
          <div className="flex justify-end">
            <SubmitButton icon={UserPlus}>Personel ekle</SubmitButton>
          </div>
        </ActionForm>
      </Panel>
    </div>
  );
}
