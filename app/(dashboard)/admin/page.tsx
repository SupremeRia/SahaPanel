import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { createDepartment, createProfile } from "@/app/actions";
import { getCurrentProfile } from "@/lib/auth";
import { canManageAdmin } from "@/lib/types";
import { Field, PageHeader, Panel, buttonClass, inputClass } from "@/components/ui";

export default async function AdminPage() {
  const { supabase, profile } = await getCurrentProfile();
  if (!canManageAdmin(profile?.role)) redirect("/dashboard");
  const { data: departments } = await supabase.from("departments").select("*").order("name");

  return (
    <div className="grid gap-6">
      <PageHeader title="Yetkili Paneli" description="Departman ve personel temel kayitlarini yonetin." />

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <h2 className="text-lg font-semibold text-ink">Departman ekle</h2>
          <form action={createDepartment} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field label="Departman adi">
              <input name="name" className={inputClass} required />
            </Field>
            <button className={buttonClass}>
              <Plus className="h-4 w-4" aria-hidden />
              Ekle
            </button>
          </form>
          <div className="mt-5 flex flex-wrap gap-2">
            {departments?.map((department: any) => (
              <span key={department.id} className="rounded bg-field px-3 py-1 text-sm text-slate-700">
                {department.name}
              </span>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold text-ink">Personel profil kaydi</h2>
          <p className="mt-1 text-sm text-slate-500">
            Supabase Auth kullanicisi olustuktan sonra kullanici ID degeri ile profil kaydi acin.
          </p>
          <form action={createProfile} className="mt-4 grid gap-3">
            <Field label="Auth kullanici ID">
              <input name="id" className={inputClass} required />
            </Field>
            <Field label="Ad Soyad">
              <input name="full_name" className={inputClass} required />
            </Field>
            <Field label="Rol">
              <select name="role" className={inputClass} defaultValue="staff">
                <option value="admin">Admin</option>
                <option value="team_leader">Takim Lideri</option>
                <option value="staff">Personel</option>
              </select>
            </Field>
            <Field label="Departman">
              <select name="department_id" className={inputClass} defaultValue="">
                <option value="">Secilmedi</option>
                {departments?.map((department: any) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </Field>
            <button className={buttonClass}>Personel ekle</button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
