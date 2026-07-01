create or replace function public.protect_last_active_system_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  removes_active_system_admin boolean := false;
begin
  if old.role = 'system_admin' and old.is_active = true then
    if tg_op = 'DELETE' then
      removes_active_system_admin := true;
    elsif new.role <> 'system_admin' or new.is_active = false then
      removes_active_system_admin := true;
    end if;
  end if;

  if removes_active_system_admin and not exists (
    select 1
    from public.profiles
    where role = 'system_admin'
      and is_active = true
      and id <> old.id
  ) then
    raise exception 'Den sidste aktive systemadministrator kan ikke fjernes.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_last_active_system_admin on public.profiles;

create trigger protect_last_active_system_admin
before update of role, is_active or delete on public.profiles
for each row
execute function public.protect_last_active_system_admin();

create or replace function public.protect_profile_permissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.role is not distinct from old.role
     and new.module_access is not distinct from old.module_access
     and new.is_active is not distinct from old.is_active
  then
    return new;
  end if;

  select role
  into caller_role
  from public.profiles
  where id = auth.uid()
    and is_active = true;

  if caller_role not in ('system_admin', 'admin') then
    raise exception 'Kun administratorer kan ændre roller og adgang.';
  end if;

  if (old.role = 'system_admin' or new.role = 'system_admin')
     and caller_role <> 'system_admin'
  then
    raise exception 'Kun en systemadministrator kan ændre systemadministratorrollen.';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_permissions on public.profiles;

create trigger protect_profile_permissions
before update of role, module_access, is_active on public.profiles
for each row
execute function public.protect_profile_permissions();
