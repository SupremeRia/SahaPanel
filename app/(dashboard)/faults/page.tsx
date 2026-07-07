import { Plus } from "lucide-react";
import { createFault, updateFaultStatus } from "@/app/actions";
import { getCurrentProfile } from "@/lib/auth";
import { canManageOperations, faultCategories, faultStatuses } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { Badge, Field, PageHeader, Panel, buttonClass, inputClass } from "@/components/ui";

export default async function FaultsPage() {
  const { supabase, profile } = await getCurrentProfile();
  const canManage = canManageOperations(profile?.role);
  const { data: faults } = await supabase
    .from("faults")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-6">
      <PageHeader title="Ariza Bildirimleri" description="Sahadan gelen ariza kayitlarini kategori ve durum bazli takip edin." />

      <Panel>
        <form action={createFault} className="grid gap-4 lg:grid-cols-[180px_1fr_220px_auto] lg:items-end">
          <Field label="Kategori">
            <select name="category" className={inputClass} required>
              {faultCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Aciklama">
            <input name="description" className={inputClass} required />
          </Field>
          <Field label="Fotograf">
            <input name="photo" type="file" accept="image/*" className={`${inputClass} p-2`} />
          </Field>
          <button className={buttonClass}>
            <Plus className="h-4 w-4" aria-hidden />
            Bildir
          </button>
        </form>
      </Panel>

      <div className="grid gap-4">
        {faults?.map((fault: any) => (
          <Panel key={fault.id}>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-ink">{fault.category}</h2>
                  <Badge tone={fault.status === "Cozuldu" ? "green" : fault.status === "Servise Bildirildi" ? "blue" : "red"}>
                    {fault.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{fault.description}</p>
                <p className="mt-3 text-xs text-slate-500">
                  Bildiren: {fault.profiles?.full_name ?? "Personel"} - {formatDateTime(fault.created_at)}
                </p>
                {fault.photo_url ? (
                  <a className="mt-2 inline-flex text-sm font-semibold text-brand-700" href={fault.photo_url} target="_blank">
                    Fotograf ac
                  </a>
                ) : null}
              </div>
              {canManage ? (
                <form action={updateFaultStatus} className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                  <input type="hidden" name="fault_id" value={fault.id} />
                  <select name="status" className={inputClass} defaultValue={fault.status}>
                    {faultStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button className={buttonClass}>Guncelle</button>
                </form>
              ) : null}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
