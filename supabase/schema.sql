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

create table public.round_points (
  id text primary key,
  title text not null,
  location text not null,
  group_name text not null default 'Drift',
  instruction text not null,
  qr_code text unique,
  required boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.round_sessions (
  id text primary key,
  title text not null,
  area text not null,
  due_at timestamptz not null,
  assigned_to text not null,
  status text not null default 'planned',
  point_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.round_checks (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.round_sessions(id) on delete cascade,
  point_id text not null references public.round_points(id) on delete cascade,
  status text not null,
  checked_at timestamptz not null default now(),
  checked_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table public.facility_work_orders (
  id text primary key,
  title text not null,
  description text not null default '',
  location text not null,
  category text not null default 'Andet',
  priority text not null default 'normal',
  status text not null default 'new',
  assigned_to text not null,
  due_at timestamptz not null,
  created_by uuid references public.profiles(id) on delete set null,
  checklist jsonb not null default '[]',
  comments jsonb not null default '[]',
  materials jsonb not null default '[]',
  attachment_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_items (
  id text primary key,
  name text not null,
  category text not null,
  location text not null,
  quantity numeric not null default 0,
  min_quantity numeric not null default 0,
  max_quantity numeric not null default 0,
  unit text not null default 'stk',
  qr_code text unique,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_movements (
  id text primary key,
  item_id text not null references public.inventory_items(id) on delete cascade,
  delta numeric not null,
  quantity_after numeric not null,
  reason text not null,
  performed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.sds_documents (
  id text primary key,
  name text not null,
  supplier text not null,
  product_number text,
  signal_word text not null,
  hazard_codes text[] not null default '{}',
  hazard_labels text[] not null default '{}',
  location text not null,
  emergency_phone text,
  ppe text[] not null default '{}',
  first_aid jsonb not null default '{}',
  pdf_path text,
  qr_code text unique,
  revision_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.activity_log enable row level security;
alter table public.favorites enable row level security;
alter table public.sync_queue enable row level security;
alter table public.meters enable row level security;
alter table public.meter_readings enable row level security;
alter table public.round_points enable row level security;
alter table public.round_sessions enable row level security;
alter table public.round_checks enable row level security;
alter table public.facility_work_orders enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.sds_documents enable row level security;

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

create policy "Round points visible to authenticated users"
  on public.round_points for select
  to authenticated
  using (true);

create policy "Authenticated users can upsert round points"
  on public.round_points for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update round points"
  on public.round_points for update
  to authenticated
  using (true)
  with check (true);

create policy "Round sessions visible to authenticated users"
  on public.round_sessions for select
  to authenticated
  using (true);

create policy "Authenticated users can upsert round sessions"
  on public.round_sessions for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update round sessions"
  on public.round_sessions for update
  to authenticated
  using (true)
  with check (true);

create policy "Round checks visible to authenticated users"
  on public.round_checks for select
  to authenticated
  using (true);

create policy "Authenticated users can create round checks"
  on public.round_checks for insert
  to authenticated
  with check (auth.uid() = checked_by);

create policy "Facility work orders visible to authenticated users"
  on public.facility_work_orders for select
  to authenticated
  using (true);

create policy "Authenticated users can create facility work orders"
  on public.facility_work_orders for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Authenticated users can update facility work orders"
  on public.facility_work_orders for update
  to authenticated
  using (true)
  with check (true);

create policy "Inventory items visible to authenticated users"
  on public.inventory_items for select
  to authenticated
  using (true);

create policy "Authenticated users can create inventory items"
  on public.inventory_items for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update inventory items"
  on public.inventory_items for update
  to authenticated
  using (true)
  with check (true);

create policy "Inventory movements visible to authenticated users"
  on public.inventory_movements for select
  to authenticated
  using (true);

create policy "Authenticated users can create inventory movements"
  on public.inventory_movements for insert
  to authenticated
  with check (auth.uid() = performed_by);

create policy "SDS documents visible to authenticated users"
  on public.sds_documents for select
  to authenticated
  using (is_active);

create policy "Authenticated users can create SDS documents"
  on public.sds_documents for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update SDS documents"
  on public.sds_documents for update
  to authenticated
  using (true)
  with check (true);

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
