-- OWC secure claim evidence metadata and storage-policy baseline.
-- Apply after schema.sql in DEV/UAT before enabling persistent evidence uploads.

create table if not exists public.claim_evidence (
  id              uuid primary key default gen_random_uuid(),
  claim_reference text not null,
  category        text not null check (category in (
    'Identity','Medical','Employment','Employer','Incident','Banking','Correspondence','Other'
  )),
  title           text not null,
  file_name       text not null,
  mime_type       text not null,
  size_bytes      bigint not null default 0 check (size_bytes >= 0),
  storage_path    text not null,
  sha256          text,
  status          text not null default 'Pending Review'
                  check (status in ('Verified','Pending Review','Rejected')),
  uploaded_by     text,
  uploaded_by_id  uuid references public.profiles(id) on delete set null,
  uploaded_at     timestamptz not null default now(),
  verified_by_id  uuid references public.profiles(id) on delete set null,
  verified_at     timestamptz,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists claim_evidence_claim_reference_idx
  on public.claim_evidence (claim_reference, uploaded_at);

create index if not exists claim_evidence_category_idx
  on public.claim_evidence (category);

drop trigger if exists claim_evidence_set_updated_at on public.claim_evidence;
create trigger claim_evidence_set_updated_at
before update on public.claim_evidence
for each row execute function public.set_updated_at();

alter table public.claim_evidence enable row level security;

-- Only authenticated OWC staff may read evidence metadata.
drop policy if exists claim_evidence_staff_read on public.claim_evidence;
create policy claim_evidence_staff_read
on public.claim_evidence
for select
to authenticated
using (public.is_staff());

-- Claims officers and administrators may create/update evidence metadata.
drop policy if exists claim_evidence_claims_write on public.claim_evidence;
create policy claim_evidence_claims_write
on public.claim_evidence
for all
to authenticated
using (public.current_app_role() in ('administrator','claims_officer'))
with check (public.current_app_role() in ('administrator','claims_officer'));

-- Recommended Supabase Storage bucket (create through controlled provisioning):
--   bucket: claim-evidence
--   public: false
-- Object path convention:
--   claims/<claim-reference>/<uuid>/<sanitized-file-name>
--
-- Storage policies should require authenticated staff and should never grant
-- anonymous read access. Claimant upload routes must write through a validated
-- server endpoint that performs MIME/size checks, malware scanning integration,
-- hashing, and metadata creation rather than granting broad browser bucket access.
