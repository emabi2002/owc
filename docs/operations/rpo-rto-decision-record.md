# OWC Recovery Point / Recovery Time Decision Record

**Status:** Awaiting OWC approval

This record exists so recovery objectives are approved explicitly rather than guessed in code, documentation or vendor configuration.

## Decision metadata

- Decision owner: ______________________________
- Business owner: ______________________________
- Technical owner: _____________________________
- Information/security representative: __________
- CPPS representative/dependency owner: _________
- Date approved: _______________________________
- Review date: _________________________________
- Change/reference number: ______________________

## Business classification

- Service/business process covered: OWC digital portal, claims support services, Drupal CMS and claimant evidence services
- Business operating hours: _____________________
- Peak/critical periods: ________________________
- Maximum tolerable outage: _____________________
- Regulatory/legal/evidence constraints: _________
- CPPS dependency assumptions: __________________
- External agency dependency assumptions: ________

## Approved objectives

> Do not populate these values until formally approved by OWC.

| Recovery class | Approved RPO | Approved RTO | Rationale / authority |
| --- | --- | --- | --- |
| OWC application database | **UNAPPROVED** | **UNAPPROVED** | |
| Claim evidence repository | **UNAPPROVED** | **UNAPPROVED** | |
| Drupal database | **UNAPPROVED** | **UNAPPROVED** | |
| Drupal public media | **UNAPPROVED** | **UNAPPROVED** | |
| Application/CMS release configuration | **UNAPPROVED** | **UNAPPROVED** | |
| Overall public/claims service | **UNAPPROVED** | **UNAPPROVED** | |

## Backup implications after approval

For each approved RPO, record the required backup/PITR frequency and verify that the production provider configuration can meet it.

| Component | Backup/PITR frequency required | Retention required | Off-host/logically separate copy | Monitoring/alerting |
| --- | --- | --- | --- | --- |
| Application database | | | | |
| Evidence repository | | | | |
| Drupal database | | | | |
| Drupal media | | | | |

## Recovery implications after approval

For each approved RTO, confirm:

- recovery infrastructure can be made available within the target;
- required operators are named and reachable;
- database/media/evidence restore procedures fit within the target;
- identity, network and secret recovery are included in elapsed time;
- CPPS and agency reconnection/reconciliation are included where required;
- business validation/sign-off is included in the declared recovery duration.

## Rehearsal evidence

- Rehearsal date: _______________________________
- Backup-set identifier: ________________________
- Measured data-loss point / achieved RPO: _______
- Measured recovery duration / achieved RTO: _____
- Evidence record: ______________________________
- Deviations/corrective actions: _________________

## Approval

By signing this decision record, approvers confirm that the stated recovery objectives reflect OWC business requirements and that the associated cost/operational implications are accepted.

- Business approval: ____________________________
- Technical approval: ___________________________
- Security/risk approval: _______________________
- Date: ________________________________________
