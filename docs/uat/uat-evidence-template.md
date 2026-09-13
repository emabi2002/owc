# OWC UAT Evidence and Sign-off Template

Use this template for both reference and formal UAT. Every record must identify the service/environment mode so synthetic evidence is not mistaken for live acceptance.

## Test identification

- UAT reference:
- Release Git SHA:
- Environment:
- Service mode: `REFERENCE/SANDBOX` / `LIVE UAT` / `UNAVAILABLE`
- Test date/time:
- Tester name:
- Tester role:
- Browser/device where applicable:
- Synthetic/approved test dataset reference:

## Result values

Use only:

- `PASS`
- `FAIL`
- `BLOCKED/DEPENDENCY`
- `NOT APPLICABLE`

A live dependency that is unavailable is `BLOCKED/DEPENDENCY`; do not replace it with a reference success and mark it live.

## Test evidence record

Repeat per test/scenario.

- Test/scenario ID:
- Requirement/business process:
- Preconditions:
- Expected result:
- Actual result:
- Result:
- Service mode:
- Synthetic data used: Yes / No
- Claim/reference identifier (synthetic or approved UAT only):
- Correlation ID(s):
- Redacted screenshot/log/evidence reference:
- Defect/finding reference:
- Retest required: Yes / No
- Tester comments:

## Data-handling rule

Do not put production secrets, passwords, private keys, complete tokens, real claimant evidence, medical detail, unrestricted bank information or unrestricted CPPS/agency payloads in UAT evidence. Use synthetic data, redacted evidence and correlation IDs.

For `REFERENCE/SANDBOX` payment scenarios, evidence must explicitly state **no real funds moved**.

## Automated reference-suite evidence

- JSON artifact name/path:
- `REFERENCE/SANDBOX` mode confirmed: Yes / No
- `syntheticData=true`: Yes / No
- `productionAcceptance=false`: Yes / No
- `REF-UAT-001` result:
- `REF-UAT-002` result:
- `REF-UAT-003` result:
- `REF-UAT-004` result:
- `REF-UAT-005` result:
- `REF-UAT-006` result:
- `REF-UAT-007` result:
- Suite summary:
- Reviewer:

Automated reference evidence is not a human business-owner or security sign-off.

## Formal production-like UAT summary

| Area | Mode | Result | Evidence/defect/dependency reference |
| --- | --- | --- | --- |
| Public portal/navigation/content |  |  |  |
| Claims lodgement/tracking |  |  |  |
| Evidence upload/storage/scanner |  |  |  |
| CPPS |  |  |  |
| Identity/MFA/RBAC/RLS |  |  |  |
| Drupal/SSO/editorial workflow |  |  |  |
| Notifications |  |  |  |
| External agency integrations |  |  |  |
| Security controls |  |  |  |
| Browser/mobile/accessibility |  |  |  |
| Performance/operations/recovery |  |  |  |

## Outstanding items

- Open defects:
- `BLOCKED/DEPENDENCY` items:
- Accepted limitations/conditions:
- Retests outstanding:
- Security findings affecting UAT:

## Human sign-off

**Overall result:** PASS / PASS WITH CONDITIONS / FAIL / BLOCKED/DEPENDENCY

- Business-owner name/signature/date:
- Claims/business process owner name/signature/date:
- Technical/operations owner name/signature/date:
- Security owner name/signature/date:
- Project/acceptance authority name/signature/date:

No automated test or reference suite may fill these signatures on behalf of the named OWC authorities.
