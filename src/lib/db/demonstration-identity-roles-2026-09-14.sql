-- OWC demonstration identity role extension — 14 September 2026
-- Safe to apply to an already-provisioned OWC PostgreSQL/Supabase database.
-- The values are also part of the application AppRole contract.

alter type public.app_role add value if not exists 'assessment_officer';
alter type public.app_role add value if not exists 'finance_officer';
