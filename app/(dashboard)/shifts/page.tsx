import { Plus } from "lucide-react";
import { createShift } from "@/app/actions";
import { getCurrentProfile } from "@/lib/auth";
import { canManageAdmin } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Badge, Field, PageHeader, Panel, buttonClass, inputClass } from "@/components/ui";

export default async function ShiftsPage() {
  const { supabase, profile } = await getCurrentProfile();
  const isAdmin = canManageAdmin(profile?.role);
  const query = supabase.from("shifts").select("*, profiles(full_name)").order("shift_date", { ascending: false });
  const { data: shifts } = isAdmin ? await query : await query.eq("profile_id", profile?.id);
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").eq("is_active", true).order("full_name");

  return (
    <div className="grid gap-6">
      <PageHeader title="Vardiyalar" description="Personel bazli calisma, izin ve not bilgilerini takip edin." />

      {isAdmin ? (
        <Panel>
          <form action={createShift} className="grid gap-4 xl:grid-cols-6 xl:items-end">
            <Field label="Tarih">
              <input name="shift_date" type="date" className={inputClass} required />
            </Field>
            <Field label="Personel">
              <select name="profile_id" className={inputClass} required>
                {profiles?.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.full_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Baslangic">
              <input name="starts_at" type="time" className={inputClass} required />
            </Field>
            <Field label="Bitis">
              <input name="ends_at" type="time" className={inputClass} required />
            </Field>
            <Field label="Not">
              <input name="note" className={inputClass} />
            </Field>
            <div className="flex items-center gap-3">
              <label className="flex min-h-10 items-center gap-2 text-sm font-medium text-slate-700">
                <input name="is_leave" type="checkbox" className="h-4 w-4 accent-brand-600" />
                Izinli
              </label>
              <button className={buttonClass}>
                <Plus className="h-4 w-4" aria-hidden />
                Ekle
              </button>
            </div>
          </form>
        </Panel>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {shifts?.map((shift: any) => (
          <Panel key={shift.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">{shift.profiles?.full_name ?? "Personel"}</h2>
                <p className="mt-1 text-sm text-slate-500">{formatDate(shift.shift_date)}</p>
              </div>
              <Badge tone={shift.is_leave ? "amber" : "green"}>{shift.is_leave ? "Izinli" : "Aktif"}</Badge>
            </div>
            <p className="mt-4 text-2xl font-semibold text-ink">
              {shift.starts_at} - {shift.ends_at}
            </p>
            <p className="mt-2 text-sm text-slate-600">{shift.note || "Not yok."}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
