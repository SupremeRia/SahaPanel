"use client";

import Link from "next/link";
import { Building2, Pencil, Plus, UserCheck } from "lucide-react";
import { ActionForm, DeleteButton, SubmitButton } from "@/components/action-form";
import { Dialog } from "@/components/modal";
import {
  EmptyState,
  Field,
  Panel,
  SectionTitle,
  iconButtonClass,
  inputClass,
  secondaryButtonClass
} from "@/components/ui";
import { createDepartment, deleteDepartment, updateDepartment } from "@/app/actions";
import { type Department } from "@/lib/types";

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
        <SectionTitle
          title="Personel kaydı"
          description="Personel artık giriş ekranından kendisi kayıt olur."
        />
        <div className="rounded-lg border border-line bg-surface-2 p-4 text-sm leading-6 text-muted">
          <p>
            Yeni personel, giriş ekranındaki <span className="font-semibold text-ink">Kayıt ol</span> sekmesinden
            e-posta, ad soyad, telefon ve departman bilgisiyle başvurur. Başvurular{" "}
            <span className="font-semibold text-ink">Kayıt İstekleri</span> sekmesine düşer; onayladığınızda unvanı
            belirleyip girişlerini aktifleştirebilirsiniz. Artık elle kullanıcı ID girmenize gerek yok.
          </p>
        </div>
        <Link
          href="/registrations"
          className={secondaryButtonClass + " justify-center"}
        >
          <UserCheck className="h-4 w-4" aria-hidden />
          Kayıt İsteklerine git
        </Link>
      </Panel>
    </div>
  );
}
