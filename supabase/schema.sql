create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'team_leader', 'staff');
create type public.task_status as enum ('Bekliyor', 'Yapiliyor', 'Tamamlandi');
create type public.fault_status as enum ('Acik', 'Servise Bildirildi', 'Cozuldu');
create type public.fault_category as enum ('Pompa', 'Market', 'WC', 'Elektrik', 'Saha', 'Diger');

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'staff',
  department_id uuid references public.departments(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.announcement_reads (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  shift_date date not null,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  starts_at time not null,
  ends_at time not null,
  is_leave boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assigned_to uuid references public.profiles(id) on delete set null,
  shift_id uuid references public.shifts(id) on delete set null,
  status public.task_status not null default 'Bekliyor',
  due_date date,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.faults (
  id uuid primary key default gen_random_uuid(),
  category public.fault_category not null,
  description text not null,
  photo_url text,
  status public.fault_status not null default 'Acik',
  reported_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index profiles_department_id_idx on public.profiles(department_id);
create index announcement_reads_user_id_idx on public.announcement_reads(user_id);
create index tasks_assigned_to_idx on public.tasks(assigned_to);
create index tasks_shift_id_idx on public.tasks(shift_id);
create index faults_reported_by_idx on public.faults(reported_by);
create index shifts_profile_id_idx on public.shifts(profile_id);
create index shifts_shift_date_idx on public.shifts(shift_date);

alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.announcements enable row level security;
alter table public.announcement_reads enable row level security;
alter table public.tasks enable row level security;
alter table public.faults enable row level security;
alter table public.shifts enable row level security;

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

create policy "Authenticated users can read departments"
on public.departments for select
to authenticated
using (true);

create policy "Admins can manage departments"
on public.departments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can read active profiles"
on public.profiles for select
to authenticated
using (is_active = true or public.is_admin() or id = auth.uid());

create policy "Admins can insert profiles"
on public.profiles for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Authenticated users can read announcements"
on public.announcements for select
to authenticated
using (true);

create policy "Managers can create announcements"
on public.announcements for insert
to authenticated
with check (public.is_manager() and created_by = auth.uid());

create policy "Managers can update announcements"
on public.announcements for update
to authenticated
using (public.is_manager())
with check (public.is_manager());

create policy "Users can read announcement reads"
on public.announcement_reads for select
to authenticated
using (user_id = auth.uid() or public.is_manager());

create policy "Users can mark announcement read"
on public.announcement_reads for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update own read record"
on public.announcement_reads for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Managers can read all tasks and users own tasks"
on public.tasks for select
to authenticated
using (public.is_manager() or assigned_to = auth.uid());

create policy "Managers can create tasks"
on public.tasks for insert
to authenticated
with check (public.is_manager() and created_by = auth.uid());

create policy "Managers or assignee can update task status"
on public.tasks for update
to authenticated
using (public.is_manager() or assigned_to = auth.uid())
with check (public.is_manager() or assigned_to = auth.uid());

create policy "Managers can read all faults and users own faults"
on public.faults for select
to authenticated
using (public.is_manager() or reported_by = auth.uid());

create policy "Users can create faults"
on public.faults for insert
to authenticated
with check (reported_by = auth.uid());

create policy "Managers can update faults"
on public.faults for update
to authenticated
using (public.is_manager())
with check (public.is_manager());

create policy "Admins can read all shifts and users own shifts"
on public.shifts for select
to authenticated
using (public.is_admin() or profile_id = auth.uid());

create policy "Admins can manage shifts"
on public.shifts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.departments (name)
values ('Saha'), ('Market'), ('Yonetim'), ('Teknik')
on conflict (name) do nothing;

insert into storage.buckets (id, name, public)
values ('fault-photos', 'fault-photos', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload fault photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'fault-photos');

create policy "Fault photos are public"
on storage.objects for select
to public
using (bucket_id = 'fault-photos');
