# OWC Support, SLA and 12-month Tier-3 Framework

## Purpose

Define the support-layer boundaries and the approval framework for service-level targets. This document intentionally does **not** invent contractual times. Exact service hours, acknowledgement, response, restoration and resolution commitments remain subject to OWC/contract approval.

## Support layers

### Tier-1 — intake and basic assistance

- receive incidents and service requests;
- verify reporter/contact and basic impact;
- record the ticket/incident;
- provide approved user guidance and known knowledge-base responses;
- route account/access issues to the appropriate administrator;
- escalate unresolved technical issues to Tier-2.

### Tier-2 — functional and technical administration

- reproduce and triage functional issues;
- verify configuration, permissions and known operating procedures;
- review safe monitoring/audit information;
- resolve approved administrative/configuration issues;
- collect safe diagnostic evidence for engineering;
- escalate complex defects, release/integration failures and code-level issues to Tier-3.

### Tier-3 — engineering support

Tier-3 handles complex technical work requiring application/platform engineering expertise, including:

- application defect diagnosis and corrective code/configuration changes;
- complex claims/evidence workflow defects;
- Drupal ↔ Next.js integration defects;
- CPPS/Integration Hub adapter diagnosis within OWC responsibility;
- release and rollback engineering support;
- database/schema/application compatibility analysis;
- security-remediation engineering;
- performance/capacity engineering assistance;
- root-cause analysis for significant incidents;
- specialist support for backup/recovery defects in repository-managed tooling;
- knowledge transfer and runbook maintenance;
- monthly service-report contribution.

Tier-3 does not authorize production cutover, override CPPS/external authority, bypass security controls, or make changes to an external agency system it does not own.

## Required support period

The procurement operating model requires **12-month Tier-3 support**. The production service register must record the accepted commencement date, end date, support provider, OWC service owner, service hours, after-hours/on-call arrangements and commercial/contract reference.

The phrase “12-month” defines the required support duration only. It does not define a 24x7 service window or any response time.

## SLA metrics

Four metrics are controlled for each severity:

- **Acknowledgement** — confirmation the incident has been received and recorded.
- **Technical response** — appropriate support/engineering owner actively engages.
- **Restoration / workaround** — service is safely restored or an approved workaround is available.
- **Resolution / action plan** — permanent resolution is delivered or an accepted corrective plan is recorded.

### SLA decision table

| Severity | Acknowledgement | Technical response | Restoration / workaround | Resolution / action plan |
| --- | --- | --- | --- | --- |
| S1 Critical | **UNAPPROVED** | **UNAPPROVED** | **UNAPPROVED** | **UNAPPROVED** |
| S2 High | **UNAPPROVED** | **UNAPPROVED** | **UNAPPROVED** | **UNAPPROVED** |
| S3 Medium | **UNAPPROVED** | **UNAPPROVED** | **UNAPPROVED** | **UNAPPROVED** |
| S4 Low / Service Request | **UNAPPROVED** | **UNAPPROVED** | **UNAPPROVED** | **UNAPPROVED** |

All sixteen target cells remain **UNAPPROVED** until formally accepted. No service report should present SLA compliance against these fields while they remain unapproved.

## SLA decision record

Before service commencement, approve and record:

- service hours and business calendar;
- after-hours/on-call coverage;
- clock start event for each metric;
- pause rules while awaiting requester information;
- planned-maintenance exclusions;
- force-majeure/provider exclusions if contractually applicable;
- treatment of an **external dependency** where OWC/Tier-3 cannot directly restore the upstream service;
- measurement source/system of record;
- severity reassessment authority;
- communication/escalation obligations;
- service-credit or contractual consequences, if any.

## External dependencies

An outage in CPPS, NID, an agency API, notification provider, hosting provider or other external dependency is still tracked as an OWC service incident when it affects users. The ticket must separate:

1. OWC detection/response/restoration activity;
2. upstream dependency ticket/reference;
3. time awaiting external authority where the approved SLA measurement rules permit distinction;
4. reconciliation/validation required after upstream recovery.

Reference/sandbox systems must never be silently substituted in production to make an SLA appear met.

## Escalation from Tier-2 to Tier-3

Escalate when one or more apply:

- reproducible product defect;
- code-level analysis required;
- database/schema or release compatibility issue;
- integration adapter/contract failure not explained by ordinary configuration;
- recurring incident requiring root-cause analysis;
- security remediation requiring engineering change;
- performance/capacity issue requiring application engineering;
- failed deployment/rollback/recovery tooling requiring specialist diagnosis.

The escalation package should contain ticket/incident ID, release SHA, affected component, safe reproduction steps, timestamps, correlation IDs and relevant sanitized logs. Do not attach unnecessary claimant data.

## 12-month Tier-3 deliverables

During the accepted support period, Tier-3 should provide evidence appropriate to work received, including:

- technical investigation and defect records;
- tested fixes and release references;
- root-cause/post-incident contributions;
- security remediation evidence;
- integration diagnosis/escalation evidence;
- knowledge/runbook updates;
- monthly workload/service-report inputs;
- handover/knowledge transfer before support closeout.

## Exclusions / separately controlled work

Unless separately approved/contracted:

- new major modules or scope expansion;
- fixes inside CPPS/agency/provider systems not controlled by OWC/Tier-3;
- production actions without authorized change/cutover approval;
- business-data corrections without authoritative owner approval;
- security-control bypasses;
- real payment/replay activity performed merely for testing.

## Operational acceptance

Repository completion of this framework is not SLA activation. Production acceptance requires approved target values, named owners, support contacts, intake tool/process, service hours, escalation channels, monitoring integration and the confirmed 12-month Tier-3 support start/end dates.
