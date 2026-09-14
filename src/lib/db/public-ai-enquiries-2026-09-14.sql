-- OWC public AI confirmed-enquiry metadata migration
-- Idempotent upgrade for already-provisioned Supabase/PostgreSQL databases.

alter table public.enquiries
  alter column email drop not null;

alter table public.enquiries
  add column if not exists reference text,
  add column if not exists source_channel text,
  add column if not exists language text,
  add column if not exists linked_claim_reference text,
  add column if not exists ai_summary text,
  add column if not exists route_destination text,
  add column if not exists priority text,
  add column if not exists confirmed_at timestamptz,
  add column if not exists notification_status text;

create unique index if not exists idx_enquiries_reference
  on public.enquiries (reference)
  where reference is not null;

create index if not exists idx_enquiries_confirmed_at
  on public.enquiries (confirmed_at desc)
  where confirmed_at is not null;

create index if not exists idx_enquiries_route_destination
  on public.enquiries (route_destination)
  where route_destination is not null;

-- AI-routed referrals are persisted through a trusted server route only after
-- user confirmation. Existing public contact-form insert policy remains for the
-- legacy contact form; the AI endpoint never exposes service-role credentials.
