-- Cover demonstration foreign keys used by joins and referential checks.
create index if not exists banking_accounts_bank_id_idx
  on banking_registry.accounts (bank_id);
create index if not exists banking_transactions_account_reference_idx
  on banking_registry.simulated_transactions (account_reference);
create index if not exists employment_employees_registration_no_idx
  on employment_registry.employees (employer_registration_no);
create index if not exists employment_wage_snapshots_employee_no_idx
  on employment_registry.wage_snapshots (employee_no);
create index if not exists health_certificates_facility_id_idx
  on health_registry.medical_certificates (facility_id);
create index if not exists health_certificates_practitioner_id_idx
  on health_registry.medical_certificates (practitioner_id);
create index if not exists health_practitioners_facility_id_idx
  on health_registry.practitioners (facility_id);
create index if not exists insurance_policies_insurer_id_idx
  on insurance_registry.policies (insurer_id);
create index if not exists owc_claimants_scenario_id_idx
  on owc_core.claimants (scenario_id);
create index if not exists owc_claims_claimant_id_idx
  on owc_core.claims (claimant_id);
create index if not exists owc_claims_employer_id_idx
  on owc_core.claims (employer_id);
create index if not exists owc_claims_scenario_id_idx
  on owc_core.claims (scenario_id);
