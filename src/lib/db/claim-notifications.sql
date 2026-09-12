-- OWC claimant notification outbox and delivery audit baseline.
-- Apply after schema.sql in DEV/UAT before enabling persistent lifecycle notifications.

create table if not exists public.claim_notifications (
  id                  uuid primary key default gen_random_uuid(),
  claim_reference     text not null,
  event               text not null check (event in (
    'CLAIM_RECEIVED','ASSESSMENT_STARTED','DOCUMENT_REQUIRED',
    'CLAIM_APPROVED','CLAIM_DECLINED','PAYMENT_PROCESSED','CLAIM_CLOSED'
  )),
  channel             text not null check (channel in ('email','sms')),
  recipient           text,
  subject             text not null,
  message             text not null,
  status              text not null default 'queued'
                      check (status in ('queued','sent','failed','suppressed')),
  provider_message_id text,
  error_message       text,
  attempted_at        timestamptz,
  sent_at             timestamptz,
  created_by_id       uuid references public.profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists claim_notifications_claim_idx
  on public.claim_notifications (claim_reference, created_at desc);
create index if not exists claim_notifications_status_idx
  on public.claim_notifications (status, created_at);

drop trigger if exists claim_notifications_set_updated_at on public.claim_notifications;
create trigger claim_notifications_set_updated_at
before update on public.claim_notifications
for each row execute function public.set_updated_at();

alter table public.claim_notifications enable row level security;

drop policy if exists claim_notifications_staff_read on public.claim_notifications;
create policy claim_notifications_staff_read
on public.claim_notifications
for select
to authenticated
using (public.is_staff());

drop policy if exists claim_notifications_claims_write on public.claim_notifications;
create policy claim_notifications_claims_write
on public.claim_notifications
for all
to authenticated
using (public.current_app_role() in ('administrator','claims_officer'))
with check (public.current_app_role() in ('administrator','claims_officer'));

-- Delivery is performed server-side only. Do not expose notification-provider
-- credentials to the browser or allow anonymous inserts into this table.
