-- ============================================================================
-- OWC PNG — Database schema (Supabase / PostgreSQL)
-- ----------------------------------------------------------------------------
-- Provisions the complete OWC content + operational schema:
--   • enums (content_status, app_role, audit_action, tender_status, …)
--   • tables: pages, news, publications, legislation, tenders, faqs, forms,
--     reports, enquiries, profiles, audit_logs, claim_tracking
--   • updated_at triggers + new-user → profiles trigger
--   • Row Level Security (anon reads only `published`; staff manage per role;
--     public submission endpoints accept anon inserts; audit log staff-readable)
--
-- This file MIRRORS src/lib/supabase/types.ts. Regenerate the TS types with
--   supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
-- after any change here.
--
-- Idempotent: safe to re-run. For a guaranteed clean slate, run
-- src/lib/db/reset.sql first (auth users are preserved), then this file.
-- Apply in the Supabase SQL editor, then run `bun run setup`.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.content_status as enum
    ('draft', 'submitted', 'approved', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.app_role as enum
    ('administrator', 'editor', 'reviewer', 'claims_officer',
     'assessment_officer', 'finance_officer', 'management', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.audit_action as enum
    ('create', 'update', 'delete', 'approve', 'publish',
     'login', 'failed_login', 'role_change', 'submit');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.tender_status as enum
    ('open', 'closing_soon', 'closed', 'awarded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.enquiry_status as enum
    ('new', 'in_progress', 'resolved', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.profile_status as enum
    ('active', 'invited', 'suspended');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- Shared trigger: maintain updated_at
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

-- Staff profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  email           text not null,
  full_name       text,
  role            public.app_role not null default 'viewer',
  status          public.profile_status not null default 'active',
  last_active_at  timestamptz,
  mfa_enabled     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Editorial pages
create table if not exists public.pages (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  summary       text,
  body          text,
  status        public.content_status not null default 'draft',
  author_id     uuid references public.profiles (id) on delete set null,
  reviewer_id   uuid references public.profiles (id) on delete set null,
  published_at  timestamptz,
  seo_keywords  text[],
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- News & public notices
create table if not exists public.news (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  category      text not null,
  excerpt       text,
  body          text,
  image_url     text,
  featured      boolean not null default false,
  status        public.content_status not null default 'draft',
  author_id     uuid references public.profiles (id) on delete set null,
  reviewer_id   uuid references public.profiles (id) on delete set null,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Publications (reports, guides, handbooks)
create table if not exists public.publications (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  category      text not null,
  description  text,
  file_url      text,
  file_format   text,
  file_size     text,
  year          text,
  status        public.content_status not null default 'draft',
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Legislation (Acts, regulations, schedules)
create table if not exists public.legislation (
  id            uuid primary key default gen_random_uuid(),
  title          text not null,
  reference      text,
  category       text not null,
  description   text,
  file_url       text,
  enacted_year  text,
  status         public.content_status not null default 'draft',
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Tenders & procurement
create table if not exists public.tenders (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique,
  title           text not null,
  category        text not null default 'General',
  description     text,
  status          public.tender_status not null default 'open',
  published_date  date,
  closing_date    date,
  file_url        text,
  content_status  public.content_status not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Frequently asked questions
create table if not exists public.faqs (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  answer      text not null,
  category    text not null,
  sort_order  integer not null default 0,
  status      public.content_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Downloadable forms
create table if not exists public.forms (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  title        text not null,
  category     text not null,
  file_format  text not null default 'PDF',
  file_size    text,
  file_url     text,
  status       public.content_status not null default 'draft',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Reports / statistical publications
create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  year         text,
  file_size    text,
  file_url     text,
  status       public.content_status not null default 'draft',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Public enquiries. AI-routed fields remain null for ordinary contact-form
-- submissions and are populated only by the trusted confirmed-referral route.
create table if not exists public.enquiries (
  id                      uuid primary key default gen_random_uuid(),
  reference               text,
  name                    text not null,
  email                   text,
  phone                   text,
  category                text not null,
  subject                 text,
  message                 text not null,
  status                  public.enquiry_status not null default 'new',
  source_ip               text,
  handled_by              uuid references public.profiles (id) on delete set null,
  source_channel          text,
  language                text,
  linked_claim_reference  text,
  ai_summary              text,
  route_destination       text,
  priority                text,
  confirmed_at            timestamptz,
  notification_status     text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Append-only audit log
create table if not exists public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  actor_id     uuid references public.profiles (id) on delete set null,
  actor_email  text,
  action       public.audit_action not null,
  entity       text not null,
  entity_id    text,
  summary      text not null,
  metadata     jsonb,
  ip_address   text
);

-- Local mirror of CPPS claim status for tracking and management reporting.
create table if not exists public.claim_tracking (
  id                       uuid primary key default gen_random_uuid(),
  reference                text not null unique,
  worker_name              text not null,
  employer_name            text,
  province                 text,
  district                 text,
  industry                 text,
  occupation               text,
  injury_type              text,
  injury_date              date,
  lodged_date              date default current_date,
  status                   text not null default 'New',
  decision                 text,
  compensation_amount_pgk  numeric(14,2),
  turnaround_days          integer,
  notification_status      text,
  payment_status           text,
  assigned_officer         text,
  steps                    jsonb,
  cpps_synced_at           timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Access-control helper functions
-- SECURITY DEFINER so they bypass RLS on `profiles` (prevents policy recursion).
-- current_app_role() is PL/pgSQL with an explicitly typed return variable to
-- avoid the "42P13 return type mismatch" error seen with SQL/inferred returns.
-- ----------------------------------------------------------------------------
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

-- Prevent direct-API self-escalation of role/account/security fields. Service
-- role updates and administrator management of other profiles remain available.
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
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

-- ----------------------------------------------------------------------------
-- New auth user → create a profile (default role: viewer)
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'viewer',
    'active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------------
do $$
declare
  t text;
  timestamped_tables text[] := array[
    'profiles', 'pages', 'news', 'publications', 'legislation', 'tenders',
    'faqs', 'forms', 'reports', 'enquiries', 'claim_tracking'
  ];
begin
  foreach t in array timestamped_tables loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_news_status         on public.news (status);
create index if not exists idx_news_published_at   on public.news (published_at desc);
create index if not exists idx_pages_status        on public.pages (status);
create index if not exists idx_publications_status on public.publications (status);
create index if not exists idx_legislation_status  on public.legislation (status);
create index if not exists idx_tenders_cstatus     on public.tenders (content_status);
create index if not exists idx_faqs_status         on public.faqs (status);
create index if not exists idx_forms_status        on public.forms (status);
create index if not exists idx_reports_status      on public.reports (status);
create index if not exists idx_enquiries_status    on public.enquiries (status);
create unique index if not exists idx_enquiries_reference
  on public.enquiries (reference) where reference is not null;
create index if not exists idx_enquiries_confirmed_at
  on public.enquiries (confirmed_at desc) where confirmed_at is not null;
create index if not exists idx_enquiries_route_destination
  on public.enquiries (route_destination) where route_destination is not null;
create index if not exists idx_audit_created_at    on public.audit_logs (created_at desc);
create index if not exists idx_claims_reference    on public.claim_tracking (reference);
create index if not exists idx_claims_province     on public.claim_tracking (province);
create index if not exists idx_claims_lodged_date  on public.claim_tracking (lodged_date);

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------

-- Standard content tables: public reads `published`; content roles manage.
do $$
declare
  t text;
  content_tables text[] := array[
    'pages', 'news', 'publications', 'legislation', 'faqs', 'forms', 'reports'
  ];
begin
  foreach t in array content_tables loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "%s_public_read" on public.%I', t, t);
    execute format('drop policy if exists "%s_staff_read"  on public.%I', t, t);
    execute format('drop policy if exists "%s_staff_write" on public.%I', t, t);

    execute format(
      $f$create policy "%s_public_read" on public.%I
           for select to anon, authenticated
           using (status = 'published')$f$, t, t);

    execute format(
      $f$create policy "%s_staff_read" on public.%I
           for select to authenticated
           using (public.is_staff())$f$, t, t);

    execute format(
      $f$create policy "%s_staff_write" on public.%I
           for all to authenticated
           using (public.current_app_role()
                    in ('administrator','editor','reviewer'))
           with check (public.current_app_role()
                    in ('administrator','editor','reviewer'))$f$, t, t);
  end loop;
end $$;

-- Tenders (gated on content_status)
alter table public.tenders enable row level security;
drop policy if exists "tenders_public_read" on public.tenders;
drop policy if exists "tenders_staff_read"  on public.tenders;
drop policy if exists "tenders_staff_write" on public.tenders;
create policy "tenders_public_read" on public.tenders
  for select to anon, authenticated
  using (content_status = 'published');
create policy "tenders_staff_read" on public.tenders
  for select to authenticated
  using (public.is_staff());
create policy "tenders_staff_write" on public.tenders
  for all to authenticated
  using (public.current_app_role() in ('administrator','editor','reviewer'))
  with check (public.current_app_role() in ('administrator','editor','reviewer'));

-- Enquiries: anyone may submit (insert); staff read/update.
alter table public.enquiries enable row level security;
drop policy if exists "enquiries_public_insert" on public.enquiries;
drop policy if exists "enquiries_staff_read"     on public.enquiries;
drop policy if exists "enquiries_staff_update"   on public.enquiries;
create policy "enquiries_public_insert" on public.enquiries
  for insert to anon, authenticated
  with check (true);
create policy "enquiries_staff_read" on public.enquiries
  for select to authenticated
  using (public.is_staff());
create policy "enquiries_staff_update" on public.enquiries
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Profiles: active users read/update their own non-privileged fields;
-- administrators manage all profiles. The trigger above protects privileged
-- fields even if the API is called directly instead of through the UI.
alter table public.profiles enable row level security;
drop policy if exists "profiles_self_read"   on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
drop policy if exists "profiles_admin_manage" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.current_app_role() = 'administrator');
create policy "profiles_self_update" on public.profiles
  for update to authenticated
  using (id = auth.uid() and status = 'active')
  with check (id = auth.uid() and status = 'active');
create policy "profiles_admin_manage" on public.profiles
  for all to authenticated
  using (public.current_app_role() = 'administrator')
  with check (public.current_app_role() = 'administrator');

-- Audit logs: staff read; staff may append (service role bypasses RLS).
alter table public.audit_logs enable row level security;
drop policy if exists "audit_staff_read"   on public.audit_logs;
drop policy if exists "audit_staff_insert" on public.audit_logs;
create policy "audit_staff_read" on public.audit_logs
  for select to authenticated
  using (public.is_staff());
create policy "audit_staff_insert" on public.audit_logs
  for insert to authenticated
  with check (public.is_staff());

-- Claim tracking: public may lodge (insert); operational claim roles read/manage.
-- Management/Executive reporting is intentionally served through protected
-- server-side reporting adapters, not direct claim table access.
alter table public.claim_tracking enable row level security;
drop policy if exists "claims_public_insert" on public.claim_tracking;
drop policy if exists "claims_staff_read"     on public.claim_tracking;
drop policy if exists "claims_staff_manage"   on public.claim_tracking;
create policy "claims_public_insert" on public.claim_tracking
  for insert to anon, authenticated
  with check (true);
create policy "claims_staff_read" on public.claim_tracking
  for select to authenticated
  using (public.current_app_role()
           in ('administrator','claims_officer','reviewer','assessment_officer','finance_officer'));
create policy "claims_staff_manage" on public.claim_tracking
  for all to authenticated
  using (public.current_app_role() in ('administrator','claims_officer'))
  with check (public.current_app_role() in ('administrator','claims_officer'));

-- ----------------------------------------------------------------------------
-- Grants (RLS still governs row visibility)
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant insert on public.enquiries to anon;
grant insert on public.claim_tracking to anon;
grant all on all tables in schema public to service_role;
grant execute on all functions in schema public
  to anon, authenticated, service_role;

-- ============================================================================
-- Done. Next: run `bun run setup` to create the bootstrap administrator,
-- assign the `administrator` role, and seed demo content.
-- ============================================================================