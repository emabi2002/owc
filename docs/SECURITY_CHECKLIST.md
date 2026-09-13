# OWC Security Checklist

This checklist is the repository-side security baseline for the OWC portal ecosystem. It is mapped to **OWASP Top 10:2025** and uses **OWASP ASVS 5.0.0** as a verification reference for independent assessment.

Passing repository checks does **not** mean OWC is certified, fully ASVS compliant, penetration-tested or approved for production. The independent assessor must record the exact ASVS requirements actually tested and the evidence/results obtained in the approved environment.

## OWASP Top 10:2025 mapping

| Risk | OWC repository control / evidence | Production verification still required |
| --- | --- | --- |
| **A01:2025 Broken Access Control** | Application RBAC, server permission checks, Supabase RLS, active-account role helpers, profile self-escalation protection, server-only external connectors. | Role-by-role abuse tests, IDOR/object-access tests, administrator/MFA acceptance and direct API/RLS testing. |
| **A02:2025 Security Misconfiguration** | Security headers, production Nginx baseline, fail-closed production preflight, protected runtime-secret boundary, sandbox/reference modes explicitly gated. | Deployed header/TLS review, host/firewall/WAF configuration review, cloud/Supabase/Drupal configuration assessment. |
| **A03:2025 Software Supply Chain Failures** | Lockfile-pinned build, frozen dependency install in CI, controlled release process and versioned deployment scripts. | Independent SCA/dependency review, update/remediation decisions, build/deployment provenance review. |
| **A04:2025 Cryptographic Failures** | TLS 1.2/1.3 edge baseline, HTTPS requirements for production connectors, no credentials placed in browser-facing integration code. | Certificate/cipher verification, secret storage/rotation review, encryption-at-rest/provider evidence. |
| **A05:2025 Injection** | Zod validation, parameterised Supabase/PostgREST access, bounded server-side connector paths, no user-controlled absolute upstream URLs. | Dynamic injection testing across forms, APIs, search, CMS, integrations and uploaded metadata. |
| **A06:2025 Insecure Design** | Reference/live separation, fail-closed dependency modes, evidence upload grants, malware-scan policy, idempotent synthetic payment design, recovery/cutover gates. | Threat-model review against actual production topology and external agency contracts. |
| **A07:2025 Authentication Failures** | Supabase Auth boundary, administrator MFA capability, rate limiting, Drupal OIDC/SSO controls, active/suspended profile enforcement. | MFA enrolment, session/cookie tests, lockout/rate-limit tests, SSO/group mapping and break-glass acceptance. |
| **A08:2025 Software or Data Integrity Failures** | CI build verification, checksum-protected backup sets, controlled application release/rollback, evidence hashes and audit records. | Production deployment-control review, restore integrity rehearsal, storage/database integrity and external transaction reconciliation. |
| **A09:2025 Security Logging and Alerting Failures** | Audit model, metadata-only integration telemetry, shallow health endpoint, operational monitoring/incident runbooks. | Alert routing, failed-login/security-event visibility, retention approval, incident drill and log-access review. |
| **A10:2025 Mishandling of Exceptional Conditions** | Connector timeouts, isolated upstream errors, fail-closed scanning/integration readiness, release rollback and recovery runbooks. | Dynamic failure-path testing for unavailable dependencies, malformed responses, rate limits, timeouts and partial transactions. |

## Database access-control checks

- [ ] `current_app_role()` returns privileged roles only for `status = 'active'` profiles.
- [ ] `is_staff()` requires an active authenticated profile.
- [ ] Non-administrator self-service updates cannot change `email`, `role`, `status` or `mfa_enabled` through the direct database/API surface.
- [ ] Suspended/invited users cannot use staff RLS policies.
- [ ] Administrator/service-role management is tested separately and remains auditable.
- [ ] RLS is tested using real anon/authenticated tokens for every production role in UAT.

## Headers and browser security

- [ ] Application security headers are present from `next.config.js`.
- [ ] Production Nginx CSP excludes `unsafe-eval`.
- [ ] Production framing policy permits only the approved production origin(s).
- [ ] Deployed CSP is reviewed for removal of remaining `unsafe-inline` through nonce/hash adoption where feasible.
- [ ] HTTPS/HSTS/TLS behavior is verified externally on the nominated environment.

## Secrets and credentials

- [ ] `.env.local` and private-key material are not tracked by Git.
- [ ] Service-role, evidence-signing, scanner, notification, OIDC, CPPS and agency credentials remain server-side and outside the repository.
- [ ] Production credentials are stored in an approved secret store/runtime environment with named ownership and rotation procedure.
- [ ] Browser bundles/network traces are checked for accidental credential exposure.

## Authentication and authorization

- [ ] Administrator MFA is enrolled and tested.
- [ ] Drupal OIDC/SSO user/group mappings are verified against the production identity provider.
- [ ] Suspended accounts lose application/CMS administrative access.
- [ ] Break-glass access is controlled, logged and tested.
- [ ] Role changes generate appropriate audit evidence and cannot be self-assigned.

## Public forms, uploads and abuse controls

- [ ] Production CAPTCHA is configured and bypass attempts are tested.
- [ ] Application and edge rate limits are tested in the deployed topology.
- [ ] Evidence uploads enforce approved MIME/type/size/path rules.
- [ ] Malware scanning fails closed where required and infected-file behavior is demonstrated.
- [ ] Public error responses do not disclose secrets, stack traces, claimant data or upstream payloads.

## Infrastructure and integrations

- [ ] Public exposure is limited to approved TLS/Nginx endpoints; application/database/CMS administration is not unintentionally exposed.
- [ ] Production connectors use approved HTTPS/private networking and server-side credentials.
- [ ] NID, employer registry, insurance, payments, medical and CPPS integrations are assessed against authoritative contracts when available.
- [ ] Reference/sandbox services are disabled or clearly isolated in production.

## Data protection and retention

- [ ] Claimant evidence, medical and bank information is excluded from ordinary logs/telemetry.
- [ ] Evidence storage access, legal hold and retention controls are reviewed.
- [ ] Audit-log retention policy is formally approved by OWC/legal/records authority; no repository document invents a fixed retention period.
- [ ] Backup/PITR/off-host retention and restore evidence are verified in the approved environment.
- [ ] Privacy notice and data-handling statement are reviewed against the actual deployed data flows.

## Independent assessment gate

Before production security acceptance, complete the scope and evidence templates under `docs/security/`, record findings, remediate/retest as required, and obtain formal security and business-owner sign-off. Repository readiness alone is insufficient.
