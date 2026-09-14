# OWC Cloud-First Live Bid Environment — Design

Date: 2026-09-14
Status: Approved architecture for bidding/evaluation environment and production direction
Target URL: https://owc.lagoonpng.com
Source branch: `main`

## 1. Objective

Present the OWC solution as a credible, continuously available national online service for tender evaluation while the contract has not yet been awarded.

The platform must support users across Papua New Guinea using desktop browsers, mobile browsers, tablets and future mobile applications. The architecture is therefore cloud-first, internet-accessible and API-oriented. It must remain portable so the eventual production deployment can run in an approved commercial cloud, PNG data centre, government cloud or equivalent managed environment without redesigning the OWC business workflows.

This is still an evaluation/bidding environment. It must not be represented as the awarded OWC production service.

## 2. Canonical public endpoint

The bidding/evaluation URL is:

`https://owc.lagoonpng.com`

That URL remains stable even if the underlying hosting provider changes. DNS can later be redirected to the selected production cloud without changing the user-facing address.

## 3. Cloud-first hosting model

The target logical architecture is:

`Users -> Internet -> DNS/CDN/WAF -> HTTPS -> OWC application/API -> managed database/object storage -> secure external integrations`

The application runtime may use Linux/Ubuntu containers or virtual machines, but the operating system is an implementation detail rather than a requirement for an office-based server.

The primary public service must not depend on a single physical server located inside the OWC office. On-premise infrastructure may later be used for integration gateways, reporting replicas, archives or private systems, but it is not the preferred primary national public hosting model.

## 4. National access requirements

The platform must be designed for workers, employers and OWC staff connecting from different provinces and network conditions.

The web experience must remain responsive across wide desktop displays, laptops, tablets and mobile phones. The future mobile application should use the same secure backend APIs as the web application.

Where practical, mobile workflows should tolerate poor or intermittent connectivity by allowing data entry to be retained locally until submission can complete safely.

## 5. Public web and mobile architecture

The preferred long-term structure is:

- public responsive web application;
- mobile application using the same backend API layer;
- centrally hosted application services;
- managed PostgreSQL-compatible database;
- managed object/document storage for evidence and attachments;
- secure authentication and authorization services;
- notification services for email/SMS where approved;
- observability, logs, metrics and alerts;
- scalable ingress/load balancing where required.

The current Next.js application and API routes remain the basis of the bidding environment.

## 6. Security edge and availability

The internet-facing environment should support:

- valid TLS certificates;
- CDN/static asset caching where appropriate;
- web application firewall capability;
- rate limiting and login throttling;
- DDoS protection appropriate to the selected provider;
- security headers;
- health checks and restart/recovery controls;
- backup and restore procedures;
- central logs without secret leakage.

Formal production RPO/RTO, disaster recovery, penetration testing and government security accreditation remain post-award activities.

## 7. Identity and role separation

The bidding environment continues to use the approved demonstration identity model unless a dedicated non-production identity provider is intentionally configured.

The existing roles remain separated between Administrator, Claims Officer, Assessment Officer, Finance Officer, Content Editor, Employer Representative and Claimant.

Privileged functions remain protected by MFA and auditable authorization controls.

## 8. Data and persistence

The bidding environment should use persistent non-production data storage so demonstrations feel operational between sessions.

Synthetic claimant, employer, medical, financial and agency records remain the default dataset for the bid. No real production claimant or government data is required at this stage.

The deterministic demonstration reset remains Administrator-only and explicitly guarded.

## 9. Documents and evidence

Claim evidence, medical documents and other attachments should be stored in a dedicated non-production object/document store rather than relying on local web-server disk as the long-term architecture.

The bidding environment may continue using the reference evidence and malware-scanning adapters where configured. These must not be described as approved production controls.

## 10. External and government integrations

The cloud platform must integrate with external systems through secure APIs, private networking, VPNs or integration gateways rather than exposing internal databases directly to the public internet.

Potential integrations include CPPS, NID, IPA, IRC, employer/payroll systems, medical/insurance services, notifications and finance/payment systems.

During the bid these remain controlled reference/sandbox simulations unless an explicitly approved non-production endpoint is available.

## 11. Hybrid integration option

If OWC later retains sensitive databases or legacy systems on-premise, the cloud application may communicate with them through a tightly controlled private connection or integration gateway.

The preferred pattern is:

`OWC cloud application -> secure API/VPN/private tunnel -> OWC private network -> internal system`

An internal database must not be made directly internet-accessible merely to support the public portal.

## 12. Payment safety boundary

Payment workflow screens may demonstrate approval, scheduling, reconciliation, idempotency and completion states.

For the bidding environment:

- `simulation=true`
- `moneyMovement=false`
- no real payment rail or production banking credential is configured
- production payment integration remains post-award and subject to legal/operational approval

## 13. Deployment source

GitHub `main` remains the active bidding source branch.

Each approved revision must pass the repository test, UAT, type-check and production-build gates before being treated as a releasable bidding revision.

The exact cloud deployment mechanism may change with the selected provider. The application must therefore avoid unnecessary provider lock-in and keep runtime configuration in environment variables or an approved secret store rather than source control.

## 14. Current hosting position

`https://owc.lagoonpng.com` is already publicly reachable and is the correct domain for the bid demonstration.

The present hosting arrangement may remain in place for the bidding phase while the cloud production provider has not yet been selected. The repository must not falsely claim that a specific Ubuntu, government or production cloud environment is active unless that deployment has actually been verified.

The bidding objective is a realistic, continuously available online demonstration. The contract-award phase will establish the formal production hosting provider and ownership model.

## 15. Post-award production programme

After award, the production programme will separately establish:

- OWC-approved cloud/provider and ownership model;
- production domain/DNS control;
- production database and object storage;
- authoritative identity/SSO;
- approved CPPS and agency integrations;
- production notification services;
- production payment integration where authorized;
- backups, point-in-time recovery and restore evidence;
- monitoring, alerting and SIEM integration;
- vulnerability and penetration testing;
- mobile application release and distribution;
- data migration and reconciliation;
- operational support, handover and formal acceptance.

The bidding environment is reviewed and hardened after award; it is not automatically declared production simply because it is publicly accessible.

## 16. Architectural decision

The approved OWC direction is:

**Cloud-first national online platform, accessible through web and mobile channels, with secure API-based integration to OWC and government systems and the option for private hybrid connections where internal systems remain on-premise.**

A conventional office-based server is not the preferred primary hosting model for the national public service.
