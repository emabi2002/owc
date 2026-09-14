# OWC Self-Hosted Live Bid Environment — Design

Date: 2026-09-14
Status: Approved architecture for bidding/evaluation environment
Target URL: https://owc.lagoonpng.com
Source branch: `main`

## 1. Objective

Present the OWC solution as a credible, continuously available, production-like system for tender evaluation while the contract has not yet been awarded.

The environment must run from Lagoon Technology's own domain and infrastructure rather than depend on Netlify as the target hosting platform. It must exercise the real OWC application code, authentication boundaries, database-backed workflows, audit controls, evidence handling, role separation, operational dashboards, and integration orchestration already implemented in the repository.

This is an evaluation/bidding environment, not the future OWC production environment. Post-award production infrastructure, OWC-owned domains, live government identity, authoritative external-agency APIs, production payment rails, production security accreditation, and formal operational acceptance remain separate work.

## 2. Public endpoint and hosting model

The canonical evaluation URL is:

`https://owc.lagoonpng.com`

The target runtime architecture is:

`Internet -> DNS -> TLS/Nginx -> Next.js on 127.0.0.1:3000 -> PM2 -> OWC application -> demonstration data/integration services`

The host baseline is Ubuntu Server 24.04 LTS. Nginx is the only public application ingress. The Next.js process listens privately on the server and is managed by PM2. TLS is mandatory.

GitHub `main` is the active source branch for the bidding release. The existing health-checked release script remains the deployment mechanism so each approved `main` revision can be fast-forwarded, built, reloaded, health-checked, and rolled back at application-code level if the new revision fails.

The existing Netlify deployment may remain temporarily reachable only until DNS/server cutover is completed, but it is not part of the target architecture and must not be described as the final bidding host.

## 3. Realism and disclosure

The bidder-facing experience should look and behave like an operational OWC service. Public claimant, employer and informational screens should not be covered by large developer/test banners.

Because the contract has not yet been awarded, the public endpoint must not falsely imply that Lagoon Technology is already operating the official OWC production service. A discreet, persistent evaluation disclosure must remain available in the footer or equivalent public chrome, for example:

`Evaluation Demonstration — not the official OWC production service.`

Staff authentication, administrator screens, audit views, service-control screens and release evidence may identify the environment more explicitly as `DEMONSTRATION`.

The application must never represent synthetic agency responses, simulated payments, reference malware scanning, reference notifications or reference CPPS processing as authoritative production transactions.

## 4. Identity and access

The public bid environment uses the already-approved demonstration identity provider:

- `OWC_IDENTITY_MODE=demonstration`
- signed HttpOnly demonstration sessions
- MFA for privileged staff personas
- role-scoped authorization
- auditable login/MFA/logout/denial events

The existing seven demonstration personas remain available. Staff separation of duties remains enforced between Administrator, Claims Officer, Assessment Officer, Finance Officer and Content Editor. Employer and Claimant identities must not pass staff authorization checks.

The live Supabase/IdP path remains preserved in code for post-award migration but is not silently used as a fallback if demonstration identity is selected.

## 5. Data persistence and demonstration state

The evaluation system should feel persistent between presentation sessions. Where the current application already supports Supabase-backed records, the bidding environment should use a dedicated non-production Supabase project or equivalent dedicated demonstration data store.

The deterministic synthetic baseline remains the reset source for demonstrations and rehearsals. Reset functions remain Administrator-only and guarded by both demonstration identity mode and the explicit reset flag.

No actual claimant, employee, medical, banking or government-agency personal data is required for the bidding environment. Demonstration records must remain synthetic.

## 6. Integration behaviour

The evaluation environment enables the controlled reference/sandbox ecosystem needed to demonstrate end-to-end orchestration:

- reference CPPS
- NID identity verification simulation
- IPA/employer verification simulation
- IRC compliance simulation
- employer/payroll simulation
- medical certification simulation
- insurance simulation
- bank/payment simulation
- email/SMS notification simulation
- demonstration evidence repository and scanner where configured

These integrations must produce realistic transaction traces, service states, failures, recoveries and audit evidence without contacting or impersonating authoritative government systems.

No production CPPS or production agency credential is required for the bid environment.

## 7. Payment safety boundary

Payment screens and workflow states may be realistic and may demonstrate approval, scheduling, idempotency, reconciliation state and completion evidence.

However:

- `simulation=true`
- `moneyMovement=false`
- no real payment API endpoint or payment credential is configured
- `OWC_PAYMENT_API_BASE_URL` and `OWC_PAYMENT_API_KEY` remain prohibited from the demonstration configuration

A bidder presentation can therefore demonstrate the complete business process without creating a capability to transfer funds.

## 8. Evidence, files and notifications

The bidding environment may accept synthetic evidence uploads and demonstrate malware-scanning decisions, evidence metadata, officer access and claim linkage.

