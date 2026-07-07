"use client";

import { Save } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { Field, Panel, SectionTitle, inputClass } from "@/components/ui";
import { updateOwnProfile } from "@/app/actions";

export function ProfileForm({
  fullName,
  title,
  phone
}: {
  fullName: string;
  title: string;
  phone: string;
}) {
  return (
    <Panel className="max-w-2xl">
      <SectionTitle
        title="Bilgilerimi düzenle"
        description="Ad soyad, unvan ve telefon bilgilerinizi güncelleyin."
      />
      <ActionForm action={updateOwnProfile} className="grid gap-4">
        <Field label="Ad Soyad">
          <input name="full_name" className={inputClass} defaultValue={fullName} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Unvan">
            <input name="title" className={inputClass} defaultValue={title} />
          </Field>
          <Field label="Telefon">
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className={inputClass}
              defaultValue={phone}
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <SubmitButton icon={Save}>Kaydet</SubmitButton>
        </div>
      </ActionForm>
    </Panel>
  );
}
