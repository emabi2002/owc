# OWC Drupal Editorial Governance

Workflow states: Draft -> Review -> Approved -> Published -> Archived.

Roles:
- CMS Administrator: Drupal configuration and account administration.
- Content Editor: create and edit drafts and submit for review.
- Reviewer: assess submitted content and return or approve it.
- Publisher / Approver: publish approved content and archive published content.
- Auditor / Read-only: inspect content and revisions without mutation authority.

Anonymous users receive only `access content`. JSON:API is enabled for public consumption, while mutation permissions remain restricted to authenticated editorial roles. Claims and restricted evidence are never stored in Drupal.
