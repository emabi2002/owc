-- Read-only verification boundary for trusted deployment checks.
create or replace function public.owc_demo_verification_summary()
returns jsonb
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select jsonb_build_object(
    'scenarioIds', (select jsonb_agg(scenario_id order by scenario_id) from owc_core.scenarios),
    'claimCount', (select count(*) from owc_core.claims),
    'identityCount', (select count(*) from nid_registry.persons),
    'companyCount', (select count(*) from ipa_registry.companies),
    'taxpayerCount', (select count(*) from irc_registry.taxpayers),
    'medicalCertificateCount', (select count(*) from health_registry.medical_certificates),
    'policyCount', (select count(*) from insurance_registry.policies),
    'employeeCount', (select count(*) from employment_registry.employees),
    'bankAccountCount', (select count(*) from banking_registry.accounts),
    'serviceCount', (select count(*) from integration_hub.service_state),
    'privateBucketIds', (
      select jsonb_agg(id order by id)
      from storage.buckets
      where id like 'owc-%' and public = false
    ),
    'paymentSafetyConstraints', (
      select count(*) >= 2
      from pg_constraint c
      join pg_class t on t.oid = c.conrelid
      join pg_namespace n on n.oid = t.relnamespace
      where n.nspname = 'banking_registry'
        and t.relname = 'simulated_transactions'
        and c.contype = 'c'
        and (
          pg_get_constraintdef(c.oid) ilike '%money_movement = false%'
          or pg_get_constraintdef(c.oid) ilike '%simulation = true%'
        )
    )
  );
$$;

revoke all on function public.owc_demo_verification_summary() from public, anon, authenticated;
grant execute on function public.owc_demo_verification_summary() to service_role;
