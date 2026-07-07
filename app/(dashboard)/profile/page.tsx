import { LogOut, UserRound } from "lucide-react";
import { signOut } from "@/app/actions";
import { getCurrentProfile } from "@/lib/auth";
import { roleLabels } from "@/lib/types";
import { Avatar, PageHeader, Panel, dangerButtonClass } from "@/components/ui";
import { ProfileForm } from "./profile-client";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const { user, profile } = await getCurrentProfile();

  const details: { label: string; value: string }[] = [
    { label: "Rol", value: profile?.role ? roleLabels[profile.role] : "-" },
    { label: "Departman", value: profile?.departments?.name ?? "-" },
    { label: "Unvan", value: profile?.title ?? "-" },
    { label: "Telefon", value: profile?.phone ?? "-" }
  ];

  return (
    <div className="grid gap-6">
      <PageHeader
        icon={UserRound}
        title="Profil"
        description="Hesap, rol ve iletişim bilgilerinizi görüntüleyip güncelleyin."
      />

      <Panel className="max-w-2xl">
        <div className="flex items-center gap-4">
          <Avatar name={profile?.full_name} size="lg" />
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-ink">
              {profile?.full_name ?? "Panel kullanıcısı"}
            </h2>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {details.map((item) => (
            <div key={item.label} className="rounded-md border border-line bg-surface-2/60 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-2">{item.label}</dt>
              <dd className="mt-1 text-sm text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>

        <form action={signOut} className="mt-6 border-t border-line pt-5">
          <button className={dangerButtonClass}>
            <LogOut className="h-4 w-4" aria-hidden />
            Çıkış yap
          </button>
        </form>
      </Panel>

      <ProfileForm
        fullName={profile?.full_name ?? ""}
        title={profile?.title ?? ""}
        phone={profile?.phone ?? ""}
      />
    </div>
  );
}
