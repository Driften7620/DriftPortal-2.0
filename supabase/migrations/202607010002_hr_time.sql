-- Sprint 8: HR, fravaer og tidsregistrering.

create table if not exists public.hr_work_days (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  work_date date not null,
  start_time time not null,
  end_time time not null,
  break_minutes integer not null default 0 check (break_minutes >= 0),
  hours numeric(7,2) not null check (hours >= 0),
  note text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_comment text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hr_leave_requests (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  leave_type text not null check (leave_type in ('vacation', 'personal', 'care', 'unpaid')),
  date_from date not null,
  date_to date not null,
  days numeric(6,2) not null check (days >= 0),
  note text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_comment text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (date_to >= date_from)
);

create table if not exists public.hr_balances (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  vacation_days numeric(7,2) not null default 25,
  flex_hours numeric(8,2) not null default 0,
  personal_days numeric(7,2) not null default 0,
  care_days numeric(7,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.time_entries (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  start_time time not null,
  end_time time not null,
  break_minutes integer not null default 0 check (break_minutes >= 0),
  hours numeric(7,2) not null check (hours >= 0),
  entry_kind text not null check (entry_kind in ('regular', 'overtime', 'callout', 'driving', 'course')),
  location text not null,
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_comment text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payroll_periods (
  id text primary key,
  title text not null,
  date_from date not null,
  date_to date not null,
  is_closed boolean not null default false,
  closed_by uuid references public.profiles(id) on delete set null,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  check (date_to >= date_from)
);

create or replace function public.is_hr_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_active = true
      and role in ('system_admin', 'admin', 'hr_admin')
  );
$$;

create or replace function public.is_time_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_active = true
      and role in ('system_admin', 'admin', 'time_admin')
  );
$$;

alter table public.hr_work_days enable row level security;
alter table public.hr_leave_requests enable row level security;
alter table public.hr_balances enable row level security;
alter table public.time_entries enable row level security;
alter table public.payroll_periods enable row level security;

drop policy if exists "hr work read" on public.hr_work_days;
create policy "hr work read" on public.hr_work_days
  for select to authenticated
  using (user_id = auth.uid() or public.is_hr_manager());

drop policy if exists "hr work create own" on public.hr_work_days;
create policy "hr work create own" on public.hr_work_days
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "hr work update" on public.hr_work_days;
create policy "hr work update" on public.hr_work_days
  for update to authenticated
  using ((user_id = auth.uid() and status = 'pending') or public.is_hr_manager())
  with check (user_id = auth.uid() or public.is_hr_manager());

drop policy if exists "leave read" on public.hr_leave_requests;
create policy "leave read" on public.hr_leave_requests
  for select to authenticated
  using (user_id = auth.uid() or public.is_hr_manager());

drop policy if exists "leave create own" on public.hr_leave_requests;
create policy "leave create own" on public.hr_leave_requests
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "leave update" on public.hr_leave_requests;
create policy "leave update" on public.hr_leave_requests
  for update to authenticated
  using ((user_id = auth.uid() and status = 'pending') or public.is_hr_manager())
  with check (user_id = auth.uid() or public.is_hr_manager());

drop policy if exists "balance read" on public.hr_balances;
create policy "balance read" on public.hr_balances
  for select to authenticated
  using (user_id = auth.uid() or public.is_hr_manager());

drop policy if exists "balance manage" on public.hr_balances;
create policy "balance manage" on public.hr_balances
  for all to authenticated
  using (public.is_hr_manager())
  with check (public.is_hr_manager());

drop policy if exists "time read" on public.time_entries;
create policy "time read" on public.time_entries
  for select to authenticated
  using (user_id = auth.uid() or public.is_time_manager());

drop policy if exists "time create own" on public.time_entries;
create policy "time create own" on public.time_entries
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "time update" on public.time_entries;
create policy "time update" on public.time_entries
  for update to authenticated
  using ((user_id = auth.uid() and status = 'pending') or public.is_time_manager())
  with check (user_id = auth.uid() or public.is_time_manager());

drop policy if exists "period read" on public.payroll_periods;
create policy "period read" on public.payroll_periods
  for select to authenticated
  using (true);

drop policy if exists "period manage" on public.payroll_periods;
create policy "period manage" on public.payroll_periods
  for all to authenticated
  using (public.is_time_manager())
  with check (public.is_time_manager());

grant execute on function public.is_hr_manager() to authenticated;
grant execute on function public.is_time_manager() to authenticated;
