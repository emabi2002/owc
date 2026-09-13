-- OWC security hardening — 14 September 2026
-- Apply to an already-provisioned OWC Supabase/PostgreSQL environment through
-- the approved database change process. Idempotent by design.
--
-- This script does not create users or alter role assignments. It only makes
-- existing authorization helpers respect account status and prevents a user
-- from escalating their own profile through the direct database/API surface.

begin;

create or replace function public.current_app_role()
returns public.app_role
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role public.app_role;
begin
  select role
    into v_role
    from public.profiles
   where id = auth.uid()
     and status = 'active';

  return coalesce(v_role, 'viewer'::public.app_role);
end;
$$;

create or replace function public.is_staff()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_exists boolean;
begin
  select exists (
    select 1
      from public.profiles
     where id = auth.uid()
       and status = 'active'
  ) into v_exists;

  return coalesce(v_exists, false);
end;
$$;

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- A service-role/admin update of another user's profile remains possible.
  -- A signed-in user changing their own row may only change non-privileged
  -- profile data unless their currently stored active role is administrator.
  if auth.uid() = old.id
     and public.current_app_role() <> 'administrator'::public.app_role
     and (
       new.email is distinct from old.email
       or new.role is distinct from old.role
       or new.status is distinct from old.status
       or new.mfa_enabled is distinct from old.mfa_enabled
     ) then
    raise exception 'Privileged profile fields require administrator authority'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_fields on public.profiles;
create trigger protect_profile_privileged_fields
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_fields();

-- Suspended/invited accounts cannot use the ordinary self-update policy. An
-- administrator remains governed by the separate profiles_admin_manage policy.
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update to authenticated
  using (id = auth.uid() and status = 'active')
  with check (id = auth.uid() and status = 'active');

commit;
