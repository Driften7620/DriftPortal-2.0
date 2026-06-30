create type public.user_role as enum (
  'system_admin',
  'admin',
  'hr_admin',
  'time_admin',
  'operator',
  'handyman',
  'office',
  'info_screen'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null,
  role public.user_role not null default 'operator',
  module_access text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  module_id text not null,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module_id text not null,
  entity_type text,
  entity_id text,
  label text not null,
  created_at timestamptz not null default now()
);

create table public.sync_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  module_id text not null,
  operation text not null,
  payload jsonb not null,
  status text not null default 'pending',
  error text,
  created_at timestamptz not null default now(),
  synced_at timestamptz
);

create table public.meters (
  id text primary key,
  name text not null,
  location text not null,
  group_name text not null default 'Drift',
  unit text not null,
  interval_hours integer not null default 24,
  min_value numeric,
  max_value numeric,
  average_consumption numeric not null default 0,
  status text not null default 'ok',
  qr_code text unique,
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meter_readings (
  id uuid primary key default gen_random_uuid(),
  meter_id text not null references public.meters(id) on delete cascade,
  value numeric not null,
  consumption numeric,
  read_at timestamptz not null default now(),
  read_by uuid references public.profiles(id) on delete set null,
  comment text,
  is_out_of_range boolean not null default false,
  is_unusual boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.activity_log enable row level security;
alter table public.favorites enable row level security;
alter table public.sync_queue enable row level security;
alter table public.meters enable row level security;
alter table public.meter_readings enable row level security;

create policy "Profiles are visible to authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile basics"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Activity log visible to authenticated users"
  on public.activity_log for select
  to authenticated
  using (true);

create policy "Activity log insert for authenticated users"
  on public.activity_log for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users manage own favorites"
  on public.favorites for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own sync queue"
  on public.sync_queue for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Meters visible to authenticated users"
  on public.meters for select
  to authenticated
  using (true);

create policy "Authenticated users can upsert meters"
  on public.meters for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update meters"
  on public.meters for update
  to authenticated
  using (true)
  with check (true);

create policy "Meter readings visible to authenticated users"
  on public.meter_readings for select
  to authenticated
  using (true);

create policy "Authenticated users can create readings"
  on public.meter_readings for insert
  to authenticated
  with check (auth.uid() = read_by);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, module_access)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'operator',
    array['dashboard','maalerlog','rundering','facility-service','mine-opgaver','lagerstyring','sds','how-to-do','liveconnect','udstyr','el-eftersyn']
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
