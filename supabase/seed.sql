insert into public.system_locations (id, name, code, address, is_active)
values
  ('location-industrivej', 'Industrivej', 'IND', 'Industrivej, Lemvig', true),
  ('location-vestavej', 'Vestavej', 'VES', 'Vestavej, Lemvig', true),
  ('location-klinkby', 'Klinkby', 'KLI', 'Klinkby, Lemvig', true)
on conflict (id) do update set
  name = excluded.name,
  code = excluded.code,
  address = excluded.address,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.system_categories (id, name, area, color, is_active)
values
  ('category-drift', 'Drift', 'Opgaver', '#00e5ff', true),
  ('category-elektrisk', 'Elektrisk', 'Opgaver', '#fbbf24', true),
  ('category-mekanisk', 'Mekanisk', 'Opgaver', '#fb923c', true),
  ('category-kemikalier', 'Kemikalier', 'Lager', '#f472b6', true)
on conflict (id) do update set
  name = excluded.name,
  area = excluded.area,
  color = excluded.color,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.portal_settings (
  id,
  organization_name,
  emergency_phone,
  default_location_id,
  sync_interval_minutes,
  automatic_sync,
  push_notifications,
  offline_mode
)
values (
  'global',
  'Lemvig Varmeværk',
  '82 12 12 12',
  'location-industrivej',
  15,
  true,
  false,
  true
)
on conflict (id) do nothing;