Reference scanner and reference evidence-repository modes are permitted only under the demonstration configuration. They are not evidence of production malware protection or an approved production records repository.

Notifications may be recorded and displayed through the reference notification gateway. Unless a separately approved non-production email/SMS provider is intentionally configured, the system must not imply that a real claimant or employer has been contacted.

## 9. Domain, TLS and Nginx

The repository's Nginx configuration and Ubuntu deployment documentation must be adapted from the placeholder `owc.gov.pg` domain to the approved bidder-controlled domain `owc.lagoonpng.com`.

TLS certificates must cover `owc.lagoonpng.com`. Port 3000 remains private; only ports required for SSH administration and HTTPS/HTTP redirection are exposed through the host firewall.

Security headers, request-size limits, login throttling, general rate limiting and the existing reverse-proxy controls remain enabled.

## 10. Deployment from `main`

The deployment source is GitHub `main`.

The intended release sequence is:

1. repository CI passes;
2. the approved `main` revision is fetched by the Ubuntu host;
3. lockfile-pinned dependencies are installed;
4. the Next.js production build succeeds;
5. PM2 reloads the application;
6. `/api/health` succeeds locally;
7. the public HTTPS endpoint is smoke-tested;
8. if the application health check fails, the release script restores the prior application revision.

GitHub-hosted secrets may be used only for deployment transport (host/user/path/SSH key) where GitHub Actions SSH deployment is selected. Runtime application secrets remain on the host or an approved secret store and are never committed.

## 11. Demonstration runtime configuration

The host configuration will select demonstration behaviour explicitly. The expected control values include:

- `NEXT_PUBLIC_SITE_URL=https://owc.lagoonpng.com`
- `OWC_IDENTITY_MODE=demonstration`
- `OWC_ENABLE_DEMO_RESET=true`
- `OWC_ENABLE_SANDBOX=true`
- `OWC_ENABLE_REFERENCE_ECOSYSTEM=true`
- reference evidence/scanner/notification capabilities enabled only where required for the presentation
- strong randomly generated demonstration session secret
- non-default demonstration password and MFA code

No real secret values belong in the repository.

## 12. Observability and recovery

The host must provide at minimum:

- PM2 process status and restart-on-failure
- local `/api/health` monitoring
- Nginx access/error logs
- application logs without secret leakage
- application-code rollback through the existing release script
- a documented manual recovery path if both a new release and rollback fail health checks

This bidding environment does not claim formal production RPO/RTO, disaster-recovery certification or government operational acceptance.

## 13. Netlify boundary

Netlify is not the target host for the approved bidding architecture.

Any existing Netlify site/domain binding is considered transitional. The application code may retain compatibility files temporarily if removing them would create unnecessary risk, but the public presentation and deployment documentation must identify the Ubuntu/Nginx/PM2 environment as the live bidding host once DNS cutover is verified.

Removal of Netlify-specific repository files is optional and should occur only if it improves clarity without breaking existing emergency fallback capability.

## 14. Post-award migration

After contract award, this bidding environment is reviewed rather than automatically promoted to production.

The production programme will separately establish:

- OWC-approved production domain and hosting ownership
- authoritative identity/SSO
- production database and object storage
- approved CPPS and external-agency integrations
- production malware scanning and notification services
- production payment integration where legally and operationally authorized
- logging/SIEM, monitoring and alerting
- formal backups, recovery objectives and restore evidence
- vulnerability/security testing
- data migration and reconciliation
- operational handover and formal acceptance

The application architecture should allow those providers to replace the demonstration adapters without redesigning core workflows.

## 15. Acceptance criteria for the bidding environment

The self-hosted bid environment is complete only when all of the following are evidenced:

1. `https://owc.lagoonpng.com` resolves to the nominated self-hosted environment rather than the transitional Netlify origin.
2. TLS is valid and HTTP redirects to HTTPS.
3. Nginx proxies only to the private Next.js listener.
4. PM2 automatically manages the OWC process.
5. the deployed revision corresponds to an identified `main` commit.
6. `/api/health` passes locally and the public site passes smoke testing.
7. demonstration identity, MFA and role separation function correctly.
8. synthetic claims persist and can be reset through the guarded Administrator control.
9. all demonstration integrations show realistic success/failure/recovery behaviour while remaining non-authoritative.
10. the seven presentation UAT scenarios pass on the hosted environment.
11. payment evidence remains `simulation=true` and `moneyMovement=false`.
12. no real payment or authoritative agency credentials are present.
13. public presentation contains a discreet evaluation/non-production disclosure without visually dominating normal user workflows.
14. repository CI, type checking and production build are green for the deployed commit.
15. the environment is described as a live evaluation/bidding system, not as the awarded OWC production service.
