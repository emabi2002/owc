# OWC Restore Rehearsal Evidence Record

Use one completed record for each disaster-recovery restore exercise. Do not mark a rehearsal successful solely because backup commands completed.

## Exercise identification

- Exercise/reference ID: _________________________
- Date: ________________________________________
- Exercise lead: ________________________________
- Technical operators: __________________________
- Business observer/approver: ___________________
- Security/risk observer: _______________________
- Source environment classification: ____________
- Recovery target classification: _______________
- Confirmed non-production target: Yes / No
- `OWC_DR_REHEARSAL_CONFIRM=NONPRODUCTION` used: Yes / No

## Backup set

- Backup-set path/identifier: ____________________
- `backup-manifest.json` present: Yes / No
- Manifest release SHA: _________________________
- Environment label: ____________________________
- Backup creation time: _________________________
- `SHA256SUMS` verification result: Pass / Fail
- Required application DB artifact present: Yes / No / N/A
- Required Drupal DB artifact present: Yes / No / N/A
- Required Drupal media artifact present: Yes / No / N/A
- Required evidence-export artifact present: Yes / No / N/A
- Off-host/logically separate source confirmed: Yes / No / Not yet applicable

## Timings

- Recovery exercise start: ______________________
- Application database restored: ________________
- Drupal database/media restored: _______________
- Evidence repository restored/validated: ________
- Application available: ________________________
- Business validation completed: ________________
- Exercise end: _________________________________
- Total recovery duration: ______________________
- Earliest/latest restored data timestamp: _______
- Measured recovery point/data loss: _____________

## Recovery execution

### Application database

- Isolated target DB ends `_dr_rehearsal`: Yes / No / N/A
- Restore command result: Pass / Fail / N/A
- Schema validation: Pass / Fail / N/A
- Record-count/business sample validation: Pass / Fail / N/A
- Audit records accessible: Pass / Fail / N/A
- Notes: _______________________________________

### Drupal

- Isolated Compose project contains `dr-rehearsal`: Yes / No / N/A
- Database restore: Pass / Fail / N/A
- Media restore: Pass / Fail / N/A
- Drupal local health check: Pass / Fail / N/A
- Public/editorial sample validation: Pass / Fail / N/A
- Notes: _______________________________________

### Claim evidence repository

- Approved isolated private destination used: Yes / No / N/A
- Object/file count reconciled: Pass / Fail / N/A
- Metadata/checksum sampling: Pass / Fail / N/A
- Legal-hold constraints preserved/verified: Pass / Fail / N/A
- Access control/private visibility verified: Pass / Fail / N/A
- Notes: _______________________________________

## Application and integration validation

- OWC `/api/health`: Pass / Fail
- Admin authentication/MFA path: Pass / Fail / N/A
- RBAC sample: Pass / Fail / N/A
- Drupal content retrieval: Pass / Fail / N/A
- Claim tracking/lodgement path: Pass / Fail / N/A
- Evidence access path: Pass / Fail / N/A
- Notification path: Pass / Fail / N/A
- Integration Hub safe connectivity: Pass / Fail / N/A
- No production credentials/endpoints used: Confirmed / Not confirmed

## CPPS and external-authority reconciliation

CPPS/external authority state must not be replayed from the OWC backup.

- Approved CPPS environment used: __________________
- CPPS connectivity validated: Pass / Fail / N/A
- Claim reference/status comparison: Pass / Fail / N/A
- Payment-state comparison: Pass / Fail / N/A
- Mismatches recorded for controlled reconciliation: Yes / No / N/A
- Any payment/external transaction replay attempted: **Must be No**
- External agency reconciliation notes: ____________

## Recovery-objective assessment

- Approved RPO at exercise date: __________________
- Achieved recovery point: ________________________
- RPO met: Yes / No / Not yet approved
- Approved RTO at exercise date: __________________
- Achieved recovery duration: _____________________
- RTO met: Yes / No / Not yet approved

## Findings and corrective actions

| # | Finding | Severity | Owner | Target date | Closure evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

## Final result

- Technical result: Pass / Conditional Pass / Fail
- Business result: Pass / Conditional Pass / Fail
- Security/risk result: Pass / Conditional Pass / Fail
- Production DR acceptance granted by this exercise: Yes / No

### Sign-off

- Exercise lead: __________________ Date: _________
- Technical owner: ________________ Date: _________
- Business owner: _________________ Date: _________
- Security/risk: __________________ Date: _________
