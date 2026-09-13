# OWC Security Finding Register

Use one row per independently validated security finding. Automated scanner output is not a finding until reviewed and validated. Do not place secrets, real claimant evidence, medical detail or bank information in this register.

## Status values

`OPEN` · `REMEDIATION IN PROGRESS` · `READY FOR RETEST` · `RETEST FAILED` · `CLOSED` · `RISK ACCEPTED`

## Finding register

| Finding ID | Title | Component | OWASP Top 10:2025 | ASVS 5.0.0 ref | Assessor severity | Evidence ref | Owner | Remediation ref / SHA | Retest result | Risk acceptance ref | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |  |  |  |

## Detailed finding record

Repeat for each finding where the table is not sufficient.

- Finding ID:
- Date identified:
- Assessor:
- Affected environment/release SHA:
- Affected component/API:
- Authentication role used:
- OWASP Top 10:2025 category:
- ASVS 5.0.0 requirement reference, if actually tested:
- Severity/rating method:
- Description:
- Preconditions:
- Reproduction steps using synthetic data:
- Security/business impact:
- Redacted evidence reference:
- Correlation/log reference:
- Recommended remediation:
- OWC remediation owner:
- Remediation branch/PR/SHA:
- Remediation validation performed by engineering:
- Independent retest date:
- Independent retest result:
- Residual risk:
- Risk acceptance required: Yes / No
- Authorized risk acceptance reference:
- Closure date:
- Final status:

## Go-live blocker rule

Findings affecting authentication, authorization/RLS, claimant evidence confidentiality/integrity, production secrets, payment/integration trust, unrestricted administrative access or material data integrity are go-live blockers when the independent assessor/security owner rates their residual impact as unacceptable. They remain open until remediation and retest succeed, or until an authorized OWC authority records explicit risk acceptance.

No developer, CI job or reference/sandbox test may silently downgrade an assessor finding or mark a production risk accepted.
