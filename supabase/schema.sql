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
