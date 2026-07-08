-- SahaPanel veritabani semasi (v2)
-- Bu dosya Supabase SQL editorunde bastan calistirilabilir; tekrar calistirmaya
-- karsi guvenli olmasi icin idempotent (if not exists / drop policy) yazilmistir.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enum tipleri
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'team_leader', 'staff');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type public.task_status as enum ('Bekliyor', 'Yapiliyor', 'Tamamlandi');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type public.task_priority as enum ('Dusuk', 'Normal', 'Yuksek', 'Acil');
  end if;
  if not exists (select 1 from pg_type where typname = 'fault_status') then
    create type public.fault_status as enum ('Acik', 'Servise Bildirildi', 'Cozuldu');
  end if;
  if not exists (select 1 from pg_type where typname = 'fault_category') then
    create type public.fault_category as enum ('Pompa', 'Market', 'WC', 'Elektrik', 'Saha', 'Diger');
  end if;
  if not exists (select 1 from pg_type where typname = 'fault_severity') then
    create type public.fault_severity as enum ('Dusuk', 'Orta', 'Yuksek', 'Kritik');
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- Tablolar
-- ---------------------------------------------------------------------------
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'staff',
  department_id uuid references public.departments(id) on delete set null,
  title text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  pinned boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcement_reads (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  shift_date date not null,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  starts_at time not null,
  ends_at time not null,
  is_leave boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assigned_to uuid references public.profiles(id) on delete set null,
  shift_id uuid references public.shifts(id) on delete set null,
  status public.task_status not null default 'Bekliyor',
  priority public.task_priority not null default 'Normal',
  due_date date,
  completed_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faults (
  id uuid primary key default gen_random_uuid(),
  category public.fault_category not null,
  description text not null,
  photo_url text,
  status public.fault_status not null default 'Acik',
  severity public.fault_severity not null default 'Orta',
  resolution_note text,
  resolved_at timestamptz,
  reported_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mevcut kurulumlara yeni kolonlari guvenle ekle
alter table public.departments add column if not exists updated_at timestamptz not null default now();
alter table public.profiles add column if not exists title text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.announcements add column if not exists pinned boolean not null default false;
alter table public.announcements add column if not exists updated_at timestamptz not null default now();
alter table public.shifts add column if not exists updated_at timestamptz not null default now();
alter table public.tasks add column if not exists priority public.task_priority not null default 'Normal';
alter table public.tasks add column if not exists completed_at timestamptz;
alter table public.tasks add column if not exists updated_at timestamptz not null default now();
alter table public.faults add column if not exists severity public.fault_severity not null default 'Orta';
alter table public.faults add column if not exists resolution_note text;
alter table public.faults add column if not exists resolved_at timestamptz;
alter table public.faults add column if not exists updated_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- Indeksler
-- ---------------------------------------------------------------------------
create index if not exists profiles_department_id_idx on public.profiles(department_id);
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists announcements_created_at_idx on public.announcements(created_at desc);
create index if not exists announcement_reads_user_id_idx on public.announcement_reads(user_id);
create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);
create index if not exists tasks_shift_id_idx on public.tasks(shift_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists faults_reported_by_idx on public.faults(reported_by);
create index if not exists faults_status_idx on public.faults(status);
create index if not exists faults_category_idx on public.faults(category);
create index if not exists shifts_profile_id_idx on public.shifts(profile_id);
create index if not exists shifts_shift_date_idx on public.shifts(shift_date);

-- ---------------------------------------------------------------------------
-- Yardimci fonksiyonlar ve tetikleyiciler
-- ---------------------------------------------------------------------------

-- updated_at kolonunu her guncellemede otomatik tazele
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['departments','profiles','announcements','shifts','tasks','faults']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end$$;

-- Tamamlanma / cozulme zaman damgalarini otomatik yonet
create or replace function public.stamp_task_completion()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'Tamamlandi' and (old.status is distinct from 'Tamamlandi') then
    new.completed_at := now();
  elsif new.status <> 'Tamamlandi' then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists stamp_task_completion on public.tasks;
create trigger stamp_task_completion before update on public.tasks
for each row execute function public.stamp_task_completion();

create or replace function public.stamp_fault_resolution()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'Cozuldu' and (old.status is distinct from 'Cozuldu') then
    new.resolved_at := now();
  elsif new.status <> 'Cozuldu' then
    new.resolved_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists stamp_fault_resolution on public.faults;
create trigger stamp_fault_resolution before update on public.faults
for each row execute function public.stamp_fault_resolution();

-- Yeni Auth kullanicisi olusunca otomatik personel profili ac (varsayilan: staff)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    'staff'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Yetki yukseltmeyi engelle: admin olmayan kullanici kendi rolunu/departmanini/
-- aktifligini degistiremez.
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.is_active := old.is_active;
    new.department_id := old.department_id;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_privileges on public.profiles;
create trigger guard_profile_privileges before update on public.profiles
for each row execute function public.guard_profile_privileges();

-- ---------------------------------------------------------------------------
-- Rol yardimci fonksiyonlari
-- ---------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'admin'
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('admin', 'team_leader')
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.announcements enable row level security;
alter table public.announcement_reads enable row level security;
alter table public.tasks enable row level security;
alter table public.faults enable row level security;
alter table public.shifts enable row level security;

-- Departments
drop policy if exists "Authenticated users can read departments" on public.departments;
create policy "Authenticated users can read departments"
on public.departments for select to authenticated using (true);

drop policy if exists "Admins can manage departments" on public.departments;
create policy "Admins can manage departments"
on public.departments for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Profiles
drop policy if exists "Users can read active profiles" on public.profiles;
create policy "Users can read active profiles"
on public.profiles for select to authenticated
using (is_active = true or public.is_admin() or id = auth.uid());

drop policy if exists "Admins can insert profiles" on public.profiles;
create policy "Admins can insert profiles"
on public.profiles for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
on public.profiles for update to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Kullanici kendi profilini guncelleyebilir (rol/aktiflik trigger ile korunur)
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Admins can delete profiles" on public.profiles;
create policy "Admins can delete profiles"
on public.profiles for delete to authenticated using (public.is_admin());

-- Announcements
drop policy if exists "Authenticated users can read announcements" on public.announcements;
create policy "Authenticated users can read announcements"
on public.announcements for select to authenticated using (true);

drop policy if exists "Managers can create announcements" on public.announcements;
create policy "Managers can create announcements"
on public.announcements for insert to authenticated
with check (public.is_manager() and created_by = auth.uid());

drop policy if exists "Managers can update announcements" on public.announcements;
create policy "Managers can update announcements"
on public.announcements for update to authenticated
using (public.is_manager()) with check (public.is_manager());

drop policy if exists "Managers can delete announcements" on public.announcements;
create policy "Managers can delete announcements"
on public.announcements for delete to authenticated using (public.is_manager());

-- Announcement reads
drop policy if exists "Users can read announcement reads" on public.announcement_reads;
create policy "Users can read announcement reads"
on public.announcement_reads for select to authenticated
using (user_id = auth.uid() or public.is_manager());

drop policy if exists "Users can mark announcement read" on public.announcement_reads;
create policy "Users can mark announcement read"
on public.announcement_reads for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "Users can update own read record" on public.announcement_reads;
create policy "Users can update own read record"
on public.announcement_reads for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Users can remove own read record" on public.announcement_reads;
create policy "Users can remove own read record"
on public.announcement_reads for delete to authenticated using (user_id = auth.uid());

-- Tasks
drop policy if exists "Managers can read all tasks and users own tasks" on public.tasks;
create policy "Managers can read all tasks and users own tasks"
on public.tasks for select to authenticated
using (public.is_manager() or assigned_to = auth.uid());

drop policy if exists "Managers can create tasks" on public.tasks;
create policy "Managers can create tasks"
on public.tasks for insert to authenticated
with check (public.is_manager() and created_by = auth.uid());

drop policy if exists "Managers or assignee can update task status" on public.tasks;
create policy "Managers or assignee can update task status"
on public.tasks for update to authenticated
using (public.is_manager() or assigned_to = auth.uid())
with check (public.is_manager() or assigned_to = auth.uid());

drop policy if exists "Managers can delete tasks" on public.tasks;
create policy "Managers can delete tasks"
on public.tasks for delete to authenticated using (public.is_manager());

-- Faults
drop policy if exists "Managers can read all faults and users own faults" on public.faults;
create policy "Managers can read all faults and users own faults"
on public.faults for select to authenticated
using (public.is_manager() or reported_by = auth.uid());

drop policy if exists "Users can create faults" on public.faults;
create policy "Users can create faults"
on public.faults for insert to authenticated with check (reported_by = auth.uid());

drop policy if exists "Managers can update faults" on public.faults;
create policy "Managers can update faults"
on public.faults for update to authenticated
using (public.is_manager()) with check (public.is_manager());

drop policy if exists "Managers can delete faults" on public.faults;
create policy "Managers can delete faults"
on public.faults for delete to authenticated using (public.is_manager());

-- Shifts
drop policy if exists "Admins can read all shifts and users own shifts" on public.shifts;
create policy "Admins can read all shifts and users own shifts"
on public.shifts for select to authenticated
using (public.is_admin() or profile_id = auth.uid());

drop policy if exists "Admins can manage shifts" on public.shifts;
create policy "Admins can manage shifts"
on public.shifts for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Baslangic verileri ve Storage
-- ---------------------------------------------------------------------------
insert into public.departments (name)
values ('Saha'), ('Market'), ('Yonetim'), ('Teknik')
on conflict (name) do nothing;

insert into storage.buckets (id, name, public)
values ('fault-photos', 'fault-photos', true)
on conflict (id) do nothing;

-- Kullanici yalnizca kendi klasorune (auth.uid/...) yukleyebilir
drop policy if exists "Authenticated users can upload fault photos" on storage.objects;
create policy "Authenticated users can upload fault photos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'fault-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Managers can delete fault photos" on storage.objects;
create policy "Managers can delete fault photos"
on storage.objects for delete to authenticated
using (bucket_id = 'fault-photos' and (public.is_manager() or (storage.foldername(name))[1] = auth.uid()::text));

drop policy if exists "Fault photos are public" on storage.objects;
create policy "Fault photos are public"
on storage.objects for select to public using (bucket_id = 'fault-photos');

-- ===========================================================================
-- v3 — Kayit istekleri (self-servis kayit + onay), vardiya gorselleri,
-- yetki genislemesi (takim lideri = yetkili). Bu bolum idempotenttir ve
-- gerekli fonksiyon/policy tanimlarini gunceller (en son tanim gecerlidir).
-- ===========================================================================

-- Kayit durumu enum'u: pending (onay bekliyor), approved (onaylandi), rejected (reddedildi)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'registration_status') then
    create type public.registration_status as enum ('pending', 'approved', 'rejected');
  end if;
end$$;

-- Yeni kolonlar (mevcut satirlar 'approved' sayilir; yeni kayitlar trigger ile 'pending' olur)
alter table public.profiles add column if not exists registration_status public.registration_status not null default 'approved';
alter table public.shifts add column if not exists photo_url text;

create index if not exists profiles_registration_status_idx on public.profiles(registration_status);

-- Haftalik vardiya plani gorselleri (Excel ciktisi/foto). Herkes gorur, yetkili yonetir.
create table if not exists public.shift_boards (
  id uuid primary key default gen_random_uuid(),
  title text,
  week_start date,
  image_url text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists shift_boards_created_at_idx on public.shift_boards(created_at desc);

-- Departmanlar: giris ekranindaki kayit formu icin anonim okuma da gerekir.
drop policy if exists "Authenticated users can read departments" on public.departments;
drop policy if exists "Anyone can read departments" on public.departments;
create policy "Anyone can read departments"
on public.departments for select to anon, authenticated using (true);

-- Self-servis kayit: yeni Auth kullanicisi PASIF ve 'pending' olarak acilir; yetkili onaylar.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  dept_raw text := nullif(new.raw_user_meta_data->>'department_id', '');
  dept_id uuid := null;
begin
  if dept_raw is not null and dept_raw ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    dept_id := dept_raw::uuid;
  end if;

  insert into public.profiles (id, full_name, role, phone, department_id, is_active, registration_status)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    'staff',
    nullif(new.raw_user_meta_data->>'phone', ''),
    dept_id,
    false,
    'pending'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Yetki koruma (guncellendi):
--   * admin: her seyi degistirebilir
--   * team_leader (yetkili): baska personelin rol/departman/aktifligini yonetir,
--     ANCAK kendini yukseltemez, admin'lere dokunamaz ve kimseyi admin yapamaz
--   * digerleri: ayricalikli alanlar sabit
-- Onay RPC'leri gecici bir oturum bayragi ile bu guard'i atlar.
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.user_role := public.current_user_role();
begin
  if current_setting('app.bypass_profile_guard', true) = '1' then
    return new;
  end if;

  if actor = 'admin' then
    return new;
  end if;

  if actor = 'team_leader' then
    -- Kendi ayricalikli alanlarini degistiremez.
    if new.id = auth.uid() then
      new.role := old.role;
      new.is_active := old.is_active;
      new.department_id := old.department_id;
      return new;
    end if;
    -- Mevcut bir admin'in ayricalikli alanlarina dokunamaz.
    if old.role = 'admin' then
      new.role := old.role;
      new.is_active := old.is_active;
      new.department_id := old.department_id;
      return new;
    end if;
    -- Kimseyi admin yapamaz.
    if new.role = 'admin' then
      new.role := old.role;
    end if;
    return new;
  end if;

  new.role := old.role;
  new.is_active := old.is_active;
  new.department_id := old.department_id;
  return new;
end;
$$;

-- Kayit onaylama (yetkili = admin veya takim lideri).
create or replace function public.approve_registration(
  target uuid,
  new_role public.user_role default 'staff',
  dept uuid default null,
  new_title text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_manager() then
    raise exception 'Bu islem icin yetkiniz yok.';
  end if;
  if new_role = 'admin' and not public.is_admin() then
    raise exception 'Admin yetkisini yalnizca admin atayabilir.';
  end if;

  perform set_config('app.bypass_profile_guard', '1', true);
  -- Yalnizca gercekten onay bekleyen (pending) kayitlara dokun; boylece bu RPC
  -- mevcut bir admin'i veya onaylanmis bir kullaniciyi degistiremez.
  update public.profiles
     set is_active = true,
         registration_status = 'approved',
         role = coalesce(new_role, role),
         department_id = coalesce(dept, department_id),
         title = coalesce(nullif(new_title, ''), title)
   where id = target and registration_status = 'pending';

  if not found then
    raise exception 'Onay bekleyen kayit bulunamadi; kayit daha once islenmis olabilir.';
  end if;
end;
$$;

-- Kayit reddetme.
create or replace function public.reject_registration(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_manager() then
    raise exception 'Bu islem icin yetkiniz yok.';
  end if;

  perform set_config('app.bypass_profile_guard', '1', true);
  -- Yalnizca onay bekleyen (pending) kayitlar reddedilebilir; onaylanmis
  -- kullanicilar (ozellikle admin) bu RPC ile pasiflestirilemez.
  update public.profiles
     set is_active = false,
         registration_status = 'rejected'
   where id = target and registration_status = 'pending';

  if not found then
    raise exception 'Onay bekleyen kayit bulunamadi; kayit daha once islenmis olabilir.';
  end if;
end;
$$;

grant execute on function public.approve_registration(uuid, public.user_role, uuid, text) to authenticated;
grant execute on function public.reject_registration(uuid) to authenticated;

-- Profiles okuma: yetkililer pasif/pending profilleri de gorebilir (kayit istekleri icin).
drop policy if exists "Users can read active profiles" on public.profiles;
create policy "Users can read active profiles"
on public.profiles for select to authenticated
using (is_active = true or public.is_manager() or id = auth.uid());

-- Profiles guncelleme: yetkililer yonetebilir (ayricalik yukseltme guard ile korunur).
drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Managers can update profiles" on public.profiles;
create policy "Managers can update profiles"
on public.profiles for update to authenticated
using (public.is_manager()) with check (public.is_manager());

-- Departmanlar: yetkililer yonetebilir.
drop policy if exists "Admins can manage departments" on public.departments;
drop policy if exists "Managers can manage departments" on public.departments;
create policy "Managers can manage departments"
on public.departments for all to authenticated
using (public.is_manager()) with check (public.is_manager());

-- Vardiyalar: yetkililer tum vardiyalari gorur ve yonetir; personel kendi vardiyasini gorur.
drop policy if exists "Admins can read all shifts and users own shifts" on public.shifts;
drop policy if exists "Managers can read all shifts and users own shifts" on public.shifts;
create policy "Managers can read all shifts and users own shifts"
on public.shifts for select to authenticated
using (public.is_manager() or profile_id = auth.uid());

drop policy if exists "Admins can manage shifts" on public.shifts;
drop policy if exists "Managers can manage shifts" on public.shifts;
create policy "Managers can manage shifts"
on public.shifts for all to authenticated
using (public.is_manager()) with check (public.is_manager());

-- Vardiya gorselleri: herkes okur, yetkili yonetir.
alter table public.shift_boards enable row level security;

drop policy if exists "Authenticated can read shift boards" on public.shift_boards;
create policy "Authenticated can read shift boards"
on public.shift_boards for select to authenticated using (true);

drop policy if exists "Managers can manage shift boards" on public.shift_boards;
create policy "Managers can manage shift boards"
on public.shift_boards for all to authenticated
using (public.is_manager())
with check (public.is_manager() and (created_by is null or created_by = auth.uid()));

-- Vardiya foto/gorsel deposu (vardiya karti fotolari ve haftalik plan gorselleri).
insert into storage.buckets (id, name, public)
values ('shift-photos', 'shift-photos', true)
on conflict (id) do nothing;

drop policy if exists "Managers can upload shift photos" on storage.objects;
create policy "Managers can upload shift photos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'shift-photos'
  and public.is_manager()
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Managers can delete shift photos" on storage.objects;
create policy "Managers can delete shift photos"
on storage.objects for delete to authenticated
using (bucket_id = 'shift-photos' and public.is_manager());

drop policy if exists "Shift photos are public" on storage.objects;
create policy "Shift photos are public"
on storage.objects for select to public using (bucket_id = 'shift-photos');

-- ===========================================================================
-- v3.1 — Onay kapisini veritabani (RLS) katmaninda da zorunlu kil.
-- Onaysiz/pasif kullanicilar; oturumlari gecerli olsa bile API uzerinden
-- baskalarinin verisini okuyamaz/yazamaz. Yetki fonksiyonlari artik
-- yalnizca aktif + onayli profilleri yetkili sayar.
-- ===========================================================================

-- Cagiran kullanici aktif ve onaylanmis mi?
create or replace function public.is_approved()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active and registration_status = 'approved'
  )
$$;

-- Yetki fonksiyonlari: rol + aktiflik + onay birlikte aranir.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active and registration_status = 'approved'
  )
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'team_leader')
      and is_active
      and registration_status = 'approved'
  )
$$;

-- Duyurular: yalnizca onayli kullanicilar okur.
drop policy if exists "Authenticated users can read announcements" on public.announcements;
create policy "Authenticated users can read announcements"
on public.announcements for select to authenticated using (public.is_approved());

-- Profiller: herkes kendi kaydini gorur; digerlerini yalnizca onayli kullanici
-- gorebilir (yetkililer pasif/pending kayitlari da gorur).
drop policy if exists "Users can read active profiles" on public.profiles;
create policy "Users can read active profiles"
on public.profiles for select to authenticated
using (
  id = auth.uid()
  or (public.is_approved() and (is_active = true or public.is_manager()))
);

-- Vardiya gorselleri: yalnizca onayli kullanicilar okur.
drop policy if exists "Authenticated can read shift boards" on public.shift_boards;
create policy "Authenticated can read shift boards"
on public.shift_boards for select to authenticated using (public.is_approved());

-- Ariza olusturma: yalnizca onayli kullanici bildirim acabilir.
drop policy if exists "Users can create faults" on public.faults;
create policy "Users can create faults"
on public.faults for insert to authenticated
with check (reported_by = auth.uid() and public.is_approved());

-- Duyuru okundu isareti: yalnizca onayli kullanici.
drop policy if exists "Users can mark announcement read" on public.announcement_reads;
create policy "Users can mark announcement read"
on public.announcement_reads for insert to authenticated
with check (user_id = auth.uid() and public.is_approved());

-- ===========================================================================
-- v3.2 - Production hardening.
-- Locks function search paths, limits RPC exposure, adds FK indexes, and removes
-- broad public object read policies from private operational buckets.
-- ===========================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.stamp_task_completion()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'Tamamlandi' and old.status is distinct from 'Tamamlandi' then
    new.completed_at := now();
  elsif new.status is distinct from 'Tamamlandi' then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

create or replace function public.stamp_fault_resolution()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'Cozuldu' and old.status is distinct from 'Cozuldu' then
    new.resolved_at := now();
  elsif new.status is distinct from 'Cozuldu' then
    new.resolved_at := null;
  end if;
  return new;
end;
$$;

create index if not exists announcements_created_by_idx on public.announcements(created_by);
create index if not exists tasks_created_by_idx on public.tasks(created_by);
create index if not exists shift_boards_created_by_idx on public.shift_boards(created_by);

drop policy if exists "Fault photos are public" on storage.objects;
drop policy if exists "Shift photos are public" on storage.objects;
drop policy if exists "Shift images are public" on storage.objects;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.stamp_task_completion() from public, anon, authenticated;
revoke execute on function public.stamp_fault_resolution() from public, anon, authenticated;

revoke execute on function public.current_user_role() from public, anon;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_manager() from public, anon;
revoke execute on function public.is_approved() from public, anon;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_manager() to authenticated;
grant execute on function public.is_approved() to authenticated;

revoke execute on function public.approve_registration(uuid, public.user_role, uuid, text) from public, anon;
revoke execute on function public.reject_registration(uuid) from public, anon;
grant execute on function public.approve_registration(uuid, public.user_role, uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Cevrimici personel takibi (dashboard "Cevrimici Personeller" karti)
-- Giriste is_online=true/last_seen_at=now(), cikista is_online=false yapilir;
-- ayrica panel acikken periyodik "heartbeat" ile last_seen_at tazelenir.
-- Dashboard sorgusu is_online = true VE last_seen_at yakin zamanli olanlari
-- "cevrimici" sayar, boylece kapanan sekmeler bir sure sonra otomatik dusuk.
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists is_online boolean not null default false;
alter table public.profiles add column if not exists last_seen_at timestamptz;

create index if not exists profiles_is_online_idx on public.profiles(is_online, last_seen_at);
grant execute on function public.reject_registration(uuid) to authenticated;
