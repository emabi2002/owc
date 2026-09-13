# OWC Operational Administration Model

## Purpose

This runbook defines how the Office of Workers' Compensation (OWC) digital service is administered after implementation and throughout the required support period. It is a role-based operating framework: the repository defines responsibilities, while OWC must assign a **named owner** and approved contact/escalation channel to each operational function before go-live.

## Operating principles

- One accountable service model covers the public portal, claims support functions, Drupal CMS, application/database/storage, evidence controls and integrations.
- Monitoring alerts, user incidents, security events, failed changes and recovery failures feed the common incident process.
- CPPS remains authoritative for production claims/payment state; OWC operations may reconcile but must not override that authority.
- Operational records use technical metadata and correlation IDs where possible and must not contain claimant evidence, medical/banking data or credentials.
- Repository readiness does not mean a named team, help desk, monitoring platform or support contract has been activated.

## Functional ownership

| Role | Core accountability | Production activation requirement |
| --- | --- | --- |
| **OWC Service Owner** | Business accountability, service acceptance, priority decisions, SLA approval and risk acceptance | Named owner and delegate |
| **OWC Operations Coordinator** | Daily service coordination, incident register, maintenance calendar, service reporting and escalation coordination | Named owner, service mailbox/phone/channel |
| **Tier-1/Tier-2 Support** | User intake, triage, known-workaround guidance, account/functional administration and escalation | Activated service desk/intake path |
| **Application/Tier-3 Engineering** | Complex diagnosis, application/integration defects, code/configuration fixes, release engineering and root-cause analysis | Named engineering support owner/vendor |
| **Infrastructure/Platform Operations** | Ubuntu/container platform, Nginx, TLS, process health, network/firewall, capacity and host monitoring | Named platform owner and alert destination |
| **Database/Storage Operations** | Application DB, Drupal DB/media, evidence storage availability, backups and recovery execution | Named database/storage owner |
| **CMS Administration** | Drupal editorial service, moderation/workflow administration and editor-access coordination | Named CMS administrator |
| **Identity/Security** | IdP/MFA/RBAC, security incidents, vulnerability remediation, credential/security governance | Named security/identity owner |
| **CPPS / Integration Liaison** | CPPS/external agency coordination, interface ownership, dependency escalation and reconciliation | Named CPPS/agency contacts |

One person may perform several functions in a small team, but each responsibility must still have a named owner in the production service register.

## Daily administration

The Operations Coordinator should review, using the approved tools:

- public and local application health;
- monitoring/alert queue and unresolved incidents;
- failed authentication/security signals requiring review;
- notification retry/backlog condition;
- scanner/integration availability where applicable;
- backup outcomes and recovery exceptions;
- certificate/capacity warnings;
- planned changes and maintenance;
- outstanding CPPS/agency dependency issues.

Sensitive readiness detail remains in authenticated administration/operations channels, not the public health endpoint.

## Operational records

Maintain at minimum:

1. service ownership/contact register;
2. incident/problem register;
3. change/release register;
4. maintenance calendar;
5. backup/recovery evidence register;
6. security/vulnerability action register;
7. external dependency/contact register;
8. monthly service reports;
9. approved SLA/support decision record;
10. production cutover/acceptance evidence.

## Handoffs

- Tier-1 records the request/incident and basic impact.
- Tier-2 validates known configuration, access and functional procedures.
- Tier-3 receives evidence sufficient to reproduce/diagnose the technical problem without unnecessary claimant data.
- External CPPS/agency issues are routed through the Integration Liaison with correlation metadata and approved minimum data.
- Security events are routed immediately to Identity/Security and follow the security incident path in addition to normal incident tracking.

## Service review

The Service Owner and Operations Coordinator review the monthly service report, unresolved S1/S2 incident actions, recurring defects, security findings, backup/recovery evidence, capacity trends, integration risks, planned maintenance and Tier-3 workload.

Operational acceptance is complete only after named owners, contacts, support hours, approved SLA targets, monitoring/alert routing, service-desk intake and the 12-month Tier-3 support commencement/end dates are formally recorded.
