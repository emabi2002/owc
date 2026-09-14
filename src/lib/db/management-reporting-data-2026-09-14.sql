-- OWC management reporting data extension
-- Idempotent upgrade for already-provisioned PostgreSQL/Supabase databases.
-- All fields are optional so existing claim lodgement and tracking flows remain valid.

alter table public.claim_tracking
  add column if not exists province text,
  add column if not exists district text,
  add column if not exists industry text,
  add column if not exists occupation text,
  add column if not exists decision text,
  add column if not exists compensation_amount_pgk numeric(14,2),
  add column if not exists turnaround_days integer,
  add column if not exists notification_status text,
  add column if not exists payment_status text,
  add column if not exists assigned_officer text;

create index if not exists idx_claims_province
  on public.claim_tracking (province);

create index if not exists idx_claims_lodged_date
  on public.claim_tracking (lodged_date);
