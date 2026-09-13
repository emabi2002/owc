-- OWC demonstration identity role extension — 14 September 2026
-- Safe to apply to an already-provisioned OWC PostgreSQL/Supabase database.
-- The values are also part of the application AppRole contract.

alter type public.app_role add value if not exists 'assessment_officer';
alter type public.app_role add value if not exists 'finance_officer';

-- Keep live/post-award database authorization aligned with application RBAC.
-- Compare the enum as text so this policy can be declared safely in the same
-- migration invocation that introduces the new enum values.
drop policy if exists "claims_staff_read" on public.claim_tracking;
create policy "claims_staff_read" on public.claim_tracking
  for select to authenticated
  using (public.current_app_role()::text in (
    'administrator',
    'claims_officer',
    'reviewer',
    'assessment_officer',
    'finance_officer'
  ));
