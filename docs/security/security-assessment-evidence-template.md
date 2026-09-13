# OWC Security Assessment Evidence Template

Use this template for independent assessment evidence. Reference **OWASP Top 10:2025** and **ASVS 5.0.0** only for controls actually tested. Do not claim blanket certification or full compliance unless an authorized assessor has explicitly verified and documented that scope.

## Assessment identification

- Assessment reference:
- Environment/URL:
- Release Git SHA:
- Assessment dates:
- Assessor organization:
- Named assessor(s):
- OWC technical contact:
- OWC security/business owner:
- Authorization reference:
- Test-data classification: Synthetic / Approved UAT only

## Scope confirmation

| Area | In scope? | Target / component | Method | Notes |
| --- | --- | --- | --- | --- |
| Public web application |  |  |  |  |
| APIs/server actions |  |  |  |  |
| Supabase Auth/MFA |  |  |  |  |
| RBAC/RLS/direct API |  |  |  |  |
| Drupal CMS/OIDC |  |  |  |  |
| Evidence upload/storage/scanner |  |  |  |  |
| CPPS |  |  |  |  |
| External agency connectors |  |  |  |  |
| Notifications |  |  |  |  |
| Nginx/TLS/host |  |  |  |  |
| Dependencies/supply chain |  |  |  |  |
| Logging/alerting/recovery |  |  |  |  |

## Control evidence record

Repeat for each tested control.

- Evidence ID:
- Test date/time:
- Tester:
- Component:
- OWASP Top 10:2025 category (if applicable):
- ASVS 5.0.0 requirement ID (use versioned form such as `v5.0.0-x.y.z` only when actually tested):
- Test objective:
- Preconditions / role:
- Synthetic test identifiers:
- Method/tool:
- Expected secure behavior:
- Observed behavior:
- Result: PASS / FAIL / NOT APPLICABLE / NOT TESTED
- Correlation ID / log reference:
- Redacted screenshot/report reference:
- Finding ID if failed:
- Retest required: Yes / No

## Privacy and secret handling

Evidence must not contain real claimant evidence, medical detail, bank information, production passwords, private keys, service-role secrets, complete bearer tokens, OIDC client secrets or unrestricted CPPS/agency response payloads. Redact sensitive values and use synthetic identifiers plus correlation IDs.

## Environment verification

- [ ] Release SHA matches the assessed deployment.
- [ ] Reference/sandbox services are identified separately from production/UAT services.
- [ ] Test accounts and role assignments are recorded.
- [ ] MFA/SSO configuration under test is identified.
- [ ] Database/RLS schema version is recorded.
- [ ] Nginx/TLS configuration under test is recorded.
- [ ] Scanner/notification/CPPS/agency service status is identified.

## Assessment summary

- Total controls tested:
- Passed:
- Failed:
- Not applicable:
- Not tested / deferred:
- Critical findings:
- High findings:
- Medium findings:
- Low findings:
- Informational findings:
- Retest completed:
- Residual risk acceptance required:

## Sign-off

- Assessor conclusion:
- Security recommendation: APPROVE / APPROVE WITH CONDITIONS / DO NOT APPROVE
- OWC security acceptance:
- OWC business-owner acceptance:
- Outstanding risk acceptance references:
- Date:
