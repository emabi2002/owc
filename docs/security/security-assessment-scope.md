# OWC Independent Security Assessment Scope

## Objective

Define the minimum scope for an **independent** security assessment of the OWC portal ecosystem before production security acceptance. The assessment should use **OWASP Top 10:2025** as the risk-awareness baseline and **OWASP ASVS 5.0.0** as the technical verification reference where applicable.

This scope does not assert blanket ASVS compliance. The assessor must record the exact versioned ASVS requirement identifiers actually tested, the method used and the result.

## Authorized target environment

Assessment must be performed only against an OWC-approved UAT/staging target unless a separately documented authorization explicitly permits another environment. Production and third-party government systems must not be subjected to destructive or intrusive testing without written authorization from their owners.

Record before testing:

- approved base URL(s), API endpoints and IP ranges;
- test window and time zone;
- assessor organization and named testers;
- OWC technical/security contacts;
- permitted and prohibited techniques;
- test accounts and role matrix;
- synthetic test claimant/employer/claim identifiers;
- external systems that are real, reference/sandbox, mocked or out of scope;
- escalation contact if service instability or sensitive-data exposure is observed.

## Application and API scope

Assess at minimum:

1. public Next.js routes, forms, search and downloadable resources;
2. claimant/claim tracking and lodgement APIs;
3. administrative routes, permission enforcement and direct API access;
4. server actions/route handlers and validation boundaries;
5. error handling and exceptional-condition behavior;
6. rate limiting, CAPTCHA and abuse controls;
7. browser security headers/CSP, cookies, caching and cross-origin behavior;
8. server-to-server CPPS and agency connector boundaries where approved endpoints are available.

## Authentication, authorization and account lifecycle

Verify:

- Supabase authentication/session behavior;
- administrator MFA and recovery behavior;
- role-by-role access-control tests including direct API calls;
- RLS behavior with real anon/authenticated tokens;
- self-service profile updates cannot change `email`, `role`, `status` or `mfa_enabled` without administrator authority;
- invited/suspended users do not retain staff privileges;
- administrator role changes and suspension/reactivation are auditable;
- Drupal OIDC/SSO group-to-role mapping and break-glass access where the real IdP is available.

## CMS and content workflow

Assess Drupal and the Next.js/Drupal trust boundary for:

- authentication and editorial authorization;
- draft/review/publish workflow bypass;
- JSON:API exposure;
- administrative-route exposure;
- content injection/stored XSS;
- file/media upload constraints;
- configuration and secret exposure.

## Claim evidence and sensitive data

Assess:

- signed/claim-scoped upload authorization;
- file type, MIME, filename/path and size validation;
- malware-scanner behavior and fail-closed policy where required;
- private object-storage access and signed retrieval;
- legal-hold/retention metadata controls;
- absence of claimant evidence, medical detail and bank detail from ordinary logs, telemetry and public error responses.

Use synthetic documents and synthetic claimant data. Do not place real claimant evidence into assessment reports.

## Database and Supabase

Verify:

- RLS is enabled and effective on sensitive/administrative tables;
- active-account enforcement in role/staff helper functions;
- privilege-escalation resistance on `profiles`;
- anon/public insert surfaces cannot read or alter unrelated records;
- service-role credentials are not exposed to browsers;
- database/storage configuration follows least privilege;
- backup/PITR and restore controls are reviewed as security dependencies.

## External integrations

Where authoritative UAT interfaces exist, test OWC's side of the contract for CPPS, identity/NID, employer registry, insurance, payments, medical-provider and notification services. Verify authentication, authorization, path/origin restrictions, timeouts, rate/error handling and minimum-data exchange.

Reference/sandbox services may be used for functional security testing but must be explicitly labelled; success against a synthetic service is not evidence of live agency security acceptance.

## Infrastructure and operations

Assess the approved deployment for:

- HTTPS/TLS and certificate lifecycle;
- Nginx security headers and production CSP;
- host/firewall exposure and process permissions;
- runtime secret storage;
- deployment/rollback controls;
- dependency/software supply-chain exposure;
- logs, alerting and security incident routing;
- backup/recovery access and integrity.

## Testing techniques expected

The assessor should combine authenticated and unauthenticated manual testing with appropriate automated tooling for web/API vulnerability testing, dependency/SCA review and infrastructure/configuration review. Automated results require manual validation before findings are accepted.

## Data-handling rule

Assessment evidence must not contain production secrets, complete authentication tokens, private keys, real claimant evidence, medical detail, bank information or unrestricted upstream payloads. Use correlation IDs, redacted screenshots and synthetic identifiers where evidence is needed.

## Deliverables

- executive and technical assessment report;
- tested-scope/environment statement;
- OWASP Top 10:2025 and applicable ASVS 5.0.0 evidence references;
- findings with reproducible evidence and impact;
- remediation recommendations;
- retest results for remediated go-live blockers;
- unresolved risk acceptance decisions signed by authorized OWC authority;
- final security recommendation/sign-off status.
